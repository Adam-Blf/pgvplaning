import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { LeaveHistoryRow } from '@/lib/supabase/types';
import { checkRateLimit, getIdentifier } from '@/lib/security/rate-limit';
import { parseSearchParams, exportQuerySchema } from '@/lib/security/validation';

// API route: GET /api/analytics/export?teamId=xxx&year=2025
// Returns CSV export of leave history for a team/year from Supabase
export async function GET(request: Request) {
    // Rate limiting: 30 exports per 5 minutes per IP
    const id = getIdentifier(request);
    const rl = checkRateLimit(`export:${id}`, { maxRequests: 30, windowMs: 5 * 60_000 });
    if (!rl.success) {
        return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans quelques minutes.' }, {
            status: 429,
            headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        });
    }

    // Validate query params with Zod
    const { searchParams } = new URL(request.url);
    const parsed = parseSearchParams(searchParams, exportQuerySchema);
    if (parsed.error) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const teamId = parsed.data!.teamId;
    const year = parsed.data!.year ?? new Date().getFullYear();

    // Explicit cast to bypass Supabase's `never` inference on partial selects
    const { data, error } = await supabaseAdmin
        .from('leave_history')
        .select('firebase_user_id, date, status, is_half_day, half_day_type, approved, created_at')
        .eq('team_id', teamId)
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`)
        .order('date', { ascending: true }) as {
            data: Pick<LeaveHistoryRow, 'firebase_user_id' | 'date' | 'status' | 'is_half_day' | 'half_day_type' | 'approved' | 'created_at'>[] | null;
            error: unknown;
        };

    if (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Build CSV
    const headers = ['Utilisateur,Date,Type,Demi-journee,Type demi-j,Approuve,Cree le'];
    const rows = (data || []).map(row => [
        row.firebase_user_id,
        row.date,
        row.status,
        row.is_half_day ? 'Oui' : 'Non',
        row.half_day_type || '',
        row.approved ? 'Oui' : 'Non',
        row.created_at,
    ].join(','));

    const csv = [...headers, ...rows].join('\n');

    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="absences_${teamId}_${year}.csv"`,
        },
    });
}
