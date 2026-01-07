# Guide de Contribution - PGV Planning

Merci de votre intérêt pour contribuer à PGV Planning !

## Prérequis

- Node.js 18+
- npm 9+
- Git

## Installation pour le développement

```bash
# Cloner le repository
git clone https://github.com/Adam-Blf/pgvplaning.git
cd pgvplaning

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Structure du projet

```
pgvplaning/
├── app/                    # Pages et routes Next.js
│   ├── api/               # Routes API
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── features/          # Composants fonctionnels
│   ├── layout/            # Composants de mise en page
│   └── ui/                # Composants UI réutilisables
├── hooks/                 # Hooks React personnalisés
├── lib/                   # Utilitaires et services
│   ├── schemas/           # Schémas de validation Zod
│   ├── services/          # Services métier
│   └── utils/             # Fonctions utilitaires
└── __tests__/             # Tests
    ├── unit/              # Tests unitaires
    └── integration/       # Tests d'intégration
```

## Conventions de code

### Style

- TypeScript strict
- ESLint + Prettier
- Nommage en français pour les variables métier
- Commentaires en français

### Commits

Format: `type(scope): description`

Types:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `test`: Ajout de tests
- `chore`: Maintenance

Exemple: `feat(form): ajouter validation des dates`

### Branches

- `main`: Production
- `develop`: Développement
- `feature/*`: Nouvelles fonctionnalités
- `fix/*`: Corrections de bugs

## Tests

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## Pull Request

1. Créer une branche depuis `develop`
2. Implémenter les changements
3. Ajouter/mettre à jour les tests
4. Vérifier que tous les tests passent
5. Créer une PR vers `develop`

### Checklist PR

- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas d'erreurs TypeScript
- [ ] Pas d'erreurs ESLint
- [ ] Build réussi

## Sécurité

- Ne jamais commiter de secrets
- Valider toutes les entrées utilisateur avec Zod
- Utiliser les headers de sécurité

## Questions

Ouvrir une issue sur GitHub pour toute question.

---

Merci pour votre contribution !
