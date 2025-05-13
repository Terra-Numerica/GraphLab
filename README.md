# GraphLab

GraphLab est une plateforme éducative interactive pour l'apprentissage des graphes, développée par Terra Numerica.

## 🎯 Objectif

GraphLab vise à rendre l'apprentissage des graphes plus accessible et interactif grâce à des visualisations dynamiques et des exercices pratiques.

## 🚀 Fonctionnalités Principales

### Coloration de Graphes
- Mode défi avec des graphes prédéfinis et des pastilles limitées
- Mode libre avec des graphes prédéfinis et des pastilles illimitées
- Mode création pour concevoir vos propres graphes
- Visualisation interactive et validation en temps réel

### Arbre Couvrant
- Mode interactif avec des graphes de différentes tailles
- Visualisation des algorithmes de Prim, Kruskal et Boruvka
- Comparaison avec les solutions optimales
- Exercices pratiques avec différents types de poids

## 🏗️ Architecture

Le projet est divisé en deux parties principales :

### Frontend
- Application React moderne
- Interface utilisateur interactive
- Visualisation des graphes avec Cytoscape.js
- Design responsive et intuitif

### Backend
- API RESTful avec Express
- Base de données MongoDB
- Sécurisation avec JWT
- Validation des données avec Zod

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite 6
- Cytoscape.js
- React Router DOM 7

### Backend
- Node.js
- Express 5
- TypeScript
- MongoDB avec Mongoose

## 🚀 Installation

1. **Cloner le repository**
   ```bash
   git clone [URL_DU_REPO]
   ```

2. **Installer les dépendances**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Configurer l'environnement**
   - Créer un fichier `.env` dans le dossier backend
   - Configurer les variables d'environnement nécessaires

4. **Démarrer l'application**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm run dev
   ```

## 📝 Licence

Ce projet fait partie de la plateforme GraphLab propulsé par Terra Numerica. 