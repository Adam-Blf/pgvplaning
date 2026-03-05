import * as admin from 'firebase-admin';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
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
            console.error('Firebase admin initialization error:', error);
        }
    } else {
        // Log a warning instead of an error to prevent build crashes
        if (process.env.NODE_ENV === 'production') {
            console.warn('Firebase admin credentials missing. Service functionality will be limited.');
        }
    }
}

// Export initializers/services safely. 
// Note: Calls to these during build-time static analysis will return dummy objects 
// if not initialized, but runtime calls should work if env vars are present.
const adminDb = admin.apps.length ? admin.firestore() : {} as admin.firestore.Firestore;
const adminAuth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;

export { adminDb, adminAuth, admin };
