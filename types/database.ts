/**
 * Database Types for Supabase
 * Auto-generated from SQL schema - DO NOT EDIT MANUALLY
 * Last updated: 2026-01-22
 */

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Role enum for team members
 * - leader: Full control over team (can delete team, manage all members)
 * - admin: Can manage members and calendar entries
 * - member: Standard team member
 */
export type TeamRole = 'leader' | 'admin' | 'member';

/**
 * Employee type determining annual leave days
 * - employee: 25 days annual leave
 * - executive: 30 days annual leave
 */
export type EmployeeType = 'employee' | 'executive';

/**
 * Calendar entry status types
 * - WORK: Working at office
 * - REMOTE: Working remotely / Telework
 * - SCHOOL: In training/school
 * - TRAINER: Acting as trainer
 * - LEAVE: Paid leave (deducted from balance)
 * - HOLIDAY: Public holiday (not deducted)
 * - OFF: Day off (RTT, etc.)
 * - SICK: Sick leave (deducted from balance)
 * - MISSION: Work mission/travel
 */
export type CalendarStatus =
  | 'WORK'
  | 'REMOTE'
  | 'SCHOOL'
  | 'TRAINER'
  | 'LEAVE'
  | 'HOLIDAY'
  | 'OFF'
  | 'SICK'
  | 'MISSION';

/**
 * Half-day indicator for calendar entries
 * - FULL: Full day
 * - AM: Morning only (0.5 day)
 * - PM: Afternoon only (0.5 day)
 */
export type HalfDay = 'FULL' | 'AM' | 'PM';

/**
 * Team sector/department types
 */
export type TeamSector =
  | 'tech'
  | 'marketing'
  | 'sales'
  | 'hr'
  | 'finance'
  | 'operations'
  | 'support'
  | 'other';

// =============================================================================
// TABLE TYPES
// =============================================================================

/**
 * User profile (synced with auth.users)
 */
export interface Profile {
  id: string; // UUID, references auth.users
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  birthday: string | null; // DATE as ISO string
  current_team_id: string | null; // UUID, references teams
  created_at: string; // TIMESTAMPTZ as ISO string
  updated_at: string; // TIMESTAMPTZ as ISO string
}

/**
 * Team entity
 */
export interface Team {
  id: string; // UUID
  name: string;
  code: string; // 8-character unique code
  description: string | null;
  sector: TeamSector | null;
  created_by: string | null; // UUID, references auth.users
  created_at: string; // TIMESTAMPTZ as ISO string
  updated_at: string; // TIMESTAMPTZ as ISO string
}

/**
 * Team membership (junction table)
 */
export interface TeamMember {
  id: string; // UUID
  user_id: string; // UUID, references auth.users
  team_id: string; // UUID, references teams
  role: TeamRole;
  employee_type: EmployeeType;
  annual_leave_days: number;
  leave_balance: number;
  leave_balance_year: number;
  joined_at: string; // TIMESTAMPTZ as ISO string
}

/**
 * Calendar entry for tracking absences/presence
 */
export interface CalendarEntry {
  id: string; // UUID
  team_id: string; // UUID, references teams
  user_id: string; // UUID, references auth.users
  date: string; // DATE as ISO string (YYYY-MM-DD)
  status: CalendarStatus;
  half_day: HalfDay;
  updated_by: string | null; // UUID, references auth.users
  created_at: string; // TIMESTAMPTZ as ISO string
  updated_at: string; // TIMESTAMPTZ as ISO string
}

/**
 * Team invitation link
 */
export interface TeamInvitation {
  id: string; // UUID
  team_id: string; // UUID, references teams
  token: string; // Unique invitation token
  created_by: string | null; // UUID, references auth.users
  expires_at: string; // TIMESTAMPTZ as ISO string
  max_uses: number | null;
  use_count: number;
  is_active: boolean;
  created_at: string; // TIMESTAMPTZ as ISO string
}

/**
 * Audit log for security-critical operations
 */
export interface AuditLog {
  id: string; // UUID
  user_id: string | null; // UUID, references auth.users
  action: string;
  resource_type: string;
  resource_id: string | null; // UUID
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string; // TIMESTAMPTZ as ISO string
}

// =============================================================================
// VIEW TYPES
// =============================================================================

/**
 * Aggregated leave statistics per team
 */
export interface TeamLeaveStatistics {
  team_id: string;
  total_members: number;
  total_annual_days: number;
  total_remaining_days: number;
  total_used_days: number;
  avg_remaining_days: number;
  executive_count: number;
  employee_count: number;
}

/**
 * Leave statistics grouped by status type
 */
export interface TeamLeaveStatsByStatus {
  team_id: string;
  user_id: string;
  status: CalendarStatus;
  year: number;
  full_days: number;
  half_days: number;
  total_days: number;
}

// =============================================================================
// FUNCTION RETURN TYPES
// =============================================================================

/**
 * Return type for get_user_team function
 */
export interface UserTeamInfo {
  team_id: string;
  team_name: string;
  team_code: string;
  user_role: TeamRole;
}

/**
 * Return type for get_leave_info function
 */
export interface LeaveInfo {
  employee_type: EmployeeType;
  annual_leave_days: number;
  leave_balance: number;
  leave_balance_year: number;
  used_days: number;
}

/**
 * Return type for get_leave_days_by_status function
 */
export interface LeaveDaysByStatus {
  status: CalendarStatus;
  total_days: number;
  full_days: number;
  half_days: number;
}

/**
 * Return type for validate_invitation function
 */
export interface InvitationValidation {
  is_valid: boolean;
  team_id: string | null;
  team_name: string | null;
  error_message: string | null;
}

/**
 * Return type for use_invitation and join_team_by_code functions
 */
export interface JoinTeamResult {
  success: boolean;
  team_id: string | null;
  team_name: string | null;
  error_message: string | null;
}

// =============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'code' | 'created_at' | 'updated_at'> & {
          id?: string;
          code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Team, 'id' | 'code'>>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'joined_at' | 'annual_leave_days' | 'leave_balance' | 'leave_balance_year'> & {
          id?: string;
          joined_at?: string;
          annual_leave_days?: number;
          leave_balance?: number;
          leave_balance_year?: number;
        };
        Update: Partial<Omit<TeamMember, 'id' | 'user_id' | 'team_id'>>;
      };
      calendar_entries: {
        Row: CalendarEntry;
        Insert: Omit<CalendarEntry, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          half_day?: HalfDay;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CalendarEntry, 'id' | 'team_id' | 'user_id'>>;
      };
      team_invitations: {
        Row: TeamInvitation;
        Insert: Omit<TeamInvitation, 'id' | 'use_count' | 'is_active' | 'created_at'> & {
          id?: string;
          use_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<TeamInvitation, 'id' | 'team_id' | 'token'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'> & {
          id?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: never; // Audit logs should never be updated
      };
    };
    Views: {
      team_leave_statistics: {
        Row: TeamLeaveStatistics;
      };
      team_leave_stats_by_status: {
        Row: TeamLeaveStatsByStatus;
      };
    };
    Functions: {
      generate_team_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_user_team_ids: {
        Args: { p_user_id: string };
        Returns: string[];
      };
      is_team_leader: {
        Args: { p_user_id: string; p_team_id: string };
        Returns: boolean;
      };
      is_team_admin: {
        Args: { p_user_id: string; p_team_id: string };
        Returns: boolean;
      };
      get_user_team: {
        Args: { p_user_id: string };
        Returns: UserTeamInfo[];
      };
      user_has_team: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      get_leave_info: {
        Args: { p_user_id: string; p_team_id: string };
        Returns: LeaveInfo[];
      };
      get_leave_days_by_status: {
        Args: { p_user_id: string; p_team_id: string };
        Returns: LeaveDaysByStatus[];
      };
      validate_invitation: {
        Args: { p_token: string };
        Returns: InvitationValidation[];
      };
      use_invitation: {
        Args: { p_token: string; p_user_id: string };
        Returns: JoinTeamResult[];
      };
      join_team_by_code: {
        Args: {
          p_user_id: string;
          p_team_code: string;
          p_employee_type?: EmployeeType;
          p_annual_leave_days?: number;
        };
        Returns: JoinTeamResult[];
      };
      promote_to_admin: {
        Args: { p_leader_id: string; p_user_id: string };
        Returns: boolean;
      };
      demote_from_admin: {
        Args: { p_leader_id: string; p_user_id: string };
        Returns: boolean;
      };
      create_audit_log: {
        Args: {
          p_user_id: string;
          p_action: string;
          p_resource_type: string;
          p_resource_id?: string;
          p_metadata?: Record<string, unknown>;
          p_ip_address?: string;
          p_user_agent?: string;
        };
        Returns: string;
      };
      cleanup_old_audit_logs: {
        Args: Record<string, never>;
        Returns: number;
      };
      cleanup_expired_invitations: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      team_role: TeamRole;
      employee_type: EmployeeType;
      calendar_status: CalendarStatus;
      half_day: HalfDay;
      team_sector: TeamSector;
    };
  };
}
