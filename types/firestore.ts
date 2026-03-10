import { Timestamp } from 'firebase/firestore';

export type UserRole = 'leader' | 'admin' | 'member';
export type EmployeeType = 'cdi' | 'cdd' | 'apprentissage' | 'professionnalisation' | 'stage' | 'interim' | 'freelance' | 'mandataire' | 'public' | 'vacataire';
export type WorkTimeCategory = 'temps-plein' | 'temps-partiel' | 'forfait-jours' | 'forfait-heures';
export type SectorType = 'public' | 'prive';

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    employeeType: EmployeeType;
    workTimeCategory: WorkTimeCategory;
    workTimePercentage?: number; // Pour le temps partiel (ex: 80)
    sector: SectorType;
    teamId?: string;
    leaveBalance: {
        total: number;
        used: number;
        remaining: number;
    };
    color?: string;
    icalToken?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Team {
    id: string;
    name: string;
    uniqueCode: string; // 8 chars
    leaderId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    settings: {
        allowMemberInvite: boolean;
        autoApproveAbsences: boolean;
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
    attachmentUrl?: string; // Pour les justificatifs
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
    id: string; // token
    teamId: string;
    email?: string; // Optionnel
    role: UserRole;
    expiresAt: Timestamp;
    createdBy: string;
    used: boolean;
}
