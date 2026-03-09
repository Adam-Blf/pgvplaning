import { adminDb } from '@/lib/firebase/server';
import { Timestamp } from 'firebase-admin/firestore';
import { AuditLog } from '@/types/firestore';

/**
 * Enregistre une action dans la collection audit_logs.
 * Utilisé pour la traçabilité des actions critiques (auth, team, calendar).
 */
export async function createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    try {
        const logRef = adminDb.collection('audit_logs').doc();
        const newLog = {
            ...log,
            timestamp: Timestamp.now(),
        };
        await logRef.set(newLog);
        return logRef.id;
    } catch (error) {
        console.error('Erreur lors de la création de l\'audit log :', error);
        return null;
    }
}
