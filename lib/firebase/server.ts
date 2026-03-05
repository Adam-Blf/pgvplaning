/**
 * Client Firebase Admin - Côté serveur
 * 
 * Initialise le SDK Firebase Admin pour les opérations serveur :
 * - Accès Firestore avec privilèges admin (bypass des règles de sécurité)
 * - Vérification et gestion des tokens d'authentification
 * 
 * Utilise les variables d'environnement FIREBASE_* (privées, côté serveur uniquement).
 * Pattern singleton : n'initialise qu'une seule fois même en cas de hot-reload.
 */

import * as admin from 'firebase-admin';

// Initialiser Firebase Admin une seule fois (vérification du singleton)
if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Remplacer les \n littéraux par de vrais retours à la ligne dans la clé privée
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        } catch (error) {
            console.error('Erreur d\'initialisation Firebase Admin :', error);
        }
    } else {
        // Avertir plutôt qu'erreur pour ne pas crasher le build
        if (process.env.NODE_ENV === 'production') {
            console.warn('Identifiants Firebase Admin manquants. Fonctionnalités limitées.');
        }
    }
}

// Exporter les services de manière sûre.
// Note : Les appels durant l'analyse statique du build retournent des objets vides,
// mais les appels runtime fonctionnent si les variables d'environnement sont présentes.
const adminDb = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
const adminAuth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;

export { adminDb, adminAuth, admin };
