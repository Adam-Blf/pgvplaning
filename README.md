# Absencia

![Status](https://img.shields.io/badge/status-production-green)
![Version](https://img.shields.io/badge/version-18.0.0-blue)
![Auth](https://img.shields.io/badge/auth-Firebase-orange)
![Security](https://img.shields.io/badge/security-OWASP%20Compliant-brightgreen)
![Architecture](https://img.shields.io/badge/architecture-Hybrid%20Firestore--Supabase-blue)
![PWA](https://img.shields.io/badge/PWA-installable-purple)
![Design](https://img.shields.io/badge/design-Blueprint%20Dark-0ea5e9)

**Solution professionnelle de gestion des absences d'équipe — Design Blueprint on Dark**

Application web moderne (PWA) permettant de gérer les absences, congés et télétravail d'équipe avec une architecture hybride Cloud (Firebase pour l'authentification et le temps réel, Supabase pour l'analytics et l'audit). Interface premium « Blueprint on Dark » avec typographie Outfit / JetBrains Mono et accents cyan/sky.

> 🌐 **Production** : [absencia.beloucif.com](https://absencia.beloucif.com)

---

## Fonctionnalités

### Gestion d'équipe & Sécurité

- **Création d'équipe** : Créez votre équipe en un clic avec un code d'invitation unique (8 caractères).
- **Rejoindre une équipe** : Rejoignez via code d'invitation ou lien partagé.
- **Rôles Hiérarchiques** : Leader (Chef de groupe) et Membre avec permissions granulaires.
- **Validation des membres** : Le leader approuve ou rejette les demandes d'adhésion.
- **Couleur par membre** : Le leader attribue une couleur personnalisée à chaque membre.
- **Types de contrat** : Cadre forfait jour, cadre forfait heure, employé — avec heures hebdo configurables par le leader.
- **Règles de Présence** : Configuration par le leader du nombre minimal de personnes requises.
- **Quitter / Supprimer** : Un membre peut quitter l'équipe ; le leader peut supprimer l'équipe.
- **Sécurité RLS** : Politiques Supabase (Row Level Security) pour l'isolation des données.
- **Audit Log** : Traçabilité complète de toutes les modifications.

### Gestion des congés & Présence

- **Calendrier Interactif** : Sélection intuitive (clic/glissé) pour Bureau, Télétravail, Formation, Congés.
- **Demi-journées** : Support AM/PM pour des plannings précis.
- **Soldes de congés** : CP, RTT, RTJ et autres types selon le contrat.
- **Jours fériés français** : Calcul automatique incluant Pâques, Ascension, Pentecôte.
- **Synchronisation Cloud** : Données calendrier sauvegardées en temps réel sur Firestore.

### Analytics & Rapports

- **Dashboard Supabase** : Analyses de données historiques et metrics RH.
- **Export ICS** : Synchronisation avec Google Calendar, Outlook et Apple Calendar.
- **IA Génératrice** : Aide à la rédaction de mails d'absence via Google Gemini.

### Notifications & Alertes

- **Alertes d'équipe** : Notification quand un membre pose un congé.
- **Notifications email** : Préférences configurables dans les réglages.
- **Switches interactifs** : Activation/désactivation en temps réel avec sauvegarde Firestore.

### Design & UX

- **Blueprint on Dark** : Thème sombre technique avec accents cyan/sky et grille blueprint en fond.
- **Typographie distinctive** : Outfit (titres/UI) + JetBrains Mono (données/nombres).
- **Animations WAAPI** : Transitions performantes via Web Animations API (zero framer-motion).
- **Glow effects** : Lueur sur boutons actifs, navbar et éléments interactifs.
- **Accessibilité** : Focus visible, aria-labels, rôles ARIA, navigation clavier, touch targets 44px+.
- **Responsive** : Interface adaptée mobile, tablette et desktop.

### PWA & Mobile

- **Progressive Web App** : Installable sur mobile et desktop.
- **Offline-ready** : Service Worker avec mise en cache automatique.
- **Touch optimisé** : `touch-action: manipulation`, `overscroll-behavior: contain`.

---

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript 5 |
| Auth | Firebase Authentication |
| Real-time DB | Cloud Firestore |
| Analytics DB | Supabase (PostgreSQL + RLS) |
| Styles | Tailwind CSS + CSS Custom Properties |
| Animations | Web Animations API (WAAPI) + CSS Keyframes |
| Typographie | Outfit + JetBrains Mono (Google Fonts) |
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
  [locale]/              # Pages avec internationalisation (fr/en)
    calendar/            # Calendrier interactif (painting mode)
    team/                # Équipe (create, join, setup, members, validation, settings, onboarding)
    admin/               # Administration
    analytics/           # Dashboard analytics (leader only)
    exports/             # Export ICS
    settings/            # Réglages utilisateur (notifications, couleur, contrat)
    guide/               # Guide d'utilisation
    contact/             # Page de contact
    login/               # Connexion
    auth/register/       # Inscription
    invite/[token]/      # Lien d'invitation
  api/                   # Routes API
    teams/               # CRUD équipes + join
    auth/                # Authentification (register, profile)
    analytics/           # Sync Supabase
    generate-ics/        # Génération fichiers ICS
    ical/                # Flux iCal
    llm/                 # Génération IA (Gemini)
    admin/               # Administration
components/
  features/              # Composants métier
    calendar-grid.tsx    # Grille calendrier avec painting mode
    painting-toolbar.tsx # Barre d'outils de sélection
    team-indicator.tsx   # Dropdown équipe dans la navbar
    analytics-dashboard.tsx
    leave-balance-card.tsx
    notification-sender.tsx
    onboarding-tutorial.tsx
    christmas-countdown.tsx
  layout/
    dashboard-shell.tsx  # Shell principal (navbar, mobile menu)
  ui/                    # Composants réutilisables (shadcn/ui)
contexts/
  auth-context.tsx       # AuthContext (Firebase Auth + profil Firestore)
  team-context.tsx       # TeamContext (équipe, membres, validation)
hooks/
  use-animate.ts         # Utilitaires WAAPI (useFadeUp, useScaleIn, useStaggerChildren)
  use-auth.ts            # Hook d'authentification
  use-calendar-data.ts   # Données calendrier Firestore
  use-calendar-stats.ts  # Statistiques calendrier
  use-french-calendar.ts # Calendrier français (jours fériés)
  use-leave-info.ts      # Informations congés
lib/
  firebase/              # Client & Server Firebase
  auth-fetch.ts          # Fetch authentifié (Bearer token)
  utils.ts               # Utilitaires (cn, etc.)
i18n/                    # Configuration next-intl & routing
messages/                # Traductions FR/EN
supabase/                # Migrations SQL
scripts/
  purge.js               # Purge Firestore + Auth + Supabase
types/
  firestore.ts           # Types TypeScript (UserProfile, Team, etc.)
```

---

## Design System

### Palette Blueprint

| Token | Couleur | Usage |
|-------|---------|-------|
| `--bg-base` | `#020817` | Fond principal |
| `--bg-surface` | `#0a0f1a` | Surfaces / cartes |
| `--bg-elevated` | `#111827` | Éléments surélevés |
| `--blueprint-500` | `#0ea5e9` | Accent principal |
| `--cyan-400` | `#22d3ee` | Accent secondaire |
| `--text-primary` | `#f1f5f9` | Texte principal |
| `--text-secondary` | `#94a3b8` | Texte secondaire |

### Couleurs de statut calendrier

| Statut | Couleur | Classe |
|--------|---------|--------|
| Bureau | `blue-500` | `bg-blue-500` |
| Télétravail | `emerald-500` | `bg-emerald-500` |
| Formation | `amber-500` | `bg-amber-500` |
| Formateur | `violet-500` | `bg-violet-500` |
| Congé | `rose-500` | `bg-rose-500` |

### Classes utilitaires

- `glass` / `glass-elevated` — Effet verre avec backdrop-filter
- `gradient-text-amber` — Dégradé texte blueprint → cyan
- `glow-amber` / `glow-amber-sm` — Effet lueur blueprint
- `card-glow` — Carte avec lueur au hover
- `btn-primary` / `btn-secondary` / `btn-ghost` — Boutons blueprint
- `badge-amber` / `badge-success` / `badge-error` — Badges colorés
- `surface` / `surface-elevated` / `surface-overlay` — Surfaces

---

## Changelog

### v18.0.0 — Blueprint Dark Redesign

#### Design & UX
- **Blueprint on Dark** : Refonte complète du design system — thème sombre technique avec grille blueprint en fond.
- **Typographie** : Migration vers Outfit (titres/UI) + JetBrains Mono (données/nombres).
- **Animations WAAPI** : Migration complète de framer-motion vers Web Animations API + CSS Keyframes (32 fichiers).
- **Audit UX/A11y** : Application des guidelines Vercel Web Interface, Anthropic Frontend Design et UX Pro Max.
- **Accessibilité** : Focus visible, aria-labels, rôles ARIA, navigation clavier, touch targets 44px.
- **Couleurs harmonisées** : Bureau (blue), Télétravail (emerald), Formation (amber), Formateur (violet), Congé (rose).
- **Glow effects** : Lueur cyan sur navbar active, boutons primaires, team dropdown.
- **Glass effects** : Cartes et surfaces avec backdrop-blur pour la profondeur.

#### Fonctionnalités
- **Validation des membres** : Le leader peut approuver ou rejeter les demandes d'adhésion.
- **Notifications interactives** : Switches fonctionnels dans les réglages avec sauvegarde Firestore.
- **Couleurs membre** : Le leader attribue une couleur personnalisée à chaque membre de l'équipe.
- **Types de contrat** : Cadre forfait jour, cadre forfait heure, employé — heures configurables.
- **Quitter l'équipe** : Un membre peut quitter ; le leader peut supprimer l'équipe.
- **RTT / RTJ** : Soldes congés adaptés au type de contrat.

#### Technique
- **WAAPI Migration** : Suppression totale de framer-motion, remplacement par `element.animate()` et CSS keyframes.
- **Firestore IDs** : Format `{teamId}_{userId}` pour les documents `team_members` (compatibilité security rules).
- **PWA** : Application installable avec Service Worker, manifest et icônes.
- **Routing i18n** : Migration complète vers `next-intl/navigation` (Link, useRouter, usePathname).
- **Auth Token** : Toutes les API calls utilisent `authFetch` avec Bearer token Firebase.
- **Purge script** : Nettoyage Firestore + Auth + Supabase en une commande.

### v14.2.0

- **Firestore fix** : Résolution erreur Firestore undefined et synchronisation AuthContext avec structure profil.
- **Suppression race condition** : Suppression de la création de profil côté client dans auth-context.

### v14.0.0

- **Server-side auth** : Migration de la création de profil et mise à jour auth vers API server-side pour performance maximale.
- **Bouton déconnexion** : Ajout dans la navbar desktop, mobile et dropdown équipe.
- **PWA** : Application installable avec Service Worker, manifest et icônes.
- **Auth token** : Toutes les API calls utilisent `authFetch` avec Bearer token.
- **Vérification email** : Suppression de la vérification email obligatoire.

### v13.9.0

- **Robustesse inscription** : Amélioration de la robustesse du processus d'inscription et fix erreur auth-26.

### v13.8.0

- **Cohérence nommage** : Harmonisation finale du nommage et polish UI.

### v13.7.0

- **Date de naissance** : Ajout de la date de naissance à l'inscription et correction du système d'anniversaires.

### v13.6.0

- **Nom / Prénom séparés** : Séparation du prénom et du nom dans le formulaire d'inscription.

### v13.5.0

- **Performance** : Parallélisation des tâches post-inscription pour réduire la latence.

### v13.4.0

- **Nettoyage** : Suppression des guides de configuration et de l'exemple .env.

### v13.3.0

- **SEO** : Nettoyage final, purge des données et optimisation SEO.

### v13.2.0

- **Loading loop** : Résolution de la boucle de chargement infinie.
- **SEO** : Ajout sitemap.xml, robots.txt et configuration du domaine.
- **Config** : Mise à jour de la configuration domaine pour absencia.beloucif.com.

### v13.1.0

- **Système Hybride** : Réintroduction de Supabase pour Analytics et Audit Log.
- **Sécurité Leader** : Restriction du Dashboard Analytics au chef de groupe via RLS.
- **Règles métier** : Configuration du nombre minimal de présences.
- **Membership SaaS** : Validation des membres et sécurité du team planner.
- **Fix UI** : Résolution du crash 500 lié au contexte `next-intl` hors contexte.
- **Icônes** : Organisation des icônes Icons8 et optimisation du layout i18n.

### v13.0.0

- **Contrats** : Gestion des contrats employé/cadre avec feeds iCal équipe et couleurs membre.
- **Sécurité** : Validation Zod, HTTP headers sécurisés, règles de présence minimum, accès Analytics restreint.
- **Supabase sync** : Corrections des types pour la synchronisation Supabase.
- **Déploiement** : Ajout `.npmrc` avec legacy-peer-deps pour compatibilité Vercel.

### v11.0.0

- **Internationalisation** : Implémentation complète de next-intl (FR / EN).
- **Calendrier i18n** : Traduction de la page calendrier et correction des fichiers de traduction.

### v10.0.0 — Master Blueprint

- **Design Blueprint** : Migration vers le design system Master Blueprint (fond sombre, accents cyan).
- **Fonts** : Localisation des polices avec next/font/google et mise à jour de la config Tailwind.
- **Phase 3** : Pages maintenance et institution complétées.
- **Polish** : Dernières retouches suivant les règles du design system master.

### v9.0.0 — Ambient Dark

- **Ambient Dark** : Refonte complète du design system avec thème sombre ambiant.
- **Composants redesignés** : calendar-grid, painting-toolbar, LeaveBalanceCard, analytics-dashboard, TeamIndicator, onboarding tutorial, NotificationSender.
- **Pages redesignées** : paramètres, exports, calendrier, Team Planner.
- **Page guide** : Ajout de la page guide utilisateur.
- **Navbar** : Masquage au scroll pour plus d'espace.

### v8.0.0 — Absencia Rebrand

- **Rebrand** : Renommage en « Absencia » avec police Space Grotesk.
- **Design system overhaul** : Refonte complète avec nouvelles migrations consolidées.
- **Noël** : Ajout du compte à rebours de Noël avec animations festives.
- **Invitations** : Système de liens d'invitation pour rejoindre une équipe.
- **Favicon** : Nouveau design calendrier + checkmark.

### v7.0.0 — Amber/Gold Design

- **Design amber/gold** : Refonte UX/UI avec design system amber/gold.
- **Congés séparés** : Jours de congés distincts employé vs cadre (forfait jour).
- **Migrations** : Migration consolidée avec toutes les features (secteur, congés par statut, admin, anniversaires).
- **Mot de passe** : Animation de révélation du mot de passe avec gardiens curieux.

### v6.0.0 — Team Authentication

- **Auth équipe** : Système d'authentification basé sur les équipes.
- **Leave management** : Système de gestion des congés avec types employé/cadre.
- **Audit** : Système de journalisation des audits.
- **Admin** : Système d'administration et affichage des anniversaires au calendrier.
- **Architecture** : Améliorations d'architecture et script de migration consolidé.
- **Sécurité** : Audit de sécurité, rate limiting, protection CSP et SSRF.
- **Performance** : Lazy load du dashboard Analytics (-132KB).

### v5.0.0 — Dark Industrial

- **Dark Industrial** : Refonte design system Dark Industrial Blackout Prod.
- **Simplification** : Suppression stats, page analytics, ajout branding Blackout Prod.
- **Formateur** : Ajout du statut Formateur/Réunion.
- **Demi-journées** : Support AM/PM pour granularité fine.
- **Onboarding** : Tutoriel onboarding première visite avec cookies.
- **Contact** : Pages Contact et Mentions légales.
- **Exports** : Amélioration exports ICS avec compteur de jours.

### v4.0.0 — UX Service Public (DSFR)

- **DSFR** : Refonte complète UX/UI style Service Public (DSFR).
- **Setup** : Page de configuration automatique de la base de données.
- **Inscription** : Ajout des champs prénom, nom et téléphone.
- **Menu utilisateur** : Ajout du menu utilisateur dans le header.
- **Auth** : Ajout de l'authentification Supabase.

### v3.0.0 — Orion SaaS Dashboard

- **Orion UI** : Conversion vers Orion UI Kit (SaaS Dark Mode).
- **Analytics** : Dashboard analytics professionnel style Orion.
- **Dark mode** : Force dark mode et amélioration du design.

### v2.0.0 — IA & Notifications

- **LLM** : Infrastructure LLM avec Ollama puis Hugging Face.
- **Notifications** : Ajout des notifications email.
- **IA automatique** : Génération automatique avec Hugging Face.
- **Favicon** : Ajout du favicon.
- **Fix UI** : Correction des problèmes de contraste dans le générateur IA.

### v1.0.0 — Calendrier Interactif

- **Calendrier** : Calendrier interactif avec sélection par clic/glissé.
- **Exports** : Export ICS pour Google Calendar, Outlook, Apple Calendar.
- **IA Gemini** : Aide à la rédaction de mails d'absence.
- **Liquid Glass UI** : Design Aceternity UI avec Spotlight, TextGenerateEffect, BackgroundBeams.
- **Fix** : Correction du mismatch d'hydratation SSR.

### v0.0.0 — Initial

- **Commit initial** : Structure du projet PGV Planning.

---

## Licence

MIT - Blackout Prod

## Auteur

**Adam Beloucif** - Développeur Full Stack & Designer Produit

[![GitHub](https://img.shields.io/badge/GitHub-Adam--Blf-181717?logo=github)](https://github.com/Adam-Blf)
