import { NextRequest, NextResponse } from 'next/server';
import { getCalendarData } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  // Récupérer les données calendrier pour l'utilisateur
  const events = await getCalendarData(userId); // Adapter pour fetch réel
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Absencia//WebCalendar//FR\n';
  for (const event of events) {
    ics += 'BEGIN:VEVENT\n';
    ics += `UID:${event.id}\n`;
    ics += `DTSTAMP:${event.dtstamp}\n`;
    ics += `DTSTART:${event.dtstart}\n`;
    ics += `DTEND:${event.dtend}\n`;
    ics += `SUMMARY:${event.summary}\n`;
    if (event.description) ics += `DESCRIPTION:${event.description}\n`;
    ics += 'END:VEVENT\n';
  }
  ics += 'END:VCALENDAR';
  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="calendar-${userId}.ics"`,
    },
  });
}
