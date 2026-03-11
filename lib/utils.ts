// Mock getCalendarData for ICS export
export async function getCalendarData() {
  // TODO: fetch real calendar data
  return [
    {
      id: 'event-1',
      dtstamp: '20260311T120000Z',
      dtstart: '20260312T090000Z',
      dtend: '20260312T170000Z',
      summary: 'Journée de travail',
      description: 'Présence au bureau',
    },
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
