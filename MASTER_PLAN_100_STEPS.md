# ABSENCIA - MASTER PLAN 100 STEPS

> **Projet** : Absencia - Gestion des Absences d'Equipe
> **Stack** : Next.js 15 (App Router), React 19, TypeScript Strict, Supabase
> **Version actuelle** : 9.0.0
> **Derniere mise a jour** : 2026-01-22

---

## LEGENDE

- [x] Complete
- [ ] A faire
- [~] En cours / Partiel

---

## PHASE 1 : SETUP INFRA & CONFIG (001-010)

| Step | Description | Status |
|------|-------------|--------|
| [x] **001** | Initialiser projet Next.js 15 avec App Router | DONE |
| [x] **002** | Configurer `tsconfig.json` mode Strict | DONE |
| [x] **003** | Installer deps critiques : `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `date-fns`, `lucide-react` | DONE |
| [x] **004** | Configurer Tailwind CSS + PostCSS | DONE |
| [x] **005** | Setup ESLint + config Next.js | DONE |
| [x] **006** | Creer `.env.local.example` avec variables Supabase | DONE |
| [x] **007** | Configurer `next.config.ts` (headers securite, CSP) | DONE |
| [x] **008** | Setup Framer Motion pour animations | DONE |
| [x] **009** | Configurer Jest + Testing Library | DONE |
| [x] **010** | Creer `vercel.json` pour deployment | DONE |

---

## PHASE 2 : DATABASE ARCHITECTURE (011-020)

| Step | Description | Status |
|------|-------------|--------|
| [x] **011** | Creer table `profiles` (sync auth.users) | DONE |
| [x] **012** | Creer table `teams` avec code unique 8 chars | DONE |
| [x] **013** | Creer table `team_members` (junction table) | DONE |
| [x] **014** | Creer table `calendar_entries` avec statuts | DONE |
| [x] **015** | Creer table `team_invitations` pour liens d'invitation | DONE |
| [x] **016** | Creer table `audit_logs` pour securite | DONE |
| [x] **017** | Implementer RLS (Row Level Security) complet | DONE |
| [x] **018** | Creer fonctions helper (get_user_team_ids, is_team_leader, etc.) | DONE |
| [x] **019** | Creer triggers (auto-code, updated_at, leave_balance) | DONE |
| [x] **020** | Generer types TypeScript depuis schema SQL | DONE |

---

## PHASE 3 : AUTHENTIFICATION BASE (021-030)

| Step | Description | Status |
|------|-------------|--------|
| [x] **021** | Configurer client Supabase (Singleton Pattern) | DONE |
| [x] **022** | Creer server client Supabase avec cookies | DONE |
| [x] **023** | Implementer middleware auth Next.js | DONE |
| [x] **024** | Creer page `/login` avec OAuth | DONE |
| [x] **025** | Creer callback `/auth/callback` pour OAuth | DONE |
| [x] **026** | Creer hook `useAuth` pour contexte utilisateur | DONE |
| [x] **027** | Implementer AuthProvider context | DONE |
| [x] **028** | Gerer mode invite (localStorage) sans auth | DONE |
| [x] **029** | Creer page `/settings` profil utilisateur | DONE |
| [x] **030** | Ajouter protection routes authentifiees | DONE |

---

## PHASE 4 : ONBOARDING & TEAMS (031-040)

| Step | Description | Status |
|------|-------------|--------|
| [x] **031** | Creer page `/team/setup` (choix creer/rejoindre) | DONE |
| [x] **032** | Creer page `/team/create` (formulaire creation) | DONE |
| [x] **033** | Creer page `/team/join` (formulaire code 8 chars) | DONE |
| [x] **034** | Implementer fonction `join_team_by_code` SQL | DONE |
| [x] **035** | Creer systeme d'invitations par lien | DONE |
| [x] **036** | Creer page `/invite/[token]` pour accepter invitation | DONE |
| [x] **037** | API route `/api/teams` (CRUD equipes) | DONE |
| [x] **038** | API route `/api/teams/join` (rejoindre) | DONE |
| [x] **039** | API route `/api/teams/invitations` (gestion invitations) | DONE |
| [x] **040** | Creer composant `TeamIndicator` dans header | DONE |

---

## PHASE 5 : UI SHELL & LAYOUT (041-050)

| Step | Description | Status |
|------|-------------|--------|
| [x] **041** | Creer layout principal `/app/layout.tsx` | DONE |
| [x] **042** | Implementer DashboardShell (sidebar/header) | DONE |
| [x] **043** | Creer navigation responsive (mobile/desktop) | DONE |
| [x] **044** | Implementer theme Dark Mode par defaut | DONE |
| [x] **045** | Creer composants UI base (Button, Card, Input) | DONE |
| [x] **046** | Implementer Sonner pour toast notifications | DONE |
| [x] **047** | Creer page loading.tsx avec skeleton | DONE |
| [x] **048** | Creer page error.tsx globale | DONE |
| [x] **049** | Creer page not-found.tsx (404) | DONE |
| [x] **050** | Implementer manifest.ts + icons PWA | DONE |

---

## PHASE 6 : CORE FEATURE - GESTION MEMBRES (051-060)

| Step | Description | Status |
|------|-------------|--------|
| [x] **051** | Creer page `/team/members` (liste membres) | DONE |
| [x] **052** | Implementer roles (leader, admin, member) | DONE |
| [x] **053** | Creer API `/api/admin/members` (gestion membres) | DONE |
| [x] **054** | Implementer promotion/demotion admin | DONE |
| [x] **055** | Creer page `/team/settings` (config equipe) | DONE |
| [x] **056** | Ajouter type employe (employee/executive) | DONE |
| [x] **057** | Implementer solde conges automatique | DONE |
| [x] **058** | Creer fonction `get_leave_info` SQL | DONE |
| [x] **059** | API route `/api/teams/leave-info` | DONE |
| [x] **060** | Composant `LeaveBalanceCard` avec stats | DONE |

---

## PHASE 7 : CORE FEATURE - CALENDRIER (061-070)

| Step | Description | Status |
|------|-------------|--------|
| [x] **061** | Creer page `/calendar` principale | DONE |
| [x] **062** | Implementer `CalendarGrid` composant | DONE |
| [x] **063** | Navigation mois (precedent/suivant/aujourd'hui) | DONE |
| [x] **064** | Afficher jours feries francais (date-holidays) | DONE |
| [x] **065** | Implementer selection multi-jours (drag) | DONE |
| [x] **066** | Creer toolbar de peinture statuts | DONE |
| [x] **067** | Gestion demi-journees (AM/PM/FULL) | DONE |
| [x] **068** | Synchronisation Realtime Supabase | DONE |
| [x] **069** | Mode localStorage pour invite | DONE |
| [x] **070** | Responsive calendrier mobile | DONE |

---

## PHASE 8 : CORE FEATURE - EVENEMENTS (071-080)

| Step | Description | Status |
|------|-------------|--------|
| [x] **071** | Definir statuts (WORK, REMOTE, LEAVE, SICK, etc.) | DONE |
| [x] **072** | Creer page `/team-planner` (vue equipe) | DONE |
| [x] **073** | Afficher tous membres sur calendrier | DONE |
| [x] **074** | Creer composant status picker | DONE |
| [x] **075** | Implementer decompte automatique conges | DONE |
| [x] **076** | Triggers SQL pour update leave_balance | DONE |
| [x] **077** | Restauration solde a suppression | DONE |
| [x] **078** | Vue par statut (get_leave_days_by_status) | DONE |
| [x] **079** | Creer page `/admin` pour leaders | DONE |
| [x] **080** | API `/api/admin/team` (stats equipe) | DONE |

---

## PHASE 9 : DATA VIZ & EXPORTS (081-090)

| Step | Description | Status |
|------|-------------|--------|
| [x] **081** | Creer page `/exports` | DONE |
| [x] **082** | Implementer export ICS (lib ics) | DONE |
| [x] **083** | API route `/api/generate-ics` | DONE |
| [x] **084** | Creer page `/analytics` | DONE |
| [x] **085** | Composant `AnalyticsDashboard` avec Recharts | DONE |
| [x] **086** | Vue statistiques par statut | DONE |
| [x] **087** | Graphiques conges utilises/restants | DONE |
| [x] **088** | API `/api/llm` pour generation messages | DONE |
| [x] **089** | Compteur intelligent jours | DONE |
| [x] **090** | Export planning individuel/equipe | DONE |

---

## PHASE 10 : POLISH, SECURITY & TESTS (091-100)

| Step | Description | Status |
|------|-------------|--------|
| [x] **091** | Implementer Rate Limiting (lib/rate-limit.ts) | DONE |
| [x] **092** | Ajouter audit logging sur actions critiques | DONE |
| [x] **093** | Creer page `/mentions-legales` | DONE |
| [x] **094** | Creer page `/contact` | DONE |
| [x] **095** | Creer page `/guide` (tutoriel) | DONE |
| [x] **096** | Ajouter validation Zod sur toutes les routes | DONE |
| [x] **097** | Creer tests unitaires Jest | DONE |
| [ ] **098** | Tests E2E Playwright | TODO |
| [ ] **099** | Audit securite complet (OWASP) | TODO |
| [~] **100** | Documentation README complete | PARTIAL |

---

## RESUME PROGRESSION

| Phase | Description | Progression |
|-------|-------------|-------------|
| Phase 1 | Setup Infra & Config | 10/10 (100%) |
| Phase 2 | Database Architecture | 10/10 (100%) |
| Phase 3 | Authentification Base | 10/10 (100%) |
| Phase 4 | Onboarding & Teams | 10/10 (100%) |
| Phase 5 | UI Shell & Layout | 10/10 (100%) |
| Phase 6 | Gestion Membres | 10/10 (100%) |
| Phase 7 | Calendrier | 10/10 (100%) |
| Phase 8 | Evenements | 10/10 (100%) |
| Phase 9 | Data Viz & Exports | 10/10 (100%) |
| Phase 10 | Polish & Tests | 7/10 (70%) |

**TOTAL : 97/100 etapes completees (97%)**

---

## FICHIERS CLES

### Configuration
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript strict mode
- `tailwind.config.ts` - Styles
- `next.config.ts` - Next.js + security headers
- `middleware.ts` - Auth middleware

### Database
- `supabase/APPLY_MIGRATIONS.sql` - Script complet
- `types/database.ts` - Types TypeScript
- `lib/supabase/client.ts` - Client browser
- `lib/supabase/server.ts` - Client server

### Core Features
- `app/calendar/page.tsx` - Calendrier
- `app/team-planner/page.tsx` - Vue equipe
- `app/exports/page.tsx` - Exports ICS
- `app/analytics/page.tsx` - Statistiques

### Composants
- `components/features/calendar-grid.tsx`
- `components/features/leave-balance-card.tsx`
- `components/features/analytics-dashboard.tsx`
- `components/layout/dashboard-shell.tsx`

---

## PROCHAINES ETAPES PRIORITAIRES

1. **[STEP 098]** Implementer tests E2E avec Playwright
2. **[STEP 099]** Executer audit securite OWASP complet
3. **[STEP 100]** Finaliser documentation (API docs, contributing guide)

---

## NOTES TECHNIQUES

### Stack Validee
- Next.js 15.1.0 avec App Router
- React 19.0.0
- TypeScript 5.7.2 (strict: true)
- Supabase (PostgreSQL + Auth + RLS)
- Tailwind CSS 3.4.17
- Framer Motion 11.18.2
- Zod 3.24.1
- date-fns 4.1.0

### Securite Implementee
- Row Level Security (RLS) sur toutes les tables
- Rate limiting sur API routes
- Audit logging automatique
- Validation Zod sur inputs
- Headers securite (CSP, HSTS, X-Frame-Options)
- Authentification Supabase (OAuth)

---

*Document genere par Mike (Team Leader) - Protocole Centurion*
