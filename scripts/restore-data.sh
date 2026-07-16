#!/bin/bash
set -euo pipefail

# =-=-=-= CONFIG =-=-=-=
APP_ID="${APP_ID:-graphlab}"
CONTAINER_NAME="${CONTAINER_NAME:-${APP_ID}-app}"
DATA_DIR="${DATA_DIR:-/app/data}"
BACKUP_DIR="${BACKUP_DIR:-./deploy/backups/data}"
ARCHIVE="${1:-}"

if [ -z "$ARCHIVE" ]; then
	ARCHIVE=$(ls -t "$BACKUP_DIR"/data_*.tar.gz 2>/dev/null | head -1)
fi

if [ -z "$ARCHIVE" ] || [ ! -f "$ARCHIVE" ]; then
	echo "Aucune archive de sauvegarde trouvée dans $BACKUP_DIR"
	exit 1
fi

echo "Restauration depuis $ARCHIVE vers $DATA_DIR..."
docker cp "$ARCHIVE" "${CONTAINER_NAME}:/tmp/restore-data.tar.gz"
docker exec "$CONTAINER_NAME" sh -c "rm -rf ${DATA_DIR}/* && tar -xzf /tmp/restore-data.tar.gz -C ${DATA_DIR} && rm -f /tmp/restore-data.tar.gz"

echo "Restauration terminée."
