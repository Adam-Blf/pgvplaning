# Absencia

![Status](https://img.shields.io/badge/status-production-green)
![Version](https://img.shields.io/badge/version-9.0.0-blue)
![Auth](https://img.shields.io/badge/auth-Supabase-purple)
![Security](https://img.shields.io/badge/security-OWASP%20Compliant-brightgreen)
![Tests](https://img.shields.io/badge/tests-E2E%20Playwright-orange)

**Solution professionnelle de gestion des absences d'equipe**

Application web moderne permettant de gerer les absences, conges et teletravail d'equipe avec authentification securisee, synchronisation temps reel et export ICS.

---

## Fonctionnalites

### Gestion d'equipe
- **Creation d'equipe** : Creez une equipe avec un code unique a 8 caracteres
- **Liens d'invitation** : Partagez un lien pour rejoindre facilement
- **Roles hierarchiques** : Leader / Admin / Membre
- **Types d'employes** : Non-cadre / Cadre avec conges differencies
- **Secteurs** : Public / Prive

### Gestion des conges
- **Solde automatique** : Decompte et reset annuel automatique
- **Configuration flexible** : Jours de conges par type d'employe
- **Vue d'equipe** : Calendrier partage entre membres
- **Statistiques** : Dashboard analytique complet

### Calendrier interactif
- **Selection intuitive** : Cliquez ou glissez pour marquer les jours
- **Demi-journees** : Support matin/apres-midi/journee complete
- **Statuts multiples** : Bureau, Teletravail, Formation, Conges, Maladie, etc.
- **Synchronisation temps reel** : Via Supabase Realtime
- **Mode invite** : Utilisation sans compte (localStorage)

### Exports et Analytics
- **Export ICS** : Compatible Google Calendar, Outlook, Apple Calendar
- **Compteur intelligent** : Jours restants par categorie
- **Dashboard** : Graphiques et statistiques avec Recharts
- **Generateur IA** : Messages d'absence automatiques

---

## Stack Technique

| Categorie | Technologies |
|-----------|-------------|
| Framework | Next.js 15.1 (App Router) |
| Langage | TypeScript 5.7 (strict mode) |
| Auth/DB | Supabase (PostgreSQL + RLS + Auth) |
| Styles | Tailwind CSS 3.4 |
| Animations | Framer Motion 11 |
| Validation | Zod 3.24 |
| Tests | Jest + Playwright |
| UI Icons | Lucide React |
| Notifications | Sonner |
| Charts | Recharts |

---

## Installation

### Prerequis
- Node.js 18+
- npm ou yarn
- Compte Supabase

### Etapes

```bash
# 1. Cloner le repository
git clone https://github.com/Adam-Blf/absencia.git
cd absencia

# 2. Installer les dependances
npm install

# 3. Copier les variables d'environnement
cp .env.example .env.local

# 4. Configurer les variables (voir section suivante)

# 5. Lancer en developpement
npm run dev
```

### Variables d'environnement

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx  # Pour les API routes (optionnel)
```

---

## Configuration Supabase

### 1. Creer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Creez un nouveau projet
3. Notez l'URL et les cles API

### 2. Appliquer les migrations

**Via SQL Editor (recommande)**

1. Ouvrez Supabase Dashboard > SQL Editor
2. Copiez le contenu de `supabase/APPLY_MIGRATIONS.sql`
3. Executez la requete

### 3. Configurer l'authentification

1. Dashboard > Authentication > Providers
2. Activez Email (avec confirmation)
3. Optionnel: Activez OAuth (Google, GitHub)

---

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de developpement |
| `npm run build` | Build production |
| `npm run start` | Demarrer en production |
| `npm run lint` | Verification ESLint |
| `npm run test` | Tests unitaires Jest |
| `npm run test:e2e` | Tests E2E Playwright |
| `npm run test:e2e:ui` | Tests E2E avec interface |
| `npm run test:e2e:headed` | Tests E2E en mode visible |

---

## Securite

### Mesures implementees

| Mesure | Description |
|--------|-------------|
| **Auth** | Supabase Auth avec JWT |
| **RLS** | Row Level Security sur toutes les tables |
| **Rate Limiting** | 5-30 req/min selon endpoint |
| **Validation** | Zod sur toutes les entrees |
| **Audit** | Logs automatiques sur actions critiques |
| **Headers** | CSP, HSTS, X-Frame-Options, etc. |
| **XSS** | Protection via CSP et sanitization |
| **CSRF** | Tokens Supabase integres |

### Conformite OWASP

L'application a ete auditee selon les standards **OWASP Top 10 (2021)**.
Voir `docs/SECURITY_AUDIT.md` pour le rapport complet.

---

## Architecture

```
absencia/
|-- app/                    # Pages Next.js (App Router)
|   |-- api/               # API Routes
|   |-- calendar/          # Page calendrier
|   |-- team/              # Pages equipe
|   |-- analytics/         # Dashboard stats
|   +-- ...
|-- components/
|   |-- features/          # Composants metier
|   +-- layout/            # Layout et navigation
|-- hooks/                 # Custom React hooks
|-- lib/
|   |-- supabase/          # Clients Supabase
|   |-- schemas/           # Schemas Zod
|   +-- utils.ts           # Utilitaires
|-- types/                 # Types TypeScript
|-- supabase/
|   +-- migrations/        # Migrations SQL
|-- e2e/                   # Tests E2E Playwright
+-- __tests__/             # Tests unitaires
```

---

## Tests

### Tests unitaires (Jest)

```bash
npm run test
```

Couvre:
- Schemas de validation
- Generation ICS
- Utilitaires

### Tests E2E (Playwright)

```bash
# Installer les navigateurs (une seule fois)
npx playwright install

# Lancer les tests
npm run test:e2e

# Avec interface graphique
npm run test:e2e:ui
```

Couvre:
- Authentification (login/signup)
- Creation/jonction equipe
- Navigation calendrier
- Responsive design

---

## API Reference

### Equipes

| Endpoint | Methode | Description |
|----------|---------|-------------|
| `/api/teams` | GET | Obtenir l'equipe de l'utilisateur |
| `/api/teams` | POST | Creer une nouvelle equipe |
| `/api/teams/join` | POST | Rejoindre une equipe par code |
| `/api/teams/[id]` | DELETE | Quitter une equipe |

### Calendrier

| Endpoint | Methode | Description |
|----------|---------|-------------|
| `/api/generate-ics` | POST | Generer fichier ICS |
| `/api/teams/birthdays` | GET | Obtenir les anniversaires |
| `/api/teams/leave-info` | GET | Obtenir solde conges |

### Administration

| Endpoint | Methode | Description |
|----------|---------|-------------|
| `/api/admin/members` | GET/POST | Gestion des membres |
| `/api/admin/team` | GET/PUT | Configuration equipe |

---

## Deploiement

### Vercel (recommande)

1. Connectez votre repo GitHub a Vercel
2. Configurez les variables d'environnement
3. Deployez automatiquement a chaque push

### Docker (optionnel)

```bash
docker build -t absencia .
docker run -p 3000:3000 absencia
```

---

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines de contribution.

1. Fork le projet
2. Creez une branche (`git checkout -b feature/amazing-feature`)
3. Commitez vos changements (`git commit -m 'feat: add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

---

## Changelog

### v9.0.0 (2026-01-22)
- Tests E2E Playwright complets
- Audit securite OWASP
- Documentation finale
- 100% des etapes completees

### v8.0.0 (2026-01-21)
- Rate limiting sur API
- Audit logging
- Validation Zod complete
- Headers de securite

### v7.0.0 (2026-01-20)
- Export ICS
- Dashboard analytics
- Generateur messages IA

### v6.0.0 (2026-01-19)
- Gestion conges automatique
- Types d'employes
- Vue equipe complete

### v5.0.0 (2026-01-18)
- Calendrier interactif
- Mode peinture
- Demi-journees

---

## Licence

MIT - Licence ouverte

---

## Auteur

**Adam Beloucif**

---

*Projet termine a 100% - 100/100 etapes completees*
