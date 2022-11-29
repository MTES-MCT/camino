_docs:
	cd docs-sources && pip install -r requirements.txt

docs/build: _docs
	cd docs-sources && mkdocs build -d ../docs
docs/serve: _docs
	cd docs-sources && mkdocs serve -a localhost:8080

docs/generate-schema:
	planter postgres://postgres:password@localhost/camino?sslmode=disable -o docs-sources/assets/database/camino-db.uml
	cat docs-sources/assets/database/camino-db.uml | docker run --rm -i agileek/plantuml:1.2022.3 > docs-sources/docs/img/camino-db.svg

	cat docs-sources/assets/architecture.puml | docker run --rm -i agileek/plantuml:1.2022.3 > docs-sources/docs/img/architecture.svg

daily:
ifdef CAMINO_STAGE
	@echo 'lancement du daily en mode prod'
	npm run daily -w packages/api
else
	@echo 'lancement du daily en mode dev(local)'
	npm run dev:daily -w packages/api
endif

monthly:
ifdef CAMINO_STAGE
	@echo 'lancement du monthly en mode prod'
	npm run monthly -w packages/api
else
	@echo 'lancement du monthly en mode dev(local)'
	npm run dev:monthly -w packages/api
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

install:
ifdef CI
	npm set-script prepare ""
endif
	npm ci


build: build/common build/api build/ui

build/common:
	npm run build -w packages/common
build/ui:
	npm run build -w packages/ui

build/api:
	npm run build -w packages/api

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
	@curl http://${DEPLOY_URL}:3030/update/${GIT_SHA} -H 'authorization: ${CD_TOKEN}'

deploy/dev:
	$(MAKE) DEPLOY_URL=dev.camino.beta.gouv.fr _deploy

deploy/preprod:
	$(MAKE) DEPLOY_URL=preprod.camino.beta.gouv.fr _deploy

deploy/prod:
	$(MAKE) DEPLOY_URL=camino.beta.gouv.fr _deploy
