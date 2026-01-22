/**
 * Application Constants
 * Configuration values and mappings for the application
 */

import type { CalendarStatus, EmployeeType, TeamRole, StatusConfig } from './database';

// =============================================================================
// STATUS CONFIGURATION
// =============================================================================

/**
 * Status configuration for UI display
 * Maps CalendarStatus to visual properties
 */
export const STATUS_CONFIG: Record<CalendarStatus, StatusConfig> = {
  WORK: {
    label: 'Bureau',
    shortLabel: 'B',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    icon: 'Building2',
    deductsLeave: false,
  },
  REMOTE: {
    label: 'Teletravail',
    shortLabel: 'TT',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    icon: 'Home',
    deductsLeave: false,
  },
  SCHOOL: {
    label: 'Formation',
    shortLabel: 'F',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/20',
    borderColor: 'border-violet-500/30',
    icon: 'GraduationCap',
    deductsLeave: false,
  },
  TRAINER: {
    label: 'Formateur',
    shortLabel: 'FR',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    icon: 'Presentation',
    deductsLeave: false,
  },
  LEAVE: {
    label: 'Conges',
    shortLabel: 'CP',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    icon: 'Palmtree',
    deductsLeave: true,
  },
  HOLIDAY: {
    label: 'Jour ferie',
    shortLabel: 'JF',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-500/30',
    icon: 'CalendarOff',
    deductsLeave: false,
  },
  OFF: {
    label: 'RTT',
    shortLabel: 'RTT',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    icon: 'Coffee',
    deductsLeave: false,
  },
  SICK: {
    label: 'Maladie',
    shortLabel: 'M',
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    icon: 'Thermometer',
    deductsLeave: true,
  },
  MISSION: {
    label: 'Mission',
    shortLabel: 'MI',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    icon: 'Briefcase',
    deductsLeave: false,
  },
} as const;

/**
 * All available calendar statuses
 */
export const CALENDAR_STATUSES: CalendarStatus[] = [
  'WORK',
  'REMOTE',
  'SCHOOL',
  'TRAINER',
  'LEAVE',
  'HOLIDAY',
  'OFF',
  'SICK',
  'MISSION',
] as const;

/**
 * Statuses that count against leave balance
 */
export const LEAVE_DEDUCTING_STATUSES: CalendarStatus[] = ['LEAVE', 'SICK'] as const;

/**
 * Statuses for "working" days
 */
export const WORKING_STATUSES: CalendarStatus[] = [
  'WORK',
  'REMOTE',
  'SCHOOL',
  'TRAINER',
  'MISSION',
] as const;

// =============================================================================
// EMPLOYEE TYPE CONFIGURATION
// =============================================================================

/**
 * Employee type configuration with leave days
 */
export const EMPLOYEE_TYPE_CONFIG: Record<
  EmployeeType,
  { label: string; annualLeaveDays: number; description: string }
> = {
  employee: {
    label: 'Employe',
    annualLeaveDays: 25,
    description: '25 jours de conges annuels',
  },
  executive: {
    label: 'Cadre',
    annualLeaveDays: 30,
    description: '30 jours de conges annuels',
  },
} as const;

// =============================================================================
// ROLE CONFIGURATION
// =============================================================================

/**
 * Team role configuration
 */
export const ROLE_CONFIG: Record<
  TeamRole,
  { label: string; description: string; permissions: string[] }
> = {
  leader: {
    label: 'Leader',
    description: 'Controle total de l\'equipe',
    permissions: [
      'Supprimer l\'equipe',
      'Promouvoir/retrograder les admins',
      'Gerer tous les membres',
      'Modifier les parametres de l\'equipe',
      'Creer des invitations',
      'Modifier le calendrier de tous',
    ],
  },
  admin: {
    label: 'Admin',
    description: 'Peut gerer les membres et le calendrier',
    permissions: [
      'Gerer les membres',
      'Creer des invitations',
      'Modifier le calendrier de tous',
      'Voir les statistiques',
    ],
  },
  member: {
    label: 'Membre',
    description: 'Membre standard de l\'equipe',
    permissions: [
      'Modifier son propre calendrier',
      'Voir le calendrier de l\'equipe',
      'Voir les statistiques personnelles',
    ],
  },
} as const;

// =============================================================================
// TEAM SECTOR CONFIGURATION
// =============================================================================

/**
 * Team sector configuration
 */
export const SECTOR_CONFIG: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  tech: {
    label: 'Tech',
    icon: 'Code',
    color: 'text-blue-500',
  },
  marketing: {
    label: 'Marketing',
    icon: 'Megaphone',
    color: 'text-pink-500',
  },
  sales: {
    label: 'Commercial',
    icon: 'TrendingUp',
    color: 'text-green-500',
  },
  hr: {
    label: 'RH',
    icon: 'Users',
    color: 'text-purple-500',
  },
  finance: {
    label: 'Finance',
    icon: 'DollarSign',
    color: 'text-emerald-500',
  },
  operations: {
    label: 'Operations',
    icon: 'Settings',
    color: 'text-orange-500',
  },
  support: {
    label: 'Support',
    icon: 'Headphones',
    color: 'text-cyan-500',
  },
  other: {
    label: 'Autre',
    icon: 'MoreHorizontal',
    color: 'text-gray-500',
  },
} as const;

// =============================================================================
// APPLICATION CONSTANTS
// =============================================================================

/**
 * Team code configuration
 */
export const TEAM_CODE = {
  LENGTH: 8,
  CHARACTERS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Excludes confusing chars: 0, O, I, 1
  PATTERN: /^[A-Z0-9]{8}$/,
} as const;

/**
 * Invitation defaults
 */
export const INVITATION_DEFAULTS = {
  EXPIRY_DAYS: 7,
  MAX_USES: null, // Unlimited by default
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  API_GENERAL: { requests: 30, windowMs: 60000 }, // 30 req/min
  API_AUTH: { requests: 10, windowMs: 60000 }, // 10 req/min
  API_EXPORT: { requests: 5, windowMs: 60000 }, // 5 req/min
} as const;

/**
 * Audit log retention
 */
export const AUDIT_LOG_RETENTION_DAYS = 90;

/**
 * Calendar display settings
 */
export const CALENDAR_SETTINGS = {
  WEEKS_TO_SHOW: 6, // Max weeks in month view
  FIRST_DAY_OF_WEEK: 1, // Monday
  LOCALE: 'fr-FR',
  TIMEZONE: 'Europe/Paris',
} as const;

/**
 * French public holidays (static ones)
 * Dynamic holidays (Easter, etc.) are calculated by date-holidays
 */
export const FRENCH_STATIC_HOLIDAYS: Record<string, string> = {
  '01-01': 'Jour de l\'An',
  '05-01': 'Fete du Travail',
  '05-08': 'Victoire 1945',
  '07-14': 'Fete Nationale',
  '08-15': 'Assomption',
  '11-01': 'Toussaint',
  '11-11': 'Armistice',
  '12-25': 'Noel',
} as const;
