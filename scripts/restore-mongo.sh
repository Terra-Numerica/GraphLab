#!/bin/bash
set -euo pipefail

# Restaure manuellement une sauvegarde MongoDB (ou la plus récente).
# Usage :
#   ./scripts/restore-mongo.sh
#   ./scripts/restore-mongo.sh /chemin/vers/mongodb_2025-01-01_12-00-00.tar.gz

CONTAINER_NAME="${CONTAINER_NAME:-graphlab-db}"
DB_NAME="${DB_NAME:-graphlab}"
BACKUP_DIR="${BACKUP_DIR:-/srv/graphlab/backups/mongodb}"

ARCHIVE="${1:-}"

if [ -z "$ARCHIVE" ]; then
	ARCHIVE=$(ls -t "${BACKUP_DIR}"/mongodb_*.tar.gz 2>/dev/null | head -n 1 || true)
fi

if [ -z "$ARCHIVE" ] || [ ! -f "$ARCHIVE" ]; then
	echo "Aucune sauvegarde trouvée."
	exit 1
fi

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Restauration de $(basename "$ARCHIVE")..."
tar -xzf "$ARCHIVE" -C "$TMP_DIR"

DUMP_PATH="$TMP_DIR/$DB_NAME"
if [ ! -d "$DUMP_PATH" ]; then
	BSON_FILE=$(find "$TMP_DIR" -type f -name "*.bson" 2>/dev/null | head -n 1 || true)
	[ -n "$BSON_FILE" ] && DUMP_PATH=$(dirname "$BSON_FILE")
fi

if [ -z "$DUMP_PATH" ] || [ ! -d "$DUMP_PATH" ]; then
	echo "Archive invalide."
	exit 1
fi

docker cp "$DUMP_PATH" "${CONTAINER_NAME}:/tmp/mongorestore"
docker exec "$CONTAINER_NAME" mongorestore --db "$DB_NAME" --drop "/tmp/mongorestore"
docker exec "$CONTAINER_NAME" rm -rf /tmp/mongorestore

echo "Restauration terminée."
