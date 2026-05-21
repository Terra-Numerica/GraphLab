SHELL = /bin/bash

.ONESHELL:

-include .secrets.mk
include deploy/.env

APP_ID ?= graphlab
IMAGE_REGISTRY ?= registry.gitlab.com/terra-numerica
IMAGE_NAME ?= graphlab
IMAGE_VERSION ?= latest
IMAGE_REF = $(IMAGE_REGISTRY)/$(IMAGE_NAME):$(IMAGE_VERSION)
BRANCH_SUFFIX?=$$(echo "-"$$(git branch --show-current) | sed 's/-develop//' | sed 's!/!_!g')
LATEST=latest$(BRANCH_SUFFIX)
VERSION?=$$(git describe --long | tr -d 'v' | cut -d- -f 1-2 | sed 's/-0$$//')$(BRANCH_SUFFIX)

# Chemins sur le serveur
SERVER_BACKEND_PATH  = /srv/$(APP_ID)/

# Docker Compose : base = prod, surcharge dev en local
COMPOSE_DEV = -f docker-compose.yaml -f docker-compose.dev.yaml

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
build:							## Construit l'image Docker (tag: $(IMAGE_REF))
	@echo "--- Construction de l'image Docker $(IMAGE_REF) ---"
	docker build -t $(IMAGE_REF) -t $(IMAGE_REGISTRY)/$(IMAGE_NAME):latest \
		--build-arg BUILD_MODE=production \
		-f app/backend/docker/Dockerfile .

.PHONY: image
image: build

.PHONY: publish
publish: build					## Publication de l'image Docker sur le repo GitLab
	@echo "--- Publication sur GitLab ($(IMAGE_REF)) ---"
	docker push $(IMAGE_REF)
	docker push $(IMAGE_REGISTRY)/$(IMAGE_NAME):latest

.PHONY: push
push: publish

.PHONY: deploy
deploy: check-env publish			## Déploiement sur le serveur (compose + .env, image publiée)
	@echo "# Copie des fichiers de configuration du stack"
	rsync -avz ./deploy/docker-compose.yaml ./deploy/.env ./deploy/graphs.json ./scripts/ $(SSH_USER)@$(SSH_HOST):$(SERVER_BACKEND_PATH)
	

.PHONY: update-service
update-service: check-env		## Mise à jour du service backend sur le serveur
	@echo "--- Mise à jour du service ---"
	ssh $(SSH_USER)@$(SSH_HOST) "cd $(SERVER_BACKEND_PATH) && docker compose -p $(APP_ID) pull app && docker compose -p $(APP_ID) up -d"

.PHONY: release
release: deploy update-service	## Publie, déploie et met à jour le service (commande globale)
	@echo "--- Mise en production terminée avec succès ! ---"

.PHONY: app-up
app-up:					## Démarre l'application en local (docker-compose + MongoDB)
	@echo "--- Démarrage du docker-compose en local ---"
	cd deploy && docker compose $(COMPOSE_DEV) -p $(APP_ID) up -d --build

.PHONY: app-down
app-down:				## Arrête l'application en local (docker-compose)
	@echo "--- Arrêt du docker-compose local ---"
	cd deploy && docker compose $(COMPOSE_DEV) -p $(APP_ID) down

.PHONY: app-logs
app-logs:				## Affiche les logs de l'application en local (docker-compose)
	@echo "--- Affichage des logs du backend ---"
	cd deploy && docker compose $(COMPOSE_DEV) -p $(APP_ID) logs -f app

.PHONY: app-ps 
app-ps:					## Affiche les conteneurs de l'application en local (docker-compose)	
	@echo "--- Conteneurs du backend ---"
	cd deploy && docker compose $(COMPOSE_DEV) -p $(APP_ID) ps

.PHONY: backup-mongo
backup-mongo:				## Sauvegarde MongoDB (script scripts/backup-mongo.sh)
	APP_ID=$(APP_ID) BACKUP_DIR=./deploy/backups/mongodb bash ./scripts/backup-mongo.sh

.PHONY: restore-mongo
restore-mongo:				## Restaure la dernière sauvegarde MongoDB
	APP_ID=$(APP_ID) BACKUP_DIR=./deploy/backups/mongodb bash ./scripts/restore-mongo.sh
