# Absencia

![Status](https://img.shields.io/badge/status-production-green)
![Version](https://img.shields.io/badge/version-13.1.0-blue)
![Auth](https://img.shields.io/badge/auth-Firebase-orange)
![Security](https://img.shields.io/badge/security-OWASP%20Compliant-brightgreen)
![Architecture](https://img.shields.io/badge/architecture-Hybrid%20Firestore--Supabase-blue)

**Solution professionnelle de gestion des absences d'équipe avec Analytics Avancés**

Application web moderne permettant de gérer les absences, congés et télétravail d'équipe avec une architecture hybride Cloud (Firebase pour le temps réel, Supabase pour l'analytics et l'audit).

---

## Fonctionnalités

### Gestion d'équipe & Sécurité

- **Règles de Présence** : Configuration par le leader du nombre minimal de personnes requises.
- **Rôles Hiérarchiques** : Leader (Chef de groupe), Admin et Membre avec permissions granulaires.
- **Sécurité RLS** : Politiques de sécurité Supabase (Row Level Security) garantissant que seul le leader accède aux dashboards analytiques du groupe.
- **Audit Log** : Traçabilité complète de toutes les modifications effectuées par les membres.

### Gestion des congés & Présence

- **Calendrier Interactif** : Sélection intuitive (clic/glissé) pour Bureau, Télétravail, Formation, Congés.
- **Types de Contrats** : Gestion différenciée CDI, CDD, Stagiaire, Alternant, Intérim.
- **Reset Annuel** : Calcul automatique des reports et nouveaux soldes.

### Analytics & Rapports

- **Dashboard Supabase** : Analyses de données historiques, graphiques de répartition et metrics RH.
- **Export ICS** : Synchronisation bidirectionnelle avec Google Calendar, Outlook et Apple.
- **IA Génératrice** : Aide à la rédaction de mails d'absence via Google Gemini.

---

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| Framework | Next.js 15.5 (App Router) |
| Langage | TypeScript 5.7 |
| Real-time DB | Firebase (Auth + Firestore) |
| Analytics DB | Supabase (PostgreSQL + RLS) |
| Styles | Tailwind CSS + Framer Motion |
| Internationalisation | Next-intl (Multilingue) |
| IA | Google Gemini API |
| Tracking | Sentry |

---

## Installation & Configuration

### Prérequis

- Node.js 18+
- Projet Firebase (Web + Admin SDK)
- Projet Supabase (Clés API + Service Role)

### Variables d'environnement (.env.local)

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Changelog

### v13.1.0 (2026-03-10) - Adam Beloucif

- **Système Hybride** : Réintroduction de Supabase pour la gestion des Analytics et de l'Audit Log.
- **Sécurité Leader** : Restriction du Dashboard Analytics au chef de groupe via RLS.
- **Règles métier** : Ajout de la configuration du nombre minimal de présences.
- **Fix UI** : Résolution du crash 500 sur la page d'accueil lié au contexte `next-intl`.
- **Gitignore** : Renforcement de la protection des fichiers `.env`.

### v13.0.0 (2026-03-09)

- Transition vers Next.js 15.1 et React 19.
- Optimisation des performances et refonte du Dashboard principal.

---

## Licence

MIT - Blackout Prod

## Auteur

**Adam Beloucif** - Ingénieur Senior & Designer Produit
