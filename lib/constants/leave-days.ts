/**
 * Leave days configuration constants
 * Single source of truth for sectors, employee types and leave allowances
 */

// ============================================
// SECTOR CONFIGURATION
// ============================================

export const SECTOR_CONFIG = {
  public: {
    type: 'public' as const,
    label: 'Secteur Public',
    labelShort: 'Public',
    description: 'Jours de congés déterminés par le statut (Employé/Cadre)',
    icon: 'building-2',
    allowCustomDays: false,
  },
  private: {
    type: 'private' as const,
    label: 'Secteur Privé',
    labelShort: 'Privé',
    description: 'Nombre de jours de congés personnalisable',
    icon: 'briefcase',
    allowCustomDays: true,
  },
} as const;

export type Sector = keyof typeof SECTOR_CONFIG;

/**
 * Get sector options for forms
 */
export function getSectorOptions() {
  return Object.entries(SECTOR_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.label,
    labelShort: config.labelShort,
    description: config.description,
    allowCustomDays: config.allowCustomDays,
  }));
}

// ============================================
// EMPLOYEE TYPE CONFIGURATION (PUBLIC SECTOR)
// ============================================

export const LEAVE_DAYS_CONFIG = {
  employee: {
    type: 'employee' as const,
    label: 'Employé',
    labelFull: 'Employé',
    defaultDays: 25,
    icon: 'briefcase',
    description: '25 jours de congés par an',
  },
  executive: {
    type: 'executive' as const,
    label: 'Cadre',
    labelFull: 'Cadre / Dirigeant',
    defaultDays: 30,
    icon: 'graduation-cap',
    description: '30 jours de congés par an',
  },
} as const;

export type EmployeeType = keyof typeof LEAVE_DAYS_CONFIG;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get default leave days for an employee type (public sector)
 */
export function getDefaultLeaveDays(employeeType: EmployeeType): number {
  return LEAVE_DAYS_CONFIG[employeeType].defaultDays;
}

/**
 * Get leave days based on sector and employee type
 */
export function getLeaveDays(
  sector: Sector,
  employeeType: EmployeeType,
  customDays?: number
): number {
  if (sector === 'public') {
    // Public sector: determined by employee type
    return LEAVE_DAYS_CONFIG[employeeType].defaultDays;
  }
  // Private sector: use custom days or default
  return customDays ?? 25;
}

/**
 * Get label for an employee type
 */
export function getEmployeeTypeLabel(employeeType: EmployeeType): string {
  return LEAVE_DAYS_CONFIG[employeeType].label;
}

/**
 * Validate that leave days are within acceptable range
 */
export function validateLeaveDays(days: number): boolean {
  return Number.isInteger(days) && days >= 0 && days <= 60;
}

/**
 * Get the employee type options for forms (public sector)
 */
export function getEmployeeTypeOptions() {
  return Object.entries(LEAVE_DAYS_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.labelFull,
    defaultDays: config.defaultDays,
    description: config.description,
  }));
}

/**
 * Check if sector allows custom leave days
 */
export function allowsCustomLeaveDays(sector: Sector): boolean {
  return SECTOR_CONFIG[sector].allowCustomDays;
}

/**
 * Default leave days for private sector
 */
export const PRIVATE_SECTOR_DEFAULT_DAYS = 25;
export const MIN_LEAVE_DAYS = 0;
export const MAX_LEAVE_DAYS = 60;
