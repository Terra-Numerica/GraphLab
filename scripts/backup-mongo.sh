#!/bin/bash
set -euo pipefail

# =-=-=-= CONFIG =-=-=-=
APP_ID="${APP_ID:-graphlab}"
CONTAINER_NAME="${CONTAINER_NAME:-${APP_ID}-db}"
DB_NAME="${DB_NAME:-${APP_ID}}"
BACKUP_DIR="${BACKUP_DIR:-/srv/${APP_ID}/backups/mongodb}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
CONTAINER_TMP="/tmp/mongo-backup-$DATE"
HOST_TMP=$(mktemp -d)

trap 'rm -rf "$HOST_TMP"' EXIT

mkdir -p "$BACKUP_DIR"

echo "Dump MongoDB ($DB_NAME)..."
docker exec "$CONTAINER_NAME" mongodump --db "$DB_NAME" --out "$CONTAINER_TMP"

echo "Copie du dump depuis le conteneur..."
docker cp "${CONTAINER_NAME}:${CONTAINER_TMP}" "$HOST_TMP/dump"
docker exec "$CONTAINER_NAME" rm -rf "$CONTAINER_TMP"

echo "Compression..."
tar -czf "$BACKUP_DIR/mongodb_$DATE.tar.gz" -C "$HOST_TMP/dump" .

echo "Suppression des sauvegardes de plus de $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -type f -name "mongodb_*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

echo "Sauvegarde terminée : $BACKUP_DIR/mongodb_$DATE.tar.gz"
