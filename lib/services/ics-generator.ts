import { createEvents, EventAttributes, DateArray } from 'ics';
import { parseFrenchDate, getDaysBetween } from '@/lib/utils/date-format';
import { GenerateIcsRequest, VacationPeriod } from '@/lib/schemas/planning';
import { logger } from '@/lib/logger';

const icsLogger = logger.withContext('IcsGenerator');

/**
 * Convertit une Date en DateArray pour la librairie ics
 * Format: [année, mois, jour]
 */
function dateToDateArray(date: Date): DateArray {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
}

/**
 * Génère un identifiant unique pour un événement
 */
function generateEventUid(employeeName: string, index: number): string {
  const timestamp = Date.now();
  const sanitizedName = employeeName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${sanitizedName}-${index}-${timestamp}@pgvplanning.fr`;
}

/**
 * Convertit une période de vacances en attributs d'événement ICS
 */
function vacationPeriodToEvent(
  period: VacationPeriod,
  employeeName: string,
  index: number
): EventAttributes {
  const startDate = parseFrenchDate(period.startDate);
  const endDate = parseFrenchDate(period.endDate);

  if (!startDate || !endDate) {
    throw new Error(`Dates invalides: ${period.startDate} - ${period.endDate}`);
  }

  // Pour un événement "toute la journée", la date de fin doit être le jour suivant
  const endDatePlusOne = new Date(endDate);
  endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

  // Calcul de la durée pour référence (utilisé dans les logs si besoin)
  void getDaysBetween(startDate, endDate);

  return {
    uid: generateEventUid(employeeName, index),
    start: dateToDateArray(startDate),
    end: dateToDateArray(endDatePlusOne),
    title: `${period.title} - ${employeeName}`,
    description: period.description || `Vacances de ${employeeName}`,
    status: 'CONFIRMED',
    busyStatus: 'OOF', // Out of Office
    transp: 'OPAQUE',
    categories: ['Vacances', 'PGV Planning'],
    organizer: { name: 'PGV Planning', email: 'noreply@pgvplanning.fr' },
    productId: 'PGV Planning V9',
    calName: `Vacances ${employeeName}`,
  };
}

/**
 * Génère le contenu d'un fichier ICS à partir d'une requête
 */
export async function generateIcsContent(
  request: GenerateIcsRequest
): Promise<string> {
  icsLogger.info('Génération ICS démarrée', {
    employeeName: request.employeeName,
    periodsCount: request.periods.length,
  });

  const events: EventAttributes[] = request.periods.map((period, index) =>
    vacationPeriodToEvent(period, request.employeeName, index)
  );

  return new Promise((resolve, reject) => {
    createEvents(events, (error, value) => {
      if (error) {
        icsLogger.error('Erreur lors de la génération ICS', {
          error: error.message,
        });
        reject(new Error(`Erreur de génération ICS: ${error.message}`));
        return;
      }

      icsLogger.info('Génération ICS réussie', {
        employeeName: request.employeeName,
        eventsCount: events.length,
      });

      resolve(value);
    });
  });
}

/**
 * Génère un nom de fichier pour le téléchargement
 */
export function generateFileName(employeeName: string): string {
  const sanitizedName = employeeName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const timestamp = new Date().toISOString().split('T')[0];
  return `vacances-${sanitizedName}-${timestamp}.ics`;
}
