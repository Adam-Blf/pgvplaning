# Script de purge des équipes et utilisateurs (Firebase/Supabase)
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Initialisation Firebase
cred = credentials.Certificate(os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-admin.json'))
firebase_admin.initialize_app(cred)
db = firestore.client()

def purge_collection(collection_name):
    docs = db.collection(collection_name).stream()
    for doc in docs:
        db.collection(collection_name).document(doc.id).delete()
    print(f"Purged {collection_name}")

if __name__ == "__main__":
    purge_collection('users')
    purge_collection('teams')
    print("Purge terminé.")
