/**
 * Zod Schemas for Server Actions
 * Validation schemas for all form inputs and API requests
 */

import { z } from 'zod';

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('ID invalide');

/**
 * Date string schema (YYYY-MM-DD format)
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)');

/**
 * Team code schema (8 uppercase alphanumeric characters)
 */
export const teamCodeSchema = z
  .string()
  .length(8, 'Le code doit contenir 8 caracteres')
  .regex(/^[A-Z0-9]+$/, 'Le code ne doit contenir que des lettres majuscules et chiffres')
  .transform((val) => val.toUpperCase());

// =============================================================================
// ENUM SCHEMAS
// =============================================================================

/**
 * Team role enum
 */
export const teamRoleSchema = z.enum(['leader', 'admin', 'member'], {
  errorMap: () => ({ message: 'Role invalide' }),
});

/**
 * Employee type enum
 */
export const employeeTypeSchema = z.enum(['employee', 'executive'], {
  errorMap: () => ({ message: 'Type employe invalide' }),
});

/**
 * Calendar status enum
 */
export const calendarStatusSchema = z.enum(
  ['WORK', 'REMOTE', 'SCHOOL', 'TRAINER', 'LEAVE', 'HOLIDAY', 'OFF', 'SICK', 'MISSION'],
  {
    errorMap: () => ({ message: 'Statut invalide' }),
  }
);

/**
 * Half-day enum
 */
export const halfDaySchema = z.enum(['FULL', 'AM', 'PM'], {
  errorMap: () => ({ message: 'Type de demi-journee invalide' }),
});

/**
 * Team sector enum
 */
export const teamSectorSchema = z.enum(
  ['tech', 'marketing', 'sales', 'hr', 'finance', 'operations', 'support', 'other'],
  {
    errorMap: () => ({ message: 'Secteur invalide' }),
  }
);

// =============================================================================
// TEAM SCHEMAS
// =============================================================================

/**
 * Schema for creating a team
 */
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres')
    .max(50, 'Le nom ne peut pas depasser 50 caracteres')
    .trim(),
  description: z
    .string()
    .max(200, 'La description ne peut pas depasser 200 caracteres')
    .trim()
    .optional(),
  sector: teamSectorSchema.optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

/**
 * Schema for joining a team
 */
export const joinTeamSchema = z.object({
  code: teamCodeSchema,
  employee_type: employeeTypeSchema.default('employee'),
  annual_leave_days: z
    .number()
    .min(0, 'Les jours de conges ne peuvent pas etre negatifs')
    .max(60, 'Maximum 60 jours de conges')
    .optional(),
});

export type JoinTeamInput = z.infer<typeof joinTeamSchema>;

/**
 * Schema for updating a team
 */
export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres')
    .max(50, 'Le nom ne peut pas depasser 50 caracteres')
    .trim()
    .optional(),
  description: z
    .string()
    .max(200, 'La description ne peut pas depasser 200 caracteres')
    .trim()
    .nullable()
    .optional(),
  sector: teamSectorSchema.nullable().optional(),
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

/**
 * Schema for leaving a team
 */
export const leaveTeamSchema = z.object({
  teamId: uuidSchema,
});

export type LeaveTeamInput = z.infer<typeof leaveTeamSchema>;

// =============================================================================
// CALENDAR ENTRY SCHEMAS
// =============================================================================

/**
 * Schema for creating a calendar entry
 */
export const createEntrySchema = z
  .object({
    team_id: uuidSchema,
    user_id: uuidSchema.optional(), // If not provided, uses current user
    date: dateStringSchema,
    end_date: dateStringSchema.optional(), // For date ranges
    status: calendarStatusSchema,
    half_day: halfDaySchema.default('FULL'),
  })
  .refine(
    (data) => {
      if (!data.end_date) return true;
      const start = new Date(data.date);
      const end = new Date(data.end_date);
      return end >= start;
    },
    {
      message: 'La date de fin doit etre posterieure ou egale a la date de debut',
      path: ['end_date'],
    }
  );

export type CreateEntryInput = z.infer<typeof createEntrySchema>;

/**
 * Schema for updating a calendar entry
 */
export const updateEntrySchema = z.object({
  status: calendarStatusSchema.optional(),
  half_day: halfDaySchema.optional(),
});

export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

/**
 * Schema for deleting a calendar entry
 */
export const deleteEntrySchema = z.object({
  entryId: uuidSchema,
});

export type DeleteEntryInput = z.infer<typeof deleteEntrySchema>;

/**
 * Schema for getting calendar entries
 */
export const getCalendarEntriesSchema = z.object({
  teamId: uuidSchema,
  month: z.date().or(z.string().transform((val) => new Date(val))),
  userId: uuidSchema.optional(), // Filter by specific user
});

export type GetCalendarEntriesInput = z.infer<typeof getCalendarEntriesSchema>;

// =============================================================================
// BALANCE SCHEMAS
// =============================================================================

/**
 * Schema for calculating balance
 */
export const calculateBalanceSchema = z.object({
  userId: uuidSchema,
  teamId: uuidSchema,
});

export type CalculateBalanceInput = z.infer<typeof calculateBalanceSchema>;

/**
 * Schema for syncing balance
 */
export const syncBalanceSchema = z.object({
  userId: uuidSchema,
  teamId: uuidSchema,
});

export type SyncBalanceInput = z.infer<typeof syncBalanceSchema>;

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/**
 * Generic action response type
 */
export interface ActionResponse<T = unknown> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } | null;
  success: boolean;
}

/**
 * Helper function to create success response
 */
export function successResponse<T>(data: T): ActionResponse<T> {
  return {
    data,
    error: null,
    success: true,
  };
}

/**
 * Helper function to create error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ActionResponse<never> {
  return {
    data: null,
    error: { code, message, details },
    success: false,
  };
}

// =============================================================================
// BALANCE RESPONSE TYPE
// =============================================================================

/**
 * Leave balance calculation result
 */
export interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
  year: number;
}
