# Absencia

![Status](https://img.shields.io/badge/status-production-green)
![Auth](https://img.shields.io/badge/auth-Supabase-blue)
![Security](https://img.shields.io/badge/security-audited-brightgreen)

**Solution professionnelle de gestion des absences d'équipe**

Application web permettant de gérer les absences d'équipe avec authentification, gestion des congés et export ICS.

## Fonctionnalités

### Gestion d'équipe
- **Création d'équipe** : Créez une équipe avec un code unique à 8 caractères
- **Liens d'invitation** : Partagez un lien pour rejoindre facilement
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
| Police | Space Grotesk |
| Validation | Zod |
| Dates | date-fns, date-holidays |
| UI | Lucide React, Sonner |

## Installation

```bash
# Cloner le repository
git clone https://github.com/Adam-Blf/absencia.git
cd absencia

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

**Via SQL Editor (recommandé)**

1. Ouvrez Supabase Dashboard > SQL Editor
2. Copiez le contenu de `supabase/APPLY_MIGRATIONS.sql`
3. Exécutez la requête

## Sécurité

| Mesure | Description |
|--------|-------------|
| Auth | Supabase Auth avec JWT |
| RLS | Isolation des données par équipe |
| Rate Limiting | 10-30 req/min selon endpoint |
| Validation | Zod sur toutes les entrées |
| Audit | Logs automatiques sur actions critiques |
| Headers | CSP, HSTS, X-Frame-Options |

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Démarrer en production |
| `npm run lint` | Vérification ESLint |

## Licence

MIT - Licence ouverte

---

Développé par **Adam Beloucif**
