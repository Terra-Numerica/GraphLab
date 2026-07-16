# GraphLab Backend

## Tech Stack
- Node.js
- Hono
- TypeScript
- Stockage JSON local (filesystem)

## Données

Les données sont stockées dans `data/` :

```
data/
├── graphs/          # un fichier JSON par graphe
└── workshops.json   # configuration globale des ateliers
```

Variable d'environnement : `DATA_DIR` (défaut `./data`).

## Authentification admin

Un seul compte admin, défini dans le `.env` :

```
ADMIN_USERNAME=Megitsune
ADMIN_PASSWORD=...
```
