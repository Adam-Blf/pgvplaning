/**
 * Audit logging system for security-critical operations
 * Logs are stored in Supabase for compliance and monitoring
 */

import { createAdminClient } from '@/lib/supabase/server';

export interface AuditLogParams {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Create an audit log entry
 * Uses admin client to bypass RLS for logging
 */
export async function createAuditLog(params: AuditLogParams): Promise<{ success: boolean; error?: unknown }> {
  try {
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('audit_logs')
      .insert({
        user_id: params.userId,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId || null,
        metadata: params.metadata || {},
        ip_address: params.ip || null,
        user_agent: params.userAgent || null,
      });

    if (error) {
      console.error('[Audit] Failed to create log:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('[Audit] Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Extract client info from request headers
 */
export function getClientInfo(headers: Headers): { ip: string | null; userAgent: string | null } {
  const forwardedFor = headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : headers.get('x-real-ip');
  const userAgent = headers.get('user-agent');

  return { ip, userAgent };
}

/**
 * Audit action types for consistency
 */
export const AUDIT_ACTIONS = {
  // Authentication
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_SIGNUP: 'auth.signup',

  // Teams
  TEAM_CREATE: 'team.create',
  TEAM_DELETE: 'team.delete',
  TEAM_UPDATE: 'team.update',
  TEAM_JOIN: 'team.join',
  TEAM_LEAVE: 'team.leave',

  // Members
  MEMBER_ROLE_CHANGE: 'member.role_change',
  MEMBER_REMOVE: 'member.remove',

  // Calendar
  CALENDAR_EXPORT: 'calendar.export',

  // Leave
  LEAVE_REQUEST: 'leave.request',
  LEAVE_BALANCE_RESET: 'leave.balance_reset',

  // Security
  RATE_LIMIT_EXCEEDED: 'security.rate_limit',
  UNAUTHORIZED_ACCESS: 'security.unauthorized',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

/**
 * Convenience function for logging with request context
 */
export async function auditWithRequest(
  request: Request,
  params: Omit<AuditLogParams, 'ip' | 'userAgent'>
): Promise<{ success: boolean; error?: unknown }> {
  const { ip, userAgent } = getClientInfo(request.headers);
  return createAuditLog({
    ...params,
    ip,
    userAgent,
  });
}
