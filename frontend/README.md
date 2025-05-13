# GraphLab Frontend

GraphLab est une application web interactive pour apprendre et expérimenter avec des graphes.

## 🚀 Fonctionnalités

- **Coloration de Graphes**
  - Mode défi avec des graphes prédéfinis et des pastilles limitées
  - Mode libre avec des graphes prédéfinis et des pastilles illimitées
  - Mode création pour concevoir vos propres graphes
  - Système de pastilles de couleurs interactif
  - Validation en temps réel des règles de coloration
  - Chronomètre pour suivre votre progression
  - Défis d'optimisation du nombre de couleurs

- **Arbre Couvrant**
  - Mode interactif avec des graphes de différentes tailles
  - Trois types de poids : prédéfinis, aléatoires ou tous à 1
  - Visualisation des algorithmes de Prim, Kruskal et Boruvka
  - Mode manuel et automatique pour la visualisation
  - Suivi du coût total et comparaison avec l'optimal
  - Chronomètre pour mesurer votre performance
  - Validation en temps réel de votre solution

## 🛠️ Tech Stack

- **Framework**: React 19
- **Outil de Build**: Vite 6
- **Routing**: React Router DOM 7
- **Visualisation de Graphes**: Cytoscape.js
- **Qualité de Code**: ESLint 9

## 🏗️ Structure du Projet

```
frontend/
├── src/
│   ├── components/         # Composants React
│   │   ├── Navigation/    # Barre de navigation et Pied de page
│   │   └── pages/         # Composants des pages principales
│   ├── styles/            # Styles CSS
│   ├── utils/             # Fonctions utilitaires
│   ├── App.jsx           # Composant principal de l'application
│   └── main.jsx          # Point d'entrée de l'application
├── public/               # Assets statiques
└── package.json         # Dépendances du projet
```

## 🚀 Pour Commencer

1. **Installation**
   ```bash
   npm install
   ```

2. **Développement**
   ```bash
   npm run dev
   ```

3. **Build**
   ```bash
   npm run build
   ```

4. **Prévisualisation du Build de Production**
   ```bash
   npm run preview
   ```

## 🧪 Scripts Disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run preview` - Prévisualiser le build de production
- `npm run lint` - Exécuter ESLint

## 🌐 Routes

- `/` - Page d'accueil
- `/coloration` - Page principale de coloration de graphes
- `/coloration/defi` - Défis de coloration
- `/coloration/libre` - Mode libre de coloration
- `/coloration/creation` - Création de graphes
- `/arbre-couvrant` - Page principale d'arbre couvrant
- `/arbre-couvrant/try` - Mode interactif d'arbre couvrant
- `/arbre-couvrant/:algo/:graphId` - Visualisation d'algorithmes spécifiques

## 📝 Licence

Ce projet fait partie de la plateforme GraphLab propulsé par Terra Numerica.