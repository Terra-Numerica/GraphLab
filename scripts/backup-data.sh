#!/bin/bash
set -euo pipefail

# =-=-=-= CONFIG =-=-=-=
APP_ID="${APP_ID:-graphlab}"
CONTAINER_NAME="${CONTAINER_NAME:-${APP_ID}-app}"
DATA_DIR="${DATA_DIR:-/app/data}"
BACKUP_DIR="${BACKUP_DIR:-./deploy/backups/data}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
CONTAINER_TMP="/tmp/data-backup-$DATE"
HOST_TMP=$(mktemp -d)

trap 'rm -rf "$HOST_TMP"' EXIT

mkdir -p "$BACKUP_DIR"

echo "Archivage des données JSON ($DATA_DIR)..."
docker exec "$CONTAINER_NAME" tar -czf "$CONTAINER_TMP" -C "$DATA_DIR" .

echo "Copie de l'archive depuis le conteneur..."
docker cp "${CONTAINER_NAME}:${CONTAINER_TMP}" "$BACKUP_DIR/data_$DATE.tar.gz"
docker exec "$CONTAINER_NAME" rm -f "$CONTAINER_TMP"

echo "Suppression des sauvegardes de plus de $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -type f -name "data_*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

echo "Sauvegarde terminée : $BACKUP_DIR/data_$DATE.tar.gz"
