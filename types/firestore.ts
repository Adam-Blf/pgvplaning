import { Timestamp } from 'firebase/firestore';

export type UserRole = 'super_admin' | 'leader' | 'moderator' | 'member';
export type EmployeeType = 'cdi' | 'cdd' | 'apprentissage' | 'professionnalisation' | 'stage' | 'interim' | 'freelance' | 'mandataire' | 'public' | 'vacataire';
export type WorkTimeCategory = 'temps-plein' | 'temps-partiel' | 'forfait-jours' | 'forfait-heures';
export type SectorType = 'public' | 'prive';

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    role: UserRole;
    employeeType: EmployeeType;
    workTimeCategory: WorkTimeCategory;
    workTimePercentage?: number;
    weeklyHours?: number; // Heures/semaine définies par le leader (ex: 38)
    sector: SectorType;
    teamId?: string;
    leaveBalance: {
        total: number;
        used: number;
        remaining: number;
    };
    bonusDays?: number; // Jours bonus optionnels (0-3), attribués par le leader
    recoveryHours?: number; // Heures récup (heures sup), compteur séparé non déduit des CP
    color?: string;
    icalToken?: string;
    birth_date?: string;
    first_name?: string;
    last_name?: string;
    emailNotif?: boolean;
    teamAlerts?: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface TeamMember {
    id: string; // format: {teamId}_{userId}
    teamId: string;
    userId: string;
    role: UserRole;
    status: 'pending' | 'approved' | 'rejected';
    employee_type?: EmployeeType;
    work_time_category?: WorkTimeCategory;
    weeklyHours?: number;
    bonusDays?: number;
    recoveryHours?: number;
    annual_leave_days?: number;
    leave_balance?: number;
    color?: string;
    joinedAt: Timestamp;
    updatedAt?: Timestamp;
}

export interface PreCreatedMember {
    id: string; // token UUID
    teamId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdBy: string;
    status: 'pending_registration' | 'registered';
    weeklyHours?: number;
    token: string;
    createdAt: Timestamp;
    expiresAt?: Timestamp;
}

export interface Team {
    id: string;
    name: string;
    uniqueCode: string;
    leaderId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    settings: {
        allowMemberInvite: boolean;
        autoApproveAbsences: boolean;
        minPresenceRequired?: number;
    };
    teamIcalToken?: string;
}

export type AbsenceStatus = 'bureau' | 'teletravail' | 'formation' | 'conges' | 'maladie' | 'autre';

export interface CalendarEntry {
    id: string;
    userId: string;
    teamId: string;
    date: Timestamp;
    status: AbsenceStatus;
    isHalfDay: boolean;
    halfDayType?: 'am' | 'pm';
    comment?: string;
    approved: boolean;
    approvedBy?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    attachmentUrl?: string;
}

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    resourceType: 'auth' | 'team' | 'calendar' | 'profile';
    resourceId: string;
    previousData?: any;
    newData?: any;
    timestamp: Timestamp;
    ipAddress?: string;
}

export interface TeamInvitation {
    id: string;
    teamId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    type: 'code' | 'link' | 'pre-created';
    expiresAt: Timestamp;
    createdBy: string;
    used: boolean;
    token: string;
}
