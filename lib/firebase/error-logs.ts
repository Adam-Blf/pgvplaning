import { adminAuth, adminDb } from '@/lib/firebase/server';
import { createAuditLog } from './audit';

/**
 * Centralisation des logs d'erreurs serveur pour Absencia.
 * Enregistre l'erreur en base si elle est critique.
 */
export async function logServerError(
    error: any,
    context: string,
    userId?: string
) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : null;

    console.error(`[SERVER ERROR] [${context}] :`, errorMessage);

    // Si critique, créer un audit log de type error
    if (userId) {
        await createAuditLog({
            userId,
            action: `ERROR: ${context}`,
            resourceType: 'profile',
            resourceId: userId,
            newData: { message: errorMessage, stack: errorStack },
        });
    }
}
