# PGV Planning

![Status](https://img.shields.io/badge/status-production-green)
![Accessibilité](https://img.shields.io/badge/accessibilité-RGAA-blue)

**Service de gestion des plannings et génération de fichiers ICS**

Application web publique inspirée du Design System de l'État français (DSFR) permettant de gérer son planning professionnel et d'exporter les données au format ICS.

## Fonctionnalités

- **Calendrier interactif** : Sélectionnez vos jours en glissant sur le calendrier (Bureau, Télétravail, Formation, Congés)
- **Export ICS** : Générez des fichiers calendrier compatibles avec tous les clients (Google Calendar, Outlook, Apple Calendar)
- **Statistiques** : Visualisez la répartition de vos jours par catégorie
- **Générateur de messages** : Créez des messages d'absence automatiques (Out of Office) grâce à l'IA
- **Sans inscription** : Utilisation immédiate, données stockées localement
- **Accessible** : Interface conforme aux standards d'accessibilité
- **Sécurisé** : Headers CSP, rate limiting, pas de données transmises

## Design System

L'interface utilise un **Design System Medical Healthcare Dark** :

- Palette professionnelle (Dark Blue #0c1222, Accent Teal #06b6d4)
- Typographie médicale (Plus Jakarta Sans + Inter)
- Micro-interactions et animations fluides
- Effets de glow et transitions subtiles
- Navigation intuitive avec feedback visuel
- Messages d'information standardisés
- Accessibilité RGAA
- Mode reduced-motion supporté

### Micro-Interactions

- Boutons avec effets de ripple et scale au clic
- Cards avec bordures gradient animées au hover
- Éléments du calendrier avec effets de glow
- Inputs avec transitions de focus élaborées
- Navigation avec animations de slide
- Badges avec effets de lift

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript (strict) |
| Styles | Tailwind CSS + Custom Healthcare Dark |
| Animations | Framer Motion + CSS Animations |
| Graphiques | Recharts |
| Validation | Zod |
| Dates | date-fns, date-holidays |
| Fichiers ICS | ics |
| UI | Lucide React, Sonner |
| IA | HuggingFace (Mistral 7B) |

## Installation

```bash
# Cloner le repository
git clone https://github.com/Adam-Blf/PGVDIM.git
cd PGVDIM

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build

# Lancer les tests
npm test
```

## Utilisation

### 1. Remplir le calendrier

1. Accédez à l'onglet **Calendrier**
2. Sélectionnez un type de journée (Bureau, Télétravail, Formation, Congés)
3. Cliquez ou glissez sur les jours du calendrier pour les marquer
4. Les données sont sauvegardées automatiquement dans votre navigateur

### 2. Consulter les statistiques

1. Accédez à l'onglet **Statistiques**
2. Visualisez la répartition de vos jours par catégorie
3. Consultez les graphiques de synthèse

### 3. Exporter en fichier ICS

1. Accédez à l'onglet **Exporter**
2. Choisissez le type à exporter (Télétravail, Formation, ou Congés)
3. Téléchargez le fichier ICS
4. Importez-le dans votre calendrier

### Comment importer un fichier ICS

**Google Calendar :**
1. Ouvrez Google Calendar
2. ⚙️ Paramètres > Importer et exporter > Importer
3. Sélectionnez votre fichier .ics

**Outlook :**
1. Fichier > Ouvrir et exporter > Importer/Exporter
2. Importer un fichier iCalendar (.ics)

**Apple Calendar :**
1. Double-cliquez sur le fichier .ics
2. Choisissez le calendrier cible

## Architecture

```
PGVDIM/
├── app/                           # Pages Next.js (App Router)
│   ├── api/                       # API Routes
│   │   ├── generate-ics/          # Génération ICS
│   │   └── llm/                   # Service IA
│   ├── calendar/                  # Page calendrier
│   ├── analytics/                 # Page statistiques
│   ├── exports/                   # Page export
│   ├── settings/                  # Paramètres
│   └── globals.css                # Styles DSFR
├── components/
│   ├── features/                  # Composants fonctionnels
│   │   ├── calendar-grid.tsx      # Grille calendrier
│   │   └── painting-toolbar.tsx   # Barre d'outils
│   └── layout/
│       └── dashboard-shell.tsx    # Layout principal
├── hooks/                         # Hooks React
│   ├── use-calendar-data.ts       # Données calendrier
│   └── use-calendar-stats.ts      # Statistiques
├── lib/
│   ├── schemas/                   # Validation Zod
│   └── utils/                     # Utilitaires
└── middleware.ts                  # Sécurité
```

## Sécurité

- **Sans authentification** : Pas de compte requis, données locales
- **Validation** : Toutes les entrées validées avec Zod
- **Headers** : CSP, HSTS, X-Frame-Options
- **Rate Limiting** : 30 requêtes/minute par IP
- **Données locales** : Stockage dans localStorage uniquement

## Accessibilité

- Skip link vers le contenu principal
- Structure sémantique HTML5
- Labels ARIA sur les éléments interactifs
- Support du mode reduced-motion
- Contraste conforme WCAG AA
- Navigation au clavier

## Déploiement

L'application est optimisée pour Vercel :

```bash
vercel
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Démarrer en production |
| `npm run lint` | Vérification ESLint |
| `npm test` | Lancer les tests |

## Changelog

### 2026-01-19

- Ajout de micro-interactions et "juice" au design system
  - Effets de ripple sur les boutons
  - Bordures gradient animées sur les cards
  - Effets de glow sur les éléments du calendrier
  - Animations de slide sur la navigation
  - Transitions élaborées sur les inputs
  - Nouvelles animations (subtle-pulse, ripple, shimmer)
  - Utilitaires CSS pour glow et hover lift
- Refonte complète UX/UI style Medical Healthcare Dark
- Suppression de l'authentification obligatoire
- Application accessible sans inscription
- Amélioration de l'accessibilité
- Design professionnel avec animations performantes

## Licence

MIT - Licence ouverte

---

Fait avec ❤️ en France
