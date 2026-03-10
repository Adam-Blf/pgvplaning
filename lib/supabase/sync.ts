// Sync module: bridges Firestore (real-time) → Supabase (analytics).
// Called after write operations in Firestore to mirror data for reporting.
// All functions are fire-and-forget (non-blocking) to not impact UX performance.

import { supabaseAdmin } from './admin';
import type { LeaveStatus, AuditAction } from './types';

// ──────────────────────────────────────────────────────────────
// Leave History Sync
// ──────────────────────────────────────────────────────────────

/**
 * Mirror a calendar entry to Supabase leave_history table.
 * Only relevant statuses (leave, sick, etc.) are worth tracking for analytics.
 */
export async function syncLeaveEntry(entry: {
    firebaseUserId: string;
    teamId?: string;
    date: string; // YYYY-MM-DD
    status: string;
    isHalfDay?: boolean;
    halfDayType?: 'am' | 'pm';
    approved?: boolean;
}) {
    // Only sync leave-related statuses (not regular office days)
    const analyticsStatuses: LeaveStatus[] = ['conges', 'maladie', 'formation', 'teletravail', 'bureau', 'autre'];
    if (!analyticsStatuses.includes(entry.status as LeaveStatus)) return;

    const { error } = await supabaseAdmin.from('leave_history').upsert({
        firebase_user_id: entry.firebaseUserId,
        team_id: entry.teamId || null,
        date: entry.date,
        status: entry.status as LeaveStatus,
        is_half_day: entry.isHalfDay || false,
        half_day_type: entry.halfDayType || null,
        approved: entry.approved || false,
    } as any, { onConflict: 'firebase_user_id,date,status' }).select();

    if (error) {
        // Non-blocking: log but don't throw — Firestore is the source of truth
        console.error('[Supabase sync] syncLeaveEntry failed:', error.message);
    }
}

// ──────────────────────────────────────────────────────────────
// Audit Log
// ──────────────────────────────────────────────────────────────

/**
 * Record an audit event in Supabase audit_log table.
 * Used for compliance, security tracing, and HR audit trail.
 */
export async function logAuditEvent(event: {
    firebaseUserId: string;
    action: AuditAction;
    resourceType?: string;
    resourceId?: string;
    previousData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    ipAddress?: string;
}) {
    const { error } = await supabaseAdmin.from('audit_log').insert({
        firebase_user_id: event.firebaseUserId,
        action: event.action,
        resource_type: event.resourceType || null,
        resource_id: event.resourceId || null,
        previous_data: event.previousData || null,
        new_data: event.newData || null,
        ip_address: event.ipAddress || null,
    } as any);

    if (error) {
        console.error('[Supabase sync] logAuditEvent failed:', error.message);
    }
}

// ──────────────────────────────────────────────────────────────
// Monthly Stats Computation
// ──────────────────────────────────────────────────────────────

/**
 * Compute and store monthly team statistics in Supabase.
 * Aggregates leave_history entries for a given team/month.
 */
export async function computeAndStoreMonthlyStats(teamId: string, month: string) {
    const monthStart = `${month}-01`;
    const monthEnd = new Date(new Date(monthStart).setMonth(new Date(monthStart).getMonth() + 1))
        .toISOString().split('T')[0];

    const { data: entries, error } = await supabaseAdmin
        .from('leave_history')
        .select('status, is_half_day, firebase_user_id')
        .eq('team_id', teamId)
        .gte('date', monthStart)
        .lt('date', monthEnd);

    if (error || !entries) return;

    const typedEntries = entries as any[];

    // Count unique members
    const uniqueMembers = new Set(entries.map((e: any) => e.firebase_user_id)).size;

    // Aggregate by status (count half-days as 0.5)
    const aggregate = entries.reduce((acc, e: any) => {
        const weight = e.is_half_day ? 0.5 : 1;
        if (e.status === 'conges') acc.leave += weight;
        if (e.status === 'teletravail') acc.remote += weight;
        if (e.status === 'maladie') acc.sick += weight;
        return acc;
    }, { leave: 0, remote: 0, sick: 0 });

    await supabaseAdmin.from('team_monthly_stats').upsert({
        team_id: teamId,
        month: monthStart,
        total_leave_days: aggregate.leave,
        total_remote_days: aggregate.remote,
        total_sick_days: aggregate.sick,
        member_count: uniqueMembers,
    } as any, { onConflict: 'team_id,month' });
}
