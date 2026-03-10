const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("Erreur : FIREBASE_PROJECT_ID manquant (Path: " + envPath + ")");
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
});

const auth = admin.auth();
const db = admin.firestore();
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function purgeAll() {
    console.log("🚀 Lancement de la PURGE TOTALE...");

    // 1. Firebase Auth
    try {
        const listUsers = await auth.listUsers();
        console.log(`👥 Suppression de ${listUsers.users.length} utilisateurs Firebase...`);
        for (const user of listUsers.users) {
            await auth.deleteUser(user.uid);
            console.log(`  - Supprimé: ${user.email}`);
        }
        console.log("✅ Auth nettoyée.");
    } catch (e) {
        console.warn("⚠️ Avertissement Auth :", e.message);
    }

    // 2. Firestore
    const collections = ['profiles', 'teams', 'team_members', 'absences', 'notifications', 'transfers', 'transfers_v2', 'super_admins', 'settings'];
    for (const col of collections) {
        try {
            const snap = await db.collection(col).limit(500).get();
            if (!snap.empty) {
                console.log(`📂 Nettoyage Firestore [${col}] : ${snap.size} docs...`);
                const batch = db.batch();
                snap.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        } catch (e) {
            console.warn(`⚠️ Erreur sur collection [${col}] :`, e.message);
        }
    }

    // 3. Supabase
    const tables = ['leave_history', 'audit_log', 'team_monthly_stats'];
    for (const table of tables) {
        try {
            console.log(`⚡ Nettoyage Supabase [${table}]...`);
            const { error } = await supabase.from(table).delete().neq('created_at', '1970-01-01');
            if (error) throw error;
            console.log(`✅ Table [${table}] vide.`);
        } catch (e) {
            console.warn(`⚠️ Erreur Supabase [${table}] :`, e.message);
        }
    }

    console.log("✨ RÉINITIALISATION TERMINÉE. Le SaaS est prêt.");
}

purgeAll();
