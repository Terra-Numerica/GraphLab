# GraphLab

Donc : mongoimport --db graphlab --collection graphs --file graphs.json --jsonArray

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
- Visualisation des algorithmes de Prim, Kruskal, Boruvka et Propriété d'échange
- Comparaison avec les solutions optimales
- Exercices pratiques avec différents types de poids

## 🏗️ Architecture

Le projet est divisé en deux parties principales :

### Frontend
- Application React
- Interface utilisateur interactive
- Visualisation des graphes avec Cytoscape.js
- Design responsive et intuitif

### Backend
- API REST avec Express
- Base de données MongoDB
- Sécurisation avec JWT
- Validation des données avec Zod

## Déploiement

### Prérequis en production (Terra Numerica) :
- accès SSH au serveur, réseau Docker `traefik` existant, clé SSH pour les sauvegardes distantes
- `deploy/docker-compose.yaml` — stack par défaut (production, Traefik, pas de ports exposés)

### Déploiement local

La config de base est orientée production ; le développement local ajoute une surcharge :

- `deploy/docker-compose.dev.yaml` — ports locaux, API `localhost`, Traefik désactivé

```bash
cp deploy/.env.example deploy/.env
# Ajuster VITE_API_URL si besoin (défaut en dev : http://localhost:3000/api)

make app-up      # build + démarrage
make app-ps      # état des conteneurs
make app-logs    # logs de l’application
make app-down    # arrêt
```

L’application est accessible sur [http://localhost:3000](http://localhost:3000) (port modifiable via `PORT` dans `deploy/.env`).

Équivalent manuel depuis `deploy/` :

```bash
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d --build
```

Sur le serveur, sans surcharge :

```bash
docker compose up -d --build
```

### Initialisation MongoDB

Au premier lancement, une fois MongoDB démarré (`make app-up`), importer les graphes par défaut depuis la machine hôte :

```bash
bash scripts/init-mongo.sh
```

Le script copie `deploy/graphs.json` dans `/tmp` du conteneur `${APP_ID}-db` puis lance `mongoimport` (`docker cp` + `docker exec`).

### Sauvegardes MongoDB

Le script `scripts/backup-mongo.sh` :

- effectue un `mongodump` du conteneur `${APP_ID}-db` (défaut : `graphlab-db`) ;
- compresse le dump en `mongodb_YYYY-MM-DD_HH-MM-SS.tar.gz` ;
- supprime les archives plus anciennes que `RETENTION_DAYS`.

```bash
make backup-mongo
make restore-mongo   # restaure la dernière archive
```

### Cron des sauvegardes (production)

Planifier une sauvegarde quotidienne sur le serveur (par exemple : 2h du matin) en ajoutant un cron :

```cron
0 2 * * * APP_ID=graphlab BACKUP_DIR=/srv/graphlab/backups/mongodb RETENTION_DAYS=30 /bin/bash /srv/graphlab/backup-mongo.sh >> /var/log/graphlab-mongo-backup.log 2>&1
```

## 📝 Licence

Ce projet fait partie de la plateforme GraphLab propulsé par Terra Numerica. 