import { format, parse, isValid, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Timezone par défaut pour la France
export const DEFAULT_TIMEZONE = 'Europe/Paris';

// Format de date français DD/MM/YYYY
export const FRENCH_DATE_FORMAT = 'dd/MM/yyyy';

// Format de date pour affichage complet
export const FRENCH_DATE_LONG_FORMAT = 'EEEE d MMMM yyyy';

/**
 * Parse une date au format français (DD/MM/YYYY) en objet Date
 */
export function parseFrenchDate(dateString: string): Date | null {
  try {
    const parsed = parse(dateString, FRENCH_DATE_FORMAT, new Date());
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Formate une Date en format français DD/MM/YYYY
 */
export function formatToFrenchDate(date: Date): string {
  return format(date, FRENCH_DATE_FORMAT);
}

/**
 * Formate une Date en format français long (ex: "Lundi 15 janvier 2026")
 */
export function formatToFrenchDateLong(date: Date): string {
  return format(date, FRENCH_DATE_LONG_FORMAT, { locale: fr });
}

/**
 * Vérifie si une chaîne est une date valide au format français
 */
export function isValidFrenchDate(dateString: string): boolean {
  const parsed = parseFrenchDate(dateString);
  return parsed !== null;
}

/**
 * Calcule le nombre de jours entre deux dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate) + 1; // +1 pour inclure le jour de fin
}

/**
 * Génère un tableau de dates entre deux dates (incluses)
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const days = getDaysBetween(startDate, endDate);

  for (let i = 0; i < days; i++) {
    dates.push(addDays(startDate, i));
  }

  return dates;
}

/**
 * Formate une date pour l'affichage dans un calendrier ICS
 * Format: YYYYMMDD
 */
export function formatToIcsDate(date: Date): string {
  return format(date, 'yyyyMMdd');
}

/**
 * Obtient le nom du jour en français
 */
export function getFrenchDayName(date: Date): string {
  return format(date, 'EEEE', { locale: fr });
}

/**
 * Obtient le nom du mois en français
 */
export function getFrenchMonthName(date: Date): string {
  return format(date, 'MMMM', { locale: fr });
}

/**
 * Vérifie si une date est dans le futur
 */
export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Obtient la date d'aujourd'hui au format français
 */
export function getTodayFrenchDate(): string {
  return formatToFrenchDate(new Date());
}
