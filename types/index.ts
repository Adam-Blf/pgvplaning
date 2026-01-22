/**
 * Central Types Export
 * All application types should be imported from this file
 */

// Database types
export * from './database';

// Constants
export * from './constants';

// Re-export commonly used types with aliases for convenience
export type {
  Profile as User,
  Team,
  TeamMember,
  CalendarEntry,
  TeamInvitation,
  AuditLog,
  TeamRole,
  EmployeeType,
  CalendarStatus,
  HalfDay,
  TeamSector,
  Database,
} from './database';

// =============================================================================
// APPLICATION-LEVEL TYPES
// =============================================================================

/**
 * Extended profile with team information
 */
export interface UserWithTeam {
  id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  birthday: string | null;
  team: {
    id: string;
    name: string;
    code: string;
    role: import('./database').TeamRole;
    employee_type: import('./database').EmployeeType;
    leave_balance: number;
    annual_leave_days: number;
  } | null;
}

/**
 * Calendar day representation for the UI
 */
export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD format
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isCurrentMonth: boolean;
  entries: CalendarDayEntry[];
}

/**
 * Calendar entry for a specific user on a specific day
 */
export interface CalendarDayEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  status: import('./database').CalendarStatus;
  halfDay: import('./database').HalfDay;
}

/**
 * Team member with profile information
 */
export interface TeamMemberWithProfile {
  id: string;
  user_id: string;
  team_id: string;
  role: import('./database').TeamRole;
  employee_type: import('./database').EmployeeType;
  annual_leave_days: number;
  leave_balance: number;
  joined_at: string;
  profile: {
    email: string | null;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    birthday: string | null;
  };
}

/**
 * Calendar statistics for dashboard
 */
export interface CalendarStats {
  totalDays: number;
  workDays: number;
  remoteDays: number;
  leaveDays: number;
  sickDays: number;
  trainingDays: number;
  trainerDays: number;
  missionDays: number;
  offDays: number;
  remainingLeave: number;
  annualLeave: number;
}

/**
 * Status configuration for UI display
 */
export interface StatusConfig {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  deductsLeave: boolean;
}

/**
 * Month view configuration
 */
export interface MonthView {
  year: number;
  month: number; // 0-indexed (0 = January)
  startDate: Date;
  endDate: Date;
  weeks: CalendarDay[][];
}

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// =============================================================================
// FORM TYPES
// =============================================================================

/**
 * Create team form data
 */
export interface CreateTeamForm {
  name: string;
  description?: string;
  sector?: import('./database').TeamSector;
}

/**
 * Join team form data
 */
export interface JoinTeamForm {
  code: string;
  employee_type: import('./database').EmployeeType;
  annual_leave_days?: number;
}

/**
 * Update profile form data
 */
export interface UpdateProfileForm {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  birthday?: string;
}

/**
 * Create invitation form data
 */
export interface CreateInvitationForm {
  expires_in_days: number;
  max_uses?: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract non-null type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Date range for filtering
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Filter options for calendar queries
 */
export interface CalendarFilter {
  teamId: string;
  userId?: string;
  dateRange?: DateRange;
  statuses?: import('./database').CalendarStatus[];
}
