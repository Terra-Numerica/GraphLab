# GraphLab Backend

Backend de l'application GraphLab, une plateforme éducative pour l'apprentissage des graphes.

## 🚀 Fonctionnalités

- **API RESTful**
  - Gestion des graphes (création, lecture, mise à jour, suppression)
  - Stockage persistant avec MongoDB
  - Validation des données avec Zod
  - Sécurisation avec JWT et bcrypt

- **Architecture**
  - Structure modulaire (controllers, routes, models)
  - TypeScript pour un typage fort
  - Middleware de validation et d'authentification
  - Gestion des erreurs centralisée

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript
- **Base de données**: MongoDB avec Mongoose
- **Sécurité**: JWT, bcrypt
- **Validation**: Zod
- **Développement**: tsx, tsc-alias

## 🏗️ Structure du Projet

```
backend/
├── src/
│   ├── base/         # Classes et interfaces de base
│   ├── controllers/  # Logique métier
│   ├── models/       # Modèles de données
│   ├── routes/       # Définition des routes
│   ├── utils/        # Fonctions utilitaires
│   └── server.ts     # Point d'entrée
├── types/           # Types TypeScript
└── package.json     # Dépendances
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

4. **Production**
   ```bash
   npm start
   ```

## 🧪 Scripts Disponibles

- `npm run dev` - Démarre le serveur en mode développement
- `npm run build` - Compile le TypeScript
- `npm start` - Démarre le serveur en production
- `npm run update` - Met à jour les dépendances

## 📝 Licence

Ce projet fait partie de la plateforme GraphLab propulsé par Terra Numerica. 