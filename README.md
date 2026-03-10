# Absencia

![Status](https://img.shields.io/badge/status-production-green)
![Version](https://img.shields.io/badge/version-13.2.0-blue)
![Auth](https://img.shields.io/badge/auth-Firebase-orange)
![Security](https://img.shields.io/badge/security-OWASP%20Compliant-brightgreen)
![Architecture](https://img.shields.io/badge/architecture-Hybrid%20Firestore--Supabase-blue)
![PWA](https://img.shields.io/badge/PWA-installable-purple)

**Solution professionnelle de gestion des absences d'équipe avec Analytics Avancés**

Application web moderne (PWA) permettant de gérer les absences, congés et télétravail d'équipe avec une architecture hybride Cloud (Firebase pour l'authentification et le temps réel, Supabase pour l'analytics et l'audit).

> 🌐 **Production** : [absencia.beloucif.com](https://absencia.beloucif.com)

---

## Fonctionnalités

### Gestion d'équipe & Sécurité

- **Création d'équipe** : Créez votre équipe en un clic avec un code d'invitation unique (8 caractères).
- **Rejoindre une équipe** : Rejoignez via code d'invitation ou lien partagé.
- **Rôles Hiérarchiques** : Leader (Chef de groupe) et Membre avec permissions granulaires.
- **Règles de Présence** : Configuration par le leader du nombre minimal de personnes requises.
- **Sécurité RLS** : Politiques Supabase (Row Level Security) pour l'isolation des données.
- **Audit Log** : Traçabilité complète de toutes les modifications.

### Gestion des congés & Présence

- **Calendrier Interactif** : Sélection intuitive (clic/glissé) pour Bureau, Télétravail, Formation, Congés.
- **Demi-journées** : Support AM/PM pour des plannings précis.
- **Jours fériés français** : Calcul automatique incluant Pâques, Ascension, Pentecôte.
- **Types de Contrats** : Gestion différenciée Employé / Cadre avec soldes de congés distincts.
- **Synchronisation Cloud** : Données calendrier sauvegardées en temps réel sur Firestore.

### Analytics & Rapports

- **Dashboard Supabase** : Analyses de données historiques et metrics RH.
- **Export ICS** : Synchronisation avec Google Calendar, Outlook et Apple Calendar.
- **IA Génératrice** : Aide à la rédaction de mails d'absence via Google Gemini.

### PWA & Mobile

- **Progressive Web App** : Installable sur mobile et desktop.
- **Offline-ready** : Service Worker avec mise en cache automatique.
- **Responsive** : Interface adaptée mobile, tablette et desktop.

---

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript 5 |
| Auth | Firebase Authentication |
| Real-time DB | Cloud Firestore |
| Analytics DB | Supabase (PostgreSQL + RLS) |
| Styles | Tailwind CSS + Framer Motion |
| Internationalisation | next-intl (FR / EN) |
| PWA | next-pwa (Service Worker) |
| IA | Google Gemini API |
| Déploiement | Vercel |

---

## Installation & Configuration

### Prérequis

- Node.js 18+
- Projet Firebase (Auth + Firestore + Admin SDK)
- Projet Supabase (PostgreSQL + Service Role Key)

### Installation

```bash
git clone https://github.com/Adam-Blf/pgvplaning.git
cd pgvplaning
npm install
```

### Variables d'environnement (.env.local)

```bash
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

### Lancement

```bash
npm run dev      # Développement (http://localhost:3000)
npm run build    # Build production
npm run start    # Serveur production
```

### Déploiement Firestore Rules

```bash
firebase deploy --only firestore:rules
```

---

## Structure du projet

```
app/
  [locale]/           # Pages avec internationalisation (fr/en)
    calendar/         # Calendrier interactif
    team/             # Gestion d'équipe (create, join, setup, settings)
    admin/            # Administration
    exports/          # Export ICS
  api/                # Routes API (teams, auth, invitations)
components/
  features/           # Composants métier (calendar-grid, team-indicator)
  layout/             # Shell, navigation
  ui/                 # Composants réutilisables
contexts/             # AuthContext, TeamContext
hooks/                # useAuth, useCalendarData, useLeaveInfo
lib/
  firebase/           # Client & Server Firebase
  auth-fetch.ts       # Fetch authentifié (Bearer token)
i18n/                 # Configuration next-intl & routing
messages/             # Traductions FR/EN
supabase/             # Migrations SQL
```

---

## Changelog

### v13.2.0 (2026-03-10) - Adam Beloucif

- **PWA** : Application installable avec Service Worker, manifest et icônes.
- **Routing i18n** : Migration complète vers `next-intl/navigation` (Link, useRouter, usePathname).
- **Auth Token** : Toutes les API calls utilisent `authFetch` avec Bearer token Firebase.
- **Création d'équipe** : Fix du code d'invitation manquant sur la page de succès.
- **Déconnexion** : Bouton de déconnexion dans la navbar desktop, mobile et dropdown équipe.
- **Firestore** : Suppression de la vérification email obligatoire dans les security rules.
- **Purge** : Script de purge amélioré avec gestion d'erreurs par collection.

### v13.1.0 (2026-03-10) - Adam Beloucif

- **Système Hybride** : Réintroduction de Supabase pour Analytics et Audit Log.
- **Sécurité Leader** : Restriction du Dashboard Analytics au chef de groupe via RLS.
- **Règles métier** : Configuration du nombre minimal de présences.
- **Fix UI** : Résolution du crash 500 lié au contexte `next-intl`.

### v13.0.0 (2026-03-09)

- Transition vers Next.js 15 et React 19.
- Refonte du Dashboard principal.

---

## Licence

MIT - Blackout Prod

## Auteur

**Adam Beloucif** - Développeur Full Stack & Designer Produit

[![GitHub](https://img.shields.io/badge/GitHub-Adam--Blf-181717?logo=github)](https://github.com/Adam-Blf)
