/**
 * Client Firebase - Côté navigateur
 * 
 * Initialise l'application Firebase côté client avec :
 * - L'authentification (Auth)
 * - La base de données Firestore
 * 
 * Utilise les variables d'environnement NEXT_PUBLIC_FIREBASE_*
 * pour la configuration. Gère le singleton (une seule instance).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// Configuration Firebase à partir des variables d'environnement publiques
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialiser Firebase uniquement si la configuration est disponible
let app;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
    if (firebaseConfig.apiKey) {
        // Réutiliser l'instance existante ou en créer une nouvelle (pattern singleton)
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    }
} catch (error) {
    console.error('Erreur d\'initialisation Firebase :', error);
}

export { app, auth, db };

/**
 * Vérifie si Firebase est correctement configuré.
 * Utile pour afficher des messages d'erreur si les clés manquent.
 */
export function isFirebaseConfigured(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
}
