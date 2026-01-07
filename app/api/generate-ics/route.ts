import { NextRequest, NextResponse } from 'next/server';
import { generateIcsRequestSchema } from '@/lib/schemas/planning';
import { generateIcsContent, generateFileName } from '@/lib/services/ics-generator';
import { logger } from '@/lib/logger';

const apiLogger = logger.withContext('API:generate-ics');

export async function POST(request: NextRequest) {
  try {
    // Parser le body JSON
    const body = await request.json();

    // Valider avec Zod
    const validationResult = generateIcsRequestSchema.safeParse(body);

    if (!validationResult.success) {
      apiLogger.warn('Validation échouée', {
        errors: validationResult.error.flatten(),
      });

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

    apiLogger.info('Requête valide reçue', {
      employeeName: data.employeeName,
      periodsCount: data.periods.length,
    });

    // Générer le contenu ICS
    const icsContent = await generateIcsContent(data);
    const fileName = generateFileName(data.employeeName);

    // Retourner le fichier ICS
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    apiLogger.error('Erreur serveur', {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la génération du fichier ICS',
      },
      { status: 500 }
    );
  }
}

// Désactiver les autres méthodes HTTP
export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez POST.' },
    { status: 405 }
  );
}
