const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("Erreur : variables d'environnement manquantes.");
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

const auth = admin.auth();
const db = admin.firestore();

async function listUsers() {
    console.log("🔍 Recherche des utilisateurs...");

    // 1. Firebase Auth
    const listUsersResult = await auth.listUsers();
    console.log(`\n--- Firebase Auth (${listUsersResult.users.length} utilisateurs) ---`);
    listUsersResult.users.forEach((user) => {
        console.log(`- UID: ${user.uid} | Email: ${user.email} | Nom: ${user.displayName || 'N/A'}`);
    });

    // 2. Firestore Profiles
    const profilesSnap = await db.collection('profiles').get();
    console.log(`\n--- Firestore Profiles (${profilesSnap.size} documents) ---`);
    profilesSnap.forEach((doc) => {
        const data = doc.data();
        console.log(`- ID: ${doc.id} | Email: ${data.email} | Nom: ${data.displayName}`);
    });

    if (listUsersResult.users.length === 0 && profilesSnap.size === 0) {
        console.log("\n✅ La base est totalement vide.");
    }
}

listUsers().catch(console.error);
