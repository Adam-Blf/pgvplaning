import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Trigger : Met à jour le champ updated_at sur toutes les modifications de documents.
 * S'applique aux collections principales.
 */
export const onDocumentUpdate = functions.firestore
    .document('{collection}/{docId}')
    .onUpdate(async (change, context) => {
        const { collection } = context.params;

        // Éviter les boucles infinies sur certaines collections ou si updated_at est le seul changement
        const collectionsToTrack = ['profiles', 'teams', 'calendar_entries'];
        if (!collectionsToTrack.includes(collection)) return null;

        const newValue = change.after.data();
        const previousValue = change.before.data();

        // Vérifier si des données métier ont réellement changé (hors updatedAt)
        if (JSON.stringify(newValue) === JSON.stringify(previousValue)) return null;

        return change.after.ref.update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    });

/**
 * Trigger : Synchronisation initiale lors de la création d'un utilisateur Firebase Auth.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    const profileRef = db.collection('profiles').doc(user.uid);

    return profileRef.set({
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Utilisateur',
        photoURL: user.photoURL || null,
        role: 'member',
        employeeType: 'non-cadre',
        sector: 'prive',
        leaveBalance: { total: 25, used: 0, remaining: 25 },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
});
