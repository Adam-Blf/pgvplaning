import { z } from 'zod';

// Regex pour le format de date DD/MM/YYYY
const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

// Schéma pour une date au format français
export const frenchDateSchema = z.string().regex(dateRegex, {
  message: 'La date doit être au format JJ/MM/AAAA',
});

// Schéma pour un nom (prénom ou nom de famille)
export const nameSchema = z
  .string()
  .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  .max(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets',
  });

// Schéma pour une période de vacances
export const vacationPeriodSchema = z
  .object({
    startDate: frenchDateSchema,
    endDate: frenchDateSchema,
    title: z
      .string()
      .min(1, { message: 'Le titre est requis' })
      .max(100, { message: 'Le titre ne peut pas dépasser 100 caractères' }),
    description: z
      .string()
      .max(500, { message: 'La description ne peut pas dépasser 500 caractères' })
      .optional(),
  })
  .refine(
    (data) => {
      const [startDay, startMonth, startYear] = data.startDate.split('/').map(Number);
      const [endDay, endMonth, endYear] = data.endDate.split('/').map(Number);
      const start = new Date(startYear, startMonth - 1, startDay);
      const end = new Date(endYear, endMonth - 1, endDay);
      return end >= start;
    },
    {
      message: 'La date de fin doit être postérieure ou égale à la date de début',
      path: ['endDate'],
    }
  );

// Schéma pour la requête de génération ICS
export const generateIcsRequestSchema = z.object({
  employeeName: nameSchema,
  periods: z
    .array(vacationPeriodSchema)
    .min(1, { message: 'Au moins une période de vacances est requise' })
    .max(50, { message: 'Maximum 50 périodes de vacances' }),
  timezone: z.string().default('Europe/Paris'),
});

// Types inférés des schémas
export type FrenchDate = z.infer<typeof frenchDateSchema>;
export type Name = z.infer<typeof nameSchema>;
export type VacationPeriod = z.infer<typeof vacationPeriodSchema>;
export type GenerateIcsRequest = z.infer<typeof generateIcsRequestSchema>;

// Fonction utilitaire pour parser une date française en objet Date
export function parseFrenchDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

// Fonction utilitaire pour formater une Date en format français
export function formatToFrenchDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
