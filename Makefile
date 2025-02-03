_docs:
	cd docs-sources && pip install -r requirements.txt

storybook/build:
	npm run storybook:build -w packages/ui

docs/build: _docs
	cd docs-sources && mkdocs build -d ../docs
	GIT_SHA=dontcare $(MAKE) storybook/build

docs/serve: _docs
	cd docs-sources && mkdocs serve -a localhost:8080

docs/generate-schema:
	# Planter vient de https://github.com/achiku/planter
	docker run --net=camino_default --rm agileek/planter planter postgres://postgres:password@camino_api_db/camino?sslmode=disable > docs-sources/assets/database/camino-db.uml
	cat docs-sources/assets/database/camino-db.uml | docker run --rm -i agileek/plantuml:1.2022.3 > docs-sources/docs/img/camino-db.svg
	cat docs-sources/assets/keycloak_impersonate.uml | docker run --rm -i agileek/plantuml:1.2022.3 > docs-sources/docs/img/keycloak_impersonate.svg
	cat docs-sources/assets/architecture.puml | docker run --rm -i agileek/plantuml:1.2022.3 > docs-sources/docs/img/architecture.svg

daily:
ifdef CAMINO_STAGE
	npm run daily -w packages/api
else
	@echo 'lancement du daily en mode local avec la migration'
	npm run db:migrate -w packages/api
	npm run daily -w packages/api
endif

daily/debug:
	npm run daily-debug -w packages/api

monthly:
	npm run monthly -w packages/api


db/migrate:
	npm run db:migrate -w packages/api

db/check-queries:
ifndef CI
	npm run db:watch -w packages/api
else
	npm run db:check -w packages/api
endif

test: test/ui test/api test/common
test/api: test/api-unit test/api-integration
test/ui:
ifndef CI
	npm run test -w packages/ui
else
	npm run test -w packages/ui -- --coverage
endif

storybook/test:
ifndef CI
	npm run storybook:test -w packages/ui
else
# TODO 2024-07-04 on peut surement mieux faire, avec un sidecar
	npx concurrently -k -s first -n "SB,TEST" -c "magenta,blue" "npx http-server packages/ui/storybook-static --port 6006 --silent"  "npx wait-on tcp:6006 && npm run storybook:test -w packages/ui"
endif

test/common:
	npm run test -w packages/common

test/api-unit:
ifndef CI
	npm run test:unit -w packages/api
else
	npm run test:unit -w packages/api -- --coverage
endif

test/api-integration:
ifndef CI
	npm run test:integration -w packages/api
else
	npm run test:integration -w packages/api -- --coverage
endif

lint/ui:
ifndef CI
	npm run lint --workspace=packages/ui
else
	npm run lint:check --workspace=packages/ui
endif


lint/api:
ifndef CI
	npm run lint --workspace=packages/api
else
	npm run ci:lint --workspace=packages/api
endif

lint/detect-dead-code:
	npm run knip

lint/common:
ifndef CI
	npm run format --workspace=packages/common
else
	npm run lint --workspace=packages/common
endif


lint: lint/ui lint/api lint/common

install:
ifdef CI
	HUSKY=0 npm ci --ignore-scripts
else
	npm ci
endif


install/prod:
ifdef CI
	HUSKY=0 npm ci --omit=dev --ignore-scripts
else
	npm ci --omit=dev
endif


build: build/common build/api build/ui

build/common:
	npm run build -w packages/common
build/ui:
	npm run build -w packages/ui

build/api:
ifdef CI
	# https://github.com/microsoft/TypeScript/issues/53087
	NODE_OPTIONS=--max-old-space-size=4096 npm run build -w packages/api
endif
	npm run build -w packages/api

start/api:
ifdef CAMINO_STAGE
	@echo 'lancement du backend en mode prod'
	npm start -w packages/api
else
	@echo 'lancement du backend en mode dev(local)'
	npm run dev -w packages/api
endif


start/ui:
ifdef CAMINO_STAGE
	@echo 'lancement du frontend en mode prod'
	npm start -w packages/ui
else
	@echo 'lancement du frontend en mode dev(local)'
	npm run dev -w packages/ui
endif


ifeq (${INPUT_ENV}, dev)
CD_TOKEN:=${CD_TOKEN_DEV}
endif
ifeq (${INPUT_ENV}, preprod)
CD_TOKEN:=${CD_TOKEN_PREPROD}
endif
ifeq (${INPUT_ENV}, prod)
CD_TOKEN:=${CD_TOKEN_PROD}
endif

deploy/ci:
	@echo "Déploiement de la version ${INPUT_SHA} en ${INPUT_ENV}"
	@GIT_SHA=${INPUT_SHA} CD_TOKEN=${CD_TOKEN} $(MAKE) deploy/${INPUT_ENV}

_deploy:
ifndef DEPLOY_URL
	@echo 'DEPLOY_URL est obligatoire'
	@exit 1
endif
ifndef CD_TOKEN
	@echo 'CD_TOKEN est obligatoire'
	@exit 1
endif
ifndef GIT_SHA
	@echo 'GIT_SHA est obligatoire'
	@exit 1
endif
	@echo 'on déploie sur ${DEPLOY_URL} la version ${GIT_SHA}'
	@curl --insecure --fail-with-body -I https://cd.${DEPLOY_URL}/update/${GIT_SHA} -H 'authorization: ${CD_TOKEN}'

deploy/preprod:
	$(MAKE) DEPLOY_URL=preprod.camino.beta.gouv.fr _deploy

deploy/prod:
	$(MAKE) DEPLOY_URL=camino.beta.gouv.fr _deploy

matrices:
	npm run matrices -w packages/api

graphql/check:
	npm i --global --force @graphql-inspector/ci@3.4.0 @graphql-inspector/validate-command@3.4.0 @graphql-inspector/graphql-loader@3.4.0 @graphql-inspector/code-loader@3.4.0 graphql
	graphql-inspector validate --noStrictFragments packages/ui/src/api packages/api/src/api/graphql/schemas/index.graphql
	for f in $(shell find ./packages/ui/src -name '*-api-client.ts'); do \
	    if grep -q gql "$$f"; then \
	        echo $$f; \
            graphql-inspector validate --onlyErrors --noStrictFragments "$$f" packages/api/src/api/graphql/schemas/index.graphql || exit 1; \
        fi \
    done
	for f in packages/api/tests/queries/*.graphql; do \
		echo $$f; \
		graphql-inspector validate --noStrictFragments "$$f" packages/api/src/api/graphql/schemas/index.graphql || exit 1; \
	done


dev/chiffre:
	$(MAKE) INPUT_ENV=dev _chiffre

dev/dechiffre:
	$(MAKE) INPUT_ENV=dev _dechiffre


preprod/chiffre:
	$(MAKE) INPUT_ENV=preprod _chiffre

preprod/dechiffre:
	$(MAKE) INPUT_ENV=preprod _dechiffre

prod/chiffre:
	$(MAKE) INPUT_ENV=prod _chiffre

prod/dechiffre:
	$(MAKE) INPUT_ENV=prod _dechiffre
_chiffre:
ifndef INPUT_ENV
	@echo 'INPUT_ENV est obligatoire'
	@exit 1
endif
	@echo 'on chiffre ${INPUT_ENV}'
	SOPS_AGE_RECIPIENTS=$$(cat team.age.pub ecocompose.age.pub | sed -z 's/\n/,/g;s/,$$/\n/') sops --encrypt --input-type dotenv --output-type dotenv .${INPUT_ENV}.no-commit.env > .${INPUT_ENV}.env

_dechiffre:
ifndef INPUT_ENV
	@echo 'INPUT_ENV est obligatoire'
	@exit 1
endif
	SOPS_AGE_KEY_FILE=team.age sops -d --input-type dotenv --output-type dotenv .${INPUT_ENV}.env > .${INPUT_ENV}.no-commit.env

# TODO 2024-10-21 une fois tout migré sur ecoCompose, il faudra supprimer tout ce qu'il y a dans infra sauf le dossier ecocompose
keycloak/build:
	docker build -t caminofr/camino-keycloak:26.1.0 -f Dockerfile.keycloak infra/ecocompose/keycloak/

keycloak/push:
	docker push caminofr/camino-keycloak:26.1.0

nginx-proxy/build:
	docker build -t caminofr/camino-nginx-proxy:1.6.1 -f Dockerfile.nginx-proxy infra/ecocompose/nginx-proxy/

nginx-proxy/push:
	docker push caminofr/camino-nginx-proxy:1.6.1
