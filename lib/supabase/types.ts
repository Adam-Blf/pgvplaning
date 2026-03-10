// TypeScript types for Supabase tables.
// Generated manually to match the SQL schema defined in supabase/migrations/.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            leave_history: {
                Row: {
                    id: string;
                    firebase_user_id: string;
                    team_id: string | null;
                    date: string; // ISO date string (YYYY-MM-DD)
                    status: LeaveStatus;
                    is_half_day: boolean;
                    half_day_type: 'am' | 'pm' | null;
                    approved: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['leave_history']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['leave_history']['Insert']>;
            };
            audit_log: {
                Row: {
                    id: string;
                    firebase_user_id: string;
                    action: AuditAction;
                    resource_type: string | null;
                    resource_id: string | null;
                    previous_data: Json | null;
                    new_data: Json | null;
                    ip_address: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>;
                Update: never;
            };
            team_monthly_stats: {
                Row: {
                    id: string;
                    team_id: string;
                    month: string; // YYYY-MM-01
                    total_leave_days: number;
                    total_remote_days: number;
                    total_sick_days: number;
                    member_count: number;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['team_monthly_stats']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['team_monthly_stats']['Insert']>;
            };
        };
    };
}

// Typed enums for better DX
export type LeaveStatus = 'conges' | 'maladie' | 'formation' | 'teletravail' | 'bureau' | 'autre';

export type AuditAction =
    | 'user_registered'
    | 'user_verified'
    | 'contract_updated'
    | 'leave_approved'
    | 'leave_rejected'
    | 'team_joined'
    | 'team_created'
    | 'leave_balance_updated';

// Convenience type aliases
export type LeaveHistoryRow = Database['public']['Tables']['leave_history']['Row'];
export type AuditLogRow = Database['public']['Tables']['audit_log']['Row'];
export type TeamMonthlyStatsRow = Database['public']['Tables']['team_monthly_stats']['Row'];
