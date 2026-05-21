#!/bin/bash
set -euo pipefail

APP_ID="${APP_ID:-graphlab}"
CONTAINER_NAME="${CONTAINER_NAME:-${APP_ID}-db}"
DB_NAME="${DB_NAME:-${APP_ID}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GRAPHS_JSON="${GRAPHS_JSON:-${SCRIPT_DIR}/../deploy/graphs.json}"

docker cp "$GRAPHS_JSON" "${CONTAINER_NAME}:/tmp/graphs.json"
docker exec "$CONTAINER_NAME" mongoimport \
	--uri="mongodb://127.0.0.1:27017/${DB_NAME}" \
	--collection=graphs \
	--jsonArray \
	--file="/tmp/graphs.json"
