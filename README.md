# GraphLab

GraphLab est une plateforme éducative interactive pour l'apprentissage des graphes, développée par Terra Numerica.

## Objectif

GraphLab vise à rendre l'apprentissage des graphes plus accessible et interactif grâce à des visualisations dynamiques et des exercices pratiques.

## Fonctionnalités principales

### Coloration de graphes
- Mode défi avec des graphes prédéfinis et des pastilles limitées
- Mode libre avec des graphes prédéfinis et des pastilles illimitées
- Mode création pour concevoir vos propres graphes
- Visualisation interactive et validation en temps réel

### Arbre couvrant
- Mode interactif avec des graphes de différentes tailles
- Visualisation des algorithmes de Prim, Kruskal, Boruvka et propriété d'échange
- Comparaison avec les solutions optimales
- Exercices pratiques avec différents types de poids

## Architecture

Le projet est divisé en deux parties principales :

### Frontend
- Application React (Vite)
- Visualisation des graphes avec Cytoscape.js
- Design responsive

### Backend
- API REST avec Hono (TypeScript)
- Stockage local JSON sur le filesystem (`app/backend/data/`)
- Un fichier JSON par graphe, plus `workshops.json`
- Authentification admin via variables d'environnement (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)
- Sécurisation avec JWT
- Validation des données avec Zod

## Développement local

```bash
npm run dev:install   # installe et démarre backend + frontend
```

Variables backend (`app/backend/.env`) :

```
DATA_DIR=./data
ADMIN_USERNAME=Megitsune
ADMIN_PASSWORD=...
```

## Déploiement

### Prérequis en production (Terra Numerica)
- accès SSH au serveur, réseau Docker `traefik` existant, clé SSH pour les sauvegardes distantes
- `deploy/docker-compose.yaml` — stack par défaut (production, Traefik, pas de ports exposés)

### Déploiement local (Docker)

```bash
cp deploy/.env.example deploy/.env
# Ajuster VITE_API_URL si besoin (défaut en dev : http://localhost:3000/api)

make app-up-dev  # build + démarrage (mode dev, port 3000 exposé)
make app-ps-dev  # état des conteneurs
make app-logs-dev # logs de l'application
make app-down-dev # arrêt

# Mode prod local (image registry, Traefik, sans port exposé) :
make app-up
make app-down
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

Les données sont persistées dans le volume Docker `app-data` (monté sur `/app/data`).

### Migration depuis MongoDB (one-shot)

```bash
MONGODB_URL="mongodb+srv://..." npx tsx scripts/migrate-from-mongo.ts
```

Sans MongoDB, conversion depuis une archive JSON :

```bash
npx tsx scripts/migrate-from-mongo.ts --from-graphs-json chemin/vers/graphs.json
```

### Sauvegardes des données JSON

```bash
make backup-data
make restore-data   # restaure la dernière archive
```

Le script `scripts/backup-data.sh` archive le répertoire `/app/data` du conteneur.

### Cron des sauvegardes (production)

```cron
0 2 * * * APP_ID=graphlab BACKUP_DIR=/srv/graphlab/backups/data RETENTION_DAYS=30 /bin/bash /srv/graphlab/backup-data.sh >> /var/log/graphlab-data-backup.log 2>&1
```

## Licence

Ce projet fait partie de la plateforme GraphLab propulsée par Terra Numerica.
