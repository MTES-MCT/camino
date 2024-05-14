_docs:
	cd docs-sources && pip install -r requirements.txt

docs/build: _docs
	cd docs-sources && mkdocs build -d ../docs
	GIT_SHA=dontcare npm run storybook:build -w packages/ui

docs/serve: _docs
	cd docs-sources && mkdocs serve -a localhost:8080

docs/generate-schema:
	planter postgres://postgres:password@localhost/camino?sslmode=disable -o docs-sources/assets/database/camino-db.uml
	cat docs-sources/assets/database/camino-db.uml | docker run --rm -i agileek/plantuml:1.2022.3 > docs-sources/docs/img/camino-db.svg
	cat docs-sources/assets/keycloak_impersonate.uml | docker run --rm -i agileek/plantuml:1.2022.3 > docs-sources/docs/img/keycloak_impersonate.svg
	cat docs-sources/assets/architecture.puml | docker run --rm -i agileek/plantuml:1.2022.3 > docs-sources/docs/img/architecture.svg

daily:
	npm run daily -w packages/api
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

test/common:
ifndef CI
	npm run test -w packages/common
else
	npm run test -w packages/common -- --coverage
endif

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
# On a enlevé --ignore-scripts car pg-formatter fait un truc très étrange en postinstall, il curl une version de pg-format en perl et le met à côté de lui pour s'en servir
	HUSKY=0 npm ci
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
	@curl --fail-with-body http://${DEPLOY_URL}:3030/update/${GIT_SHA} -H 'authorization: ${CD_TOKEN}'

deploy/dev:
	$(MAKE) DEPLOY_URL=dev.camino.beta.gouv.fr _deploy

deploy/preprod:
	$(MAKE) DEPLOY_URL=preprod.camino.beta.gouv.fr _deploy

deploy/prod:
	$(MAKE) DEPLOY_URL=camino.beta.gouv.fr _deploy

dsfr/generate_keycloak:
	wget https://github.com/GouvernementFR/dsfr/releases/download/v1.10.2/dsfr-v1.10.2.zip
	unzip dsfr-v1.10.2.zip -d dsfr
	rm -rf infra/roles/camino/files/keycloak_theme/login/resources/css/
	mkdir -p infra/roles/camino/files/keycloak_theme/login/resources/css/utility
	mv dsfr/dist/dsfr.min.css infra/roles/camino/files/keycloak_theme/login/resources/css/dsfr.min.css
	mv dsfr/dist/utility/utility.min.css infra/roles/camino/files/keycloak_theme/login/resources/css/utility/utility.min.css
	mv dsfr/dist/icons infra/roles/camino/files/keycloak_theme/login/resources/css/
	mv dsfr/dist/fonts infra/roles/camino/files/keycloak_theme/login/resources/css/
	rm -rf dsfr
	rm dsfr-v1.10.2.zip
dsfr/generate:
	mkdir tmp
	cp node_modules/@gouvfr/dsfr/dist/dsfr.css tmp/_dsfr.scss
	cp node_modules/@gouvfr/dsfr/dist/utility/utility.css tmp/_utility.scss
	sed -i 's/..\/icons/.\/icons/g' tmp/_utility.scss
	sed -n "/\@font-face {/,/}/p" tmp/_dsfr.scss > tmp/font-face.scss
	sed -i "/\@font-face {/,/}/d" tmp/_dsfr.scss
	echo "@import './font-face.scss'; @import './_dsfr.scss'; @import './_utility.scss'" > tmp/dsfr.scss
	npx sass --no-source-map tmp/dsfr.scss packages/ui/src/styles/dsfr/dsfr.css
	rm -r tmp
	cp -r node_modules/@gouvfr/dsfr/dist/icons packages/ui/src/styles/dsfr/
	cp -r node_modules/@gouvfr/dsfr/dist/fonts packages/ui/src/styles/dsfr/
	$(MAKE) icons/generate
	$(MAKE) dsfr/generate_keycloak

icons/generate:
	npm run generate-icon-types -w packages/ui

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
