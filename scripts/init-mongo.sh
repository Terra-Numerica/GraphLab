#!/bin/bash
set -euo pipefail

# Initialise MongoDB au démarrage :
# - si la base contient déjà des graphes → ne rien faire
# - sinon, restaure la dernière sauvegarde disponible
# - sinon, importe deploy/graphs.json

MONGO_HOST="${MONGO_HOST:-mongo}"
DB_NAME="${DB_NAME:-graphlab}"
BACKUP_DIR="${BACKUP_DIR:-/backups/mongodb}"
GRAPHS_JSON="${GRAPHS_JSON:-/data/graphs.json}"
FORCE_INIT="${FORCE_INIT:-0}"

MONGO_URI="mongodb://${MONGO_HOST}:27017/${DB_NAME}"

log() { echo "[init-mongo] $*"; }

wait_for_mongo() {
	local attempt=0
	until mongosh "$MONGO_URI" --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q "1"; do
		attempt=$((attempt + 1))
		if [ "$attempt" -ge 30 ]; then
			log "MongoDB indisponible après 30 tentatives"
			exit 1
		fi
		sleep 2
	done
}

has_graph_data() {
	local count
	count=$(mongosh "$MONGO_URI" --quiet --eval "db.graphs.countDocuments()")
	[ "${count:-0}" -gt 0 ]
}

find_latest_backup() {
	if [ ! -d "$BACKUP_DIR" ]; then
		return 1
	fi
	ls -t "${BACKUP_DIR}"/mongodb_*.tar.gz 2>/dev/null | head -n 1 || true
}

restore_from_backup() {
	local archive="$1"
	local tmp_dir
	tmp_dir=$(mktemp -d)

	log "Restauration depuis $(basename "$archive")..."
	tar -xzf "$archive" -C "$tmp_dir"

	local dump_path=""
	if [ -d "$tmp_dir/$DB_NAME" ]; then
		dump_path="$tmp_dir/$DB_NAME"
	elif [ -d "$tmp_dir/graphlab" ]; then
		dump_path="$tmp_dir/graphlab"
	else
		local bson_file
		bson_file=$(find "$tmp_dir" -type f -name "*.bson" 2>/dev/null | head -n 1 || true)
		[ -n "$bson_file" ] && dump_path=$(dirname "$bson_file")
	fi

	if [ -z "$dump_path" ] || [ ! -d "$dump_path" ]; then
		rm -rf "$tmp_dir"
		log "Archive invalide : aucun dump MongoDB trouvé"
		return 1
	fi

	mongorestore --uri="mongodb://${MONGO_HOST}:27017" --db="$DB_NAME" --drop "$dump_path"
	rm -rf "$tmp_dir"
	log "Restauration terminée"
}

import_default_graphs() {
	if [ ! -f "$GRAPHS_JSON" ]; then
		log "Fichier par défaut introuvable : $GRAPHS_JSON"
		return 1
	fi

	log "Import des graphes par défaut depuis $(basename "$GRAPHS_JSON")..."
	mongoimport \
		--uri="$MONGO_URI" \
		--collection=graphs \
		--jsonArray \
		--file="$GRAPHS_JSON"
	log "Import des graphes par défaut terminé"
}

main() {
	log "Démarrage de l'initialisation MongoDB"
	wait_for_mongo

	if [ "$FORCE_INIT" != "1" ] && has_graph_data; then
		log "Des graphes existent déjà, initialisation ignorée"
		exit 0
	fi

	if [ "$FORCE_INIT" = "1" ]; then
		log "FORCE_INIT=1 : réinitialisation demandée"
	fi

	local latest_backup
	latest_backup=$(find_latest_backup)

	if [ -n "$latest_backup" ]; then
		restore_from_backup "$latest_backup"
		exit 0
	fi

	log "Aucune sauvegarde trouvée dans $BACKUP_DIR"
	import_default_graphs
}

main "$@"
