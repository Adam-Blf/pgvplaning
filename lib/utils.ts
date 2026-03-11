// Mock getCalendarData for ICS export
export async function getCalendarData(userId?: string) {
  // TODO: fetch real calendar data for userId
  // Mock : retourne un calendrier différent par user
  if (userId === 'user1') {
    return [
      {
        id: 'event-1',
        dtstamp: '20260311T120000Z',
        dtstart: '20260312T090000Z',
        dtend: '20260312T170000Z',
        summary: 'Journée de travail user1',
        description: 'Présence au bureau',
      },
    ];
  }
  // Par défaut, calendrier générique
  return [
    {
      id: 'event-2',
      dtstamp: '20260311T120000Z',
      dtstart: '20260313T090000Z',
      dtend: '20260313T120000Z',
      summary: 'Réunion équipe',
      description: 'Salle 2',
    },
  ];
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
