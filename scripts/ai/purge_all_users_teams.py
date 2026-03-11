# Purge users/teams Firebase & Supabase/Postgres
import os
import firebase_admin
from firebase_admin import credentials, firestore
import psycopg2

# Load env vars from .env.local
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env.local'))

# Firebase
cred = credentials.Certificate({
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
})
firebase_admin.initialize_app(cred)
db = firestore.client()

def purge_firestore(collection):
    docs = db.collection(collection).stream()
    for doc in docs:
        db.collection(collection).document(doc.id).delete()
    print(f"Firestore: purged {collection}")

# Supabase/Postgres
pg_url = os.getenv("DATABASE_URL")
conn = psycopg2.connect(pg_url)
cursor = conn.cursor()

def purge_postgres(table):
    cursor.execute(f"DELETE FROM {table};")
    conn.commit()
    print(f"Postgres: purged {table}")

if __name__ == "__main__":
    purge_firestore('users')
    purge_firestore('teams')
    purge_postgres('users')
    purge_postgres('teams')
    cursor.close()
    conn.close()
    print("Purge complet Firebase + Supabase/Postgres.")
