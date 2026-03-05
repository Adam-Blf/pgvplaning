# Absencia

![Status](https://img.shields.io/badge/status-production-green)
![Version](https://img.shields.io/badge/version-10.0.0-blue)
![Auth](https://img.shields.io/badge/auth-Firebase-orange)
![Security](https://img.shields.io/badge/security-OWASP%20Compliant-brightgreen)
![Tests](https://img.shields.io/badge/tests-E2E%20Playwright-orange)

**Solution professionnelle de gestion des absences d'équipe**

Application web moderne permettant de gérer les absences, congés et télétravail d'équipe avec authentification sécurisée, synchronisation temps réel et export ICS.

---

## Fonctionnalités

### Gestion d'équipe

- **Création d'équipe** : Créez une équipe avec un code unique à 8 caractères
- **Liens d'invitation** : Partagez un lien pour rejoindre facilement
- **Rôles hiérarchiques** : Leader / Admin / Membre
- **Types d'employés** : Non-cadre / Cadre avec congés différenciés
- **Secteurs** : Public / Privé

### Gestion des congés

- **Solde automatique** : Décompte et reset annuel automatique
- **Configuration flexible** : Jours de congés par type d'employé
- **Vue d'équipe** : Calendrier partagé entre membres
- **Statistiques** : Dashboard analytique complet

### Calendrier interactif

- **Sélection intuitive** : Cliquez ou glissez pour marquer les jours
- **Demi-journées** : Support matin/après-midi/journée complète
- **Statuts multiples** : Bureau, Télétravail, Formation, Congés, Maladie, etc.
- **Synchronisation temps réel** : Via Firestore
- **Mode invité** : Utilisation sans compte (localStorage)

### Exports et Analytics

- **Export ICS** : Compatible Google Calendar, Outlook, Apple Calendar
- **Compteur intelligent** : Jours restants par catégorie
- **Dashboard** : Graphiques et statistiques avec Recharts
- **Générateur IA** : Messages d'absence automatiques

---

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| Framework | Next.js 15.1 (App Router) |
| Langage | TypeScript 5.7 (strict mode) |
| Auth/DB | Firebase (Auth + Firestore) |
| Styles | Tailwind CSS 3.4 |
| Animations | Framer Motion 11 |
| Validation | Zod 3.24 |
| Tests | Jest + Playwright |
| UI Icons | Lucide React |
| Notifications | Sonner |
| Charts | Recharts |

---

## Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Projet Firebase configuré

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/Adam-Blf/absencia.git
cd absencia

# 2. Installer les dépendances
npm install

# 3. Copier les variables d'environnement
cp .env.example .env.local

# 4. Configurer les variables (voir section suivante)

# 5. Lancer en développement
npm run dev
```

### Variables d'environnement

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

---

## Configuration Firebase

### 1. Créer un projet Firebase

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Créez un nouveau projet
3. Activez **Authentication** (Email/Password)
4. Activez **Cloud Firestore**

### 2. Règles de sécurité Firestore

Configurez les règles pour autoriser l'accès basé sur l'UID de l'utilisateur et l'ID de l'équipe (voir `firestore.rules`).

---

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Démarrer en production |
| `npm run lint` | Vérification ESLint |
| `npm run test` | Tests unitaires Jest |
| `npm run test:e2e` | Tests E2E Playwright |

---

## Sécurité

### Mesures implémentées

| Mesure | Description |
|--------|-------------|
| **Auth** | Firebase Auth avec JWT |
| **Firestore Rules** | Sécurité robuste au niveau granulaire |
| **Rate Limiting** | Protection contre le spam |
| **Validation** | Zod sur toutes les entrées |
| **Audit** | Logs automatiques sur actions critiques |
| **Headers** | CSP, HSTS, X-Frame-Options, etc. |

---

## Architecture

```
absencia/
|-- app/                    # Pages Next.js (App Router)
|   |-- api/               # API Routes
|   |-- calendar/          # Page calendrier
|   |-- team/              # Pages équipe
|   +-- ...
|-- components/
|   |-- features/          # Composants métier
|   +-- layout/            # Layout et navigation
|-- hooks/                 # Custom React hooks
|-- lib/
|   |-- firebase/          # Clients Firebase (Client/Admin)
|   |-- schemas/           # Schémas Zod
|   +-- utils.ts           # Utilitaires
|-- types/                 # Types TypeScript
|-- e2e/                   # Tests E2E Playwright
+-- __tests__/             # Tests unitaires
```

---

## Changelog

### v10.0.0 (2026-03-05)

- **Migration complète vers Firebase** (Auth + Firestore)
- Suppression de la dépendance Supabase
- Initialisation résiliente du SDK Admin pour les environnements de build
- Correction des warnings de linting et optimisation du code
- Mise à jour de la documentation technique

### v9.0.0 (2026-01-22)

- Tests E2E Playwright complets
- Audit sécurité OWASP
- Documentation finale

---

## Licence

MIT - Licence ouverte

---

## Auteur

**Adam Beloucif**

---

*Projet validé à 100% - Standards GEMINI Appliqués*
