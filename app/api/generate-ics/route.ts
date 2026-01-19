import { NextRequest, NextResponse } from 'next/server';
import { generateIcsRequestSchema, parseFrenchDate, GenerateIcsRequest } from '@/lib/schemas/planning';

function formatIcsDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

function generateIcsContent(data: GenerateIcsRequest): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PGV Planning//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Congés ${data.employeeName}`,
    `X-WR-TIMEZONE:${data.timezone}`,
  ];

  data.periods.forEach((period, index) => {
    const startDate = parseFrenchDate(period.startDate);
    const endDate = parseFrenchDate(period.endDate);
    // ICS end date is exclusive, so add 1 day
    endDate.setDate(endDate.getDate() + 1);

    const uid = `${Date.now()}-${index}@pgvplanning`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${formatIcsDate(endDate)}`);
    lines.push(`SUMMARY:${period.title} - ${data.employeeName}`);
    if (period.description) {
      lines.push(`DESCRIPTION:${period.description.replace(/\n/g, '\\n')}`);
    }
    lines.push('TRANSP:OPAQUE');
    lines.push('X-MICROSOFT-CDO-BUSYSTATUS:OOF');
    lines.push(`DTSTAMP:${formatIcsDate(new Date())}T000000Z`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function generateFileName(employeeName: string): string {
  const sanitized = employeeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  return `conges_${sanitized}_${date}.ics`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = generateIcsRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const icsContent = generateIcsContent(data);
    const fileName = generateFileName(data.employeeName);

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Erreur génération ICS:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la génération du fichier ICS',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez POST.' },
    { status: 405 }
  );
}
