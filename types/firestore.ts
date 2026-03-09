import { Timestamp } from 'firebase/firestore';

export type UserRole = 'leader' | 'admin' | 'member';
export type EmployeeType = 'cadre' | 'non-cadre' | 'stagiaire' | 'alternant' | 'cdd' | 'interim';
export type SectorType = 'public' | 'prive';

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    employeeType: EmployeeType;
    sector: SectorType;
    teamId?: string;
    leaveBalance: {
        total: number;
        used: number;
        remaining: number;
    };
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
