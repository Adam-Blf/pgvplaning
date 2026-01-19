# PGV Planning Pro

![Status](https://img.shields.io/badge/status-production-green)
![Auth](https://img.shields.io/badge/auth-Supabase-blue)
![Security](https://img.shields.io/badge/security-audited-brightgreen)

**Solution professionnelle de gestion des plannings d'équipe avec suivi des congés**

Application web permettant de gérer le planning d'équipe avec authentification, gestion des congés et export ICS.

## Fonctionnalités

### Gestion d'équipe
- **Création d'équipe** : Créez une équipe avec un code unique à 8 caractères
- **Rejoindre une équipe** : Rejoignez via code d'invitation
- **Rôles** : Leader (gestion complète) / Membre (consultation)
- **Gestion des membres** : Liste, rôles, types d'employés

### Gestion des congés
- **Types d'employés** : Employé (25j) / Cadre (30j)
- **Solde automatique** : Décompte et reset annuel automatique
- **Vue d'équipe** : Calendrier partagé entre membres

### Calendrier
- **Sélection interactive** : Glissez pour marquer les jours
- **Statuts** : Bureau, Télétravail, Formation, Formateur, Congés, Absent
- **Synchronisation** : Données partagées en temps réel (Supabase)
- **Mode invité** : Utilisation sans compte (localStorage)

### Exports
- **Export ICS** : Compatible Google Calendar, Outlook, Apple Calendar
- **Compteur intelligent** : Jours restants par catégorie
- **Générateur IA** : Messages d'absence automatiques

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript (strict) |
| Auth/DB | Supabase (PostgreSQL + RLS) |
| Styles | Tailwind CSS |
| Animations | Framer Motion |
| Validation | Zod |
| Dates | date-fns, date-holidays |
| UI | Lucide React, Sonner |
| IA | HuggingFace (Mistral 7B) |

## Installation

```bash
# Cloner le repository
git clone https://github.com/Adam-Blf/PGVDIM.git
cd PGVDIM

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Lancer en développement
npm run dev
```

## Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et les clés API

### 2. Configurer les variables d'environnement

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx  # Pour les API routes
```

### 3. Appliquer les migrations

**Option A : Via SQL Editor (recommandé)**

1. Ouvrez Supabase Dashboard > SQL Editor
2. Copiez le contenu de `supabase/APPLY_MIGRATIONS.sql`
3. Exécutez la requête

**Option B : Via Supabase CLI**

```bash
# Installer le CLI (Windows)
scoop install supabase

# Ou via NPM (local au projet)
npx supabase login
npx supabase link --project-ref <votre-project-ref>
npx supabase db push
```

## Architecture

```
PGVDIM/
├── app/
│   ├── api/
│   │   ├── teams/              # API équipes (CRUD, join, leave)
│   │   ├── generate-ics/       # Export ICS
│   │   └── llm/                # Service IA
│   ├── calendar/               # Calendrier d'équipe
│   ├── team/
│   │   ├── setup/              # Choix créer/rejoindre
│   │   ├── create/             # Création d'équipe
│   │   ├── join/               # Rejoindre avec code
│   │   ├── members/            # Gestion membres
│   │   └── settings/           # Paramètres équipe
│   ├── login/                  # Authentification
│   └── settings/               # Paramètres utilisateur
├── components/
│   ├── features/               # Composants métier
│   └── layout/                 # Layout & navigation
├── hooks/
│   ├── use-calendar-data.ts    # Données calendrier
│   ├── use-auth.ts             # État auth
│   └── use-team.ts             # Contexte équipe
├── lib/
│   ├── supabase/               # Clients Supabase
│   ├── rate-limit.ts           # Rate limiting
│   ├── audit.ts                # Logging sécurisé
│   └── constants/              # Configuration
├── contexts/
│   └── team-context.tsx        # Provider équipe
├── supabase/
│   ├── migrations/             # Fichiers SQL
│   └── APPLY_MIGRATIONS.sql    # Script consolidé
└── middleware.ts               # Auth & redirections
```

## Base de données

### Tables principales

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (sync avec auth.users) |
| `teams` | Équipes avec code unique |
| `team_members` | Membres avec rôle et solde congés |
| `calendar_entries` | Entrées calendrier par équipe |
| `audit_logs` | Logs de sécurité |

### Row Level Security (RLS)

- Membres voient uniquement leur équipe
- Leaders peuvent gérer les membres
- Chaque utilisateur gère ses propres entrées
- Audit logs consultables par leaders

## Sécurité

| Mesure | Description |
|--------|-------------|
| Auth | Supabase Auth avec JWT |
| RLS | Isolation des données par équipe |
| Rate Limiting | 10-30 req/min selon endpoint |
| Validation | Zod sur toutes les entrées |
| Audit | Logs automatiques sur actions critiques |
| Headers | CSP, HSTS, X-Frame-Options |

### Rate Limits

| Endpoint | Limite |
|----------|--------|
| Teams API | 10/min |
| Join Team | 5/min (anti brute-force) |
| LLM | 3/min |
| Default | 30/min |

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Démarrer en production |
| `npm run lint` | Vérification ESLint |

## Changelog

### 2024-01-23
- Architecture Supabase améliorée (contraintes, index, RLS)
- Migration consolidée pour déploiement facile
- Vue statistiques congés par équipe

### 2024-01-22
- Système d'audit logs avec triggers automatiques
- Documentation Redis pour production

### 2024-01-21
- Gestion des congés avec types d'employés
- Décompte automatique du solde
- Reset annuel automatique

### 2024-01-20
- Système d'équipes avec codes uniques
- Authentification Supabase
- RLS policies sans récursion

### 2024-01-19
- Mode invité (localStorage)
- Export ICS avec compteur
- Design Medical Healthcare Dark

## Production

### Recommandations

1. **Rate Limiting** : Migrer vers Redis (voir `lib/rate-limit.ts`)
2. **Monitoring** : Activer Supabase Analytics
3. **Backup** : Configurer PITR sur Supabase
4. **CSRF** : Implémenter tokens si besoin

### Déploiement Vercel

```bash
vercel

# Variables d'environnement requises
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Licence

MIT - Licence ouverte

---

Développé par **Adam Beloucif**
