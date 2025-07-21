# GraphLab Backend

Backend de l'application GraphLab, une plateforme éducative pour l'apprentissage des graphes.

## 🚀 Technologies Utilisées

- **Node.js** avec **Express.js** - Framework web
- **TypeScript** - Langage de programmation
- **MongoDB** avec **Mongoose** - Base de données
- **JWT** - Authentification
- **Bcrypt** - Hachage des mots de passe
- **Zod** - Validation des données
- **CORS** - Sécurité des requêtes cross-origin

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── base/           # Classes de base (Database, Logger)
│   ├── controllers/    # Logique métier
│   ├── models/         # Modèles de données Mongoose
│   ├── routes/         # Routes de l'API
│   ├── utils/          # Utilitaires et fonctions
│   └── server.ts       # Point d'entrée de l'application
├── types/              # Types TypeScript
└── tsconfig.json       # Configuration TypeScript
```

## 🛠️ Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` à la racine du dossier backend avec les variables suivantes :
```env
PORT=3000
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
NODE_ENV=development
```

## 📦 Scripts Disponibles

- `npm run dev` - Lance le serveur en mode développement avec hot-reload
- `npm run build` - Compile le TypeScript et prépare pour la production
- `npm start` - Lance le serveur en mode production
- `npm run update` - Met à jour les dépendances

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - Connexion administrateur
- `POST /api/auth/verify` - Vérification du token JWT

### Graphes
- `GET /api/graph` - Récupère tous les graphes
- `POST /api/graph` - Crée un nouveau graphe
- `PUT /api/graph/:id` - Met à jour un graphe
- `DELETE /api/graph/:id` - Supprime un graphe

## 🔒 Sécurité

- Authentification via JWT
- Hachage des mots de passe avec Bcrypt
- Protection CORS configurée
- Validation des données avec Zod

## 🔄 Fonctionnalités Automatiques

En production :
- Système de keep-alive pour maintenir le service actif
- Gestion automatique des horaires de service (8h-17h en semaine & 13h-19h le samedi) 
- Monitoring et logs automatiques

## 📝 Notes de Développement

- Le serveur utilise TypeScript pour un typage fort
- Architecture MVC (Model-View-Controller)
- Gestion des erreurs centralisée
- Logging système intégré