SHELL = /bin/bash

.ONESHELL:

-include .secrets.mk

APP_ID=graphlab
IMAGE_NAME=registry.gitlab.com/terra-numerica/$(APP_ID)
BRANCH_SUFFIX?=$$(echo "-"$$(git branch --show-current) | sed 's/-develop//' | sed 's!/!_!g')
LATEST=latest$(BRANCH_SUFFIX)
VERSION?=$$(git describe --long | tr -d 'v' | cut -d- -f 1-2 | sed 's/-0$$//')$(BRANCH_SUFFIX)

# Chemins sur le serveur
SERVER_BACKEND_PATH  = /srv/$(APP_ID)/

# Variables SSH (Doivent être fournies par l'utilisateur)
SSH_USER ?=
SSH_HOST ?=


CSI_HIGH = \033[1;37m
CSI_RESET = \033[0m	
CSI_PROMPT = \033[36m

# --- Commandes ---

# Commande par défaut : Aide
.PHONY: help
help: 				
	@echo -e "\n$(CSI_HIGH)--- Application GraphLab (v$(VERSION)) ---$(CSI_RESET)\n"
	echo -e "Targets disponibles:\n"
	egrep -h '\s##\s' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CSI_PROMPT) %-20s$(CSI_RESET) %s\n", $$1, $$2}' \
		| sort
	echo ""

# Validation des variables d'environnement obligatoires
define env_usage
	$(error Erreur : $(1) n'est pas défini. Utilisez 'make [commande] SSH_USER=votre_user SSH_HOST=votre_serveur', ou bien créez un fichier .secrets.mk avec ces variables.)
endef

.PHONY: check-env
check-env:						## Vérifie la présence des variables d'environnement obligatoires
ifndef SSH_USER
	@$(call env_usage,SSH_USER)
endif
ifndef SSH_HOST
	@$(call env_usage,SSH_HOST)
endif
	@echo "Variables d'environnement OK."


.PHONY: install
install:						## Installation des dépendances de dev
	@echo "--- Installation des dépendances ---"
	(cd frontend && npm install)
	(cd backend && npm install)

.PHONY: build
build:							## Construit l'image Docker (tag: $(VERSION))
	@echo "--- Construction de l'image Docker v$(VERSION) ---"
	docker build -t $(IMAGE_NAME):${VERSION} -t $(IMAGE_NAME):latest --build-arg VITE_API_URL=$${VITE_API_URL:-http://localhost:3000/api} -f app/backend/docker/Dockerfile .

.PHONY: image
image: build

.PHONY: publish
publish: build					## Publication de l'image Docker sur le repo GitLab
	@echo "--- Publication sur GitLab ---"
	docker push $(IMAGE_NAME):$(VERSION)
	docker push $(IMAGE_NAME):latest

.PHONY: push
push: publish

.PHONY: deploy
deploy: check-env build			## Déploiement sur le serveur 
	@echo "# Copie des fichiers de configuration du stack"
	rsync -avz ./deploy/docker-compose.yaml ./deploy/docker-compose.prod.yaml ./deploy/.env ./deploy/graphs.json ./scripts/ $(SSH_USER)@$(SSH_HOST):$(SERVER_BACKEND_PATH)
	

.PHONY: update-service
update-service: check-env		## Mise à jour du service backend sur le serveur
	@echo "--- Mise à jour du service ---"
	ssh $(SSH_USER)@$(SSH_HOST) "cd $(SERVER_BACKEND_PATH) && docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d --build"

.PHONY: release
release: build deploy update	## Construit, déploie et met à jour le service (commande globale)
	@echo "--- Mise en production terminée avec succès ! ---"

.PHONY: app-up
app-up:					## Démarre l'application en local (docker-compose + MongoDB)
	@echo "--- Démarrage du docker-compose en local ---"
	cd deploy && docker compose -p graphlab up -d --build

.PHONY: app-down
app-down:				## Arrête l'application en local (docker-compose)
	@echo "--- Arrêt du docker-compose local ---"
	cd deploy && docker compose -p graphlab down

.PHONY: app-logs
app-logs:				## Affiche les logs de l'application en local (docker-compose)
	@echo "--- Affichage des logs du backend ---"
	cd deploy && docker compose -p graphlab logs -f graphlab

.PHONY: app-ps 
app-ps:					## Affiche les conteneurs de l'application en local (docker-compose)	
	@echo "--- Conteneurs du backend ---"
	cd deploy && docker compose -p graphlab ps

.PHONY: backup-mongo
backup-mongo:				## Sauvegarde MongoDB (script scripts/backup-mongo.sh)
	BACKUP_DIR=./deploy/backups/mongodb bash ./scripts/backup-mongo.sh

.PHONY: restore-mongo
restore-mongo:				## Restaure la dernière sauvegarde MongoDB
	BACKUP_DIR=./deploy/backups/mongodb bash ./scripts/restore-mongo.sh

