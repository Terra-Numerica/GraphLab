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
- `deploy/docker-compose.yaml` — stack de base
- `deploy/docker-compose.prod.yaml` — surcharge Traefik (production)

### Déploiement local

```bash
cp deploy/.env.example deploy/.env
# Ajuster VITE_API_URL si besoin (défaut : http://localhost:3000/api)

make app-up      # build + démarrage
make app-ps      # état des conteneurs
make app-logs    # logs de l’application
make app-down    # arrêt
```

L’application est accessible sur [http://localhost:3000](http://localhost:3000) (port modifiable via `PORT` dans `deploy/.env`).

Pour un démarrage :
```bash
   docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d --build
```

### Initialisation MongoDB

Au démarrage, le conteneur `mongo-init` exécute `scripts/init-mongo.sh` :

1. Si la collection `graphs` contient déjà des données → rien n’est fait (sauf `FORCE_INIT=1`).
2. Sinon, restauration de la dernière archive `mongodb_*.tar.gz` trouvée dans `BACKUP_DIR` (défaut conteneur : `/backups/mongodb`).
3. Sinon, import de `deploy/graphs.json`.

En local, sans serveur de backups distant, laissez `BACKUP_REMOTE_HOST` vide dans `deploy/.env` : l’import depuis `graphs.json` est utilisé au premier lancement.

### Sauvegardes MongoDB

Le script `scripts/backup-mongo.sh` :

- effectue un `mongodump` du conteneur `graphlab-db` ;
- compresse le dump en `mongodb_YYYY-MM-DD_HH-MM-SS.tar.gz` ;
- supprime les archives plus anciennes que `RETENTION_DAYS`.

```bash
make backup-mongo
make restore-mongo   # restaure la dernière archive
```

### Cron des sauvegardes (production)

Planifier une sauvegarde quotidienne sur le serveur (par exemple : 2h du matin) en ajoutant un cron :

```cron
0 2 * * * BACKUP_DIR=/srv/graphlab/backups/mongodb RETENTION_DAYS=30 /bin/bash /srv/graphlab/backup-mongo.sh >> /var/log/graphlab-mongo-backup.log 2>&1
```

## 📝 Licence

Ce projet fait partie de la plateforme GraphLab propulsé par Terra Numerica. 