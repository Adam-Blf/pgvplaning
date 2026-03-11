const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("Erreur : configuration manquante");
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
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function purge() {
    console.log("🧹 PURGE EN COURS...");

    try {
        const { users } = await auth.listUsers();
        for (const u of users) {
            await auth.deleteUser(u.uid);
            console.log(`- Auth supprimé: ${u.email}`);
        }
    } catch (e) { console.error("Auth error"); }

    const collections = ['profiles', 'teams', 'team_members', 'team_invitations', 'pre_created_members', 'absences', 'notifications', 'transfers', 'transfers_v2', 'super_admins', 'settings', 'invitations'];
    for (const c of collections) {
        try {
            const snap = await db.collection(c).get();
            if (!snap.empty) {
                const batch = db.batch();
                snap.forEach(d => batch.delete(d.ref));
                await batch.commit();
                console.log(`- Firestore [${c}] vidé (${snap.size} docs)`);
            }
        } catch (e) {
            console.warn(`- Firestore [${c}] ignoré (${e.code || e.message})`);
        }
    }

    const tables = ['leave_history', 'audit_log', 'team_monthly_stats'];
    for (const t of tables) {
        try {
            await supabase.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000');
            console.log(`- Supabase [${t}] vidé`);
        } catch (e) {
            console.warn(`- Supabase [${t}] ignoré (${e.message})`);
        }
    }

    console.log("✨ NETTOYAGE TERMINÉ.");
}

purge();
