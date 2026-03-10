// Input validation schemas using Zod.
// Applied on API routes to prevent injection and malformed data.

import { z } from 'zod';

// ─── Common validators ──────────────────────────────────────────────────────

/** Firebase UID format: 28 alphanumeric characters */
export const firebaseUidSchema = z.string().min(20).max(128).regex(/^[a-zA-Z0-9]+$/);

/** Firestore team ID */
export const teamIdSchema = z.string().min(4).max(64).regex(/^[a-zA-Z0-9_-]+$/);

/** ISO date string (YYYY-MM-DD) */
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format date invalide (YYYY-MM-DD)');

/** Month string (YYYY-MM) */
export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Format mois invalide (YYYY-MM)');

// ─── API-specific schemas ───────────────────────────────────────────────────

export const analyticsQuerySchema = z.object({
    teamId: teamIdSchema,
    months: z.coerce.number().int().min(1).max(24).optional().default(6),
});

export const exportQuerySchema = z.object({
    teamId: teamIdSchema,
    year: z.coerce.number().int().min(2020).max(2099).optional(),
});

export const leaveEntrySchema = z.object({
    firebaseUserId: firebaseUidSchema,
    teamId: teamIdSchema.optional(),
    date: dateSchema,
    status: z.enum(['conges', 'maladie', 'formation', 'teletravail', 'bureau', 'autre']),
    isHalfDay: z.boolean().optional().default(false),
    halfDayType: z.enum(['am', 'pm']).optional(),
    approved: z.boolean().optional().default(false),
});

export const teamCreateSchema = z.object({
    name: z.string().min(2).max(80).trim(),
    description: z.string().max(500).trim().optional(),
});

// ─── Helper ─────────────────────────────────────────────────────────────────

/** Parse and validate request search params against a Zod schema */
export function parseSearchParams<T>(
    searchParams: URLSearchParams,
    schema: z.ZodSchema<T>
): { data: T; error: null } | { data: null; error: string } {
    const raw = Object.fromEntries(searchParams.entries());
    const result = schema.safeParse(raw);
    if (!result.success) {
        const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { data: null, error: errors };
    }
    return { data: result.data, error: null };
}
