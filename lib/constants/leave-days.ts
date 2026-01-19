/**
 * Leave days configuration constants
 * Single source of truth for employee types and leave allowances
 */

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

/**
 * Get default leave days for an employee type
 */
export function getDefaultLeaveDays(employeeType: EmployeeType): number {
  return LEAVE_DAYS_CONFIG[employeeType].defaultDays;
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
 * Get the employee type options for forms
 */
export function getEmployeeTypeOptions() {
  return Object.entries(LEAVE_DAYS_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.labelFull,
    defaultDays: config.defaultDays,
    description: config.description,
  }));
}
