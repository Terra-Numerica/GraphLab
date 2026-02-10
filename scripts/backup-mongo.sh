#!/bin/bash

# =-=-=-= CONFIG =-=-=-=
CONTAINER_NAME="graphlab-db"
DB_NAME="graphlab"
BACKUP_DIR="/srv/graphlab/backups/mongodb"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
TMP_DIR="/tmp/mongo-backup-$DATE"
RETENTION_DAYS=30

# =-=-=-= BACKUP =-=-=-=
mkdir -p "$TMP_DIR"

echo "📦 Dump MongoDB..."
docker exec "$CONTAINER_NAME" mongodump --db "$DB_NAME" --out "$TMP_DIR"

echo "🗜 Compression..."
tar -czf "$BACKUP_DIR/mongodb_$DATE.tar.gz" -C "$TMP_DIR" .

echo "🧹 Cleaning temp files..."
rm -rf "$TMP_DIR"

echo "🧽 Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed: mongodb_$DATE.tar.gz"