# PGV Planning

![Status](https://img.shields.io/badge/status-production-green)
![Accessibilité](https://img.shields.io/badge/accessibilité-RGAA-blue)

**Solution professionnelle de gestion des plannings pour le secteur hospitalier**

Application web développée par **Blackout Prod** permettant de gérer son planning professionnel et d'exporter les données au format ICS.

## Fonctionnalités

- **Calendrier interactif** : Sélectionnez vos jours en glissant sur le calendrier (Bureau, Télétravail, Formation, Congés)
- **Export ICS** : Générez des fichiers calendrier compatibles avec tous les clients (Google Calendar, Outlook, Apple Calendar)
- **Compteur intelligent** : Visualisez le nombre de jours par catégorie avant export
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
- Mode reduced-motion supporté

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript (strict) |
| Styles | Tailwind CSS + Custom Healthcare Dark |
| Animations | CSS Animations |
| Validation | Zod |
| Dates | date-fns, date-holidays |
| UI | Lucide React, Sonner |
| IA | HuggingFace (Mistral 7B) |

## Installation

```bash
# Cloner le repository
git clone https://github.com/Adam-Blf/pgvplaning.git
cd PGVDIM

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
```

## Utilisation

### 1. Remplir le calendrier

1. Accédez à l'onglet **Calendrier**
2. Sélectionnez un type de journée (Bureau, Télétravail, Formation, Congés)
3. Cliquez ou glissez sur les jours du calendrier pour les marquer
4. Les données sont sauvegardées automatiquement dans votre navigateur

### 2. Exporter en fichier ICS

1. Accédez à l'onglet **Exporter**
2. Consultez le nombre de jours disponibles pour chaque type
3. Choisissez le type à exporter (Télétravail, Formation, ou Congés)
4. Téléchargez le fichier ICS
5. Importez-le dans votre calendrier

### Comment importer un fichier ICS

**Google Calendar :**
1. Ouvrez Google Calendar
2. Paramètres > Importer et exporter > Importer
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
│   ├── exports/                   # Page export
│   ├── settings/                  # Paramètres
│   └── globals.css                # Styles Medical Healthcare Dark
├── components/
│   ├── features/                  # Composants fonctionnels
│   │   ├── calendar-grid.tsx      # Grille calendrier
│   │   └── painting-toolbar.tsx   # Barre d'outils
│   └── layout/
│       └── dashboard-shell.tsx    # Layout principal
├── hooks/                         # Hooks React
│   └── use-calendar-data.ts       # Données calendrier
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

## Changelog

### 2026-01-19

- Amélioration exports ICS avec compteur de jours par type
- Désactivation automatique si aucun jour disponible
- Adaptation design pour secteur hospitalier
- Logo et favicon Blackout Prod
- Suppression des statistiques (simplification UX)
- Refonte Design System Medical Healthcare Dark
- Suppression de l'authentification

## Licence

MIT - Licence ouverte

---

Développé par **Blackout Prod** - Solutions Hospitalières
