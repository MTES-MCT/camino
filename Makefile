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
	npm run daily -w packages/api

monthly:
	npm run monthly -w packages/api



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



lint/common:
ifndef CI
	npm run format --workspace=packages/common
else
	npm run lint --workspace=packages/common
endif
	

lint: lint/ui lint/api lint/common

install:
ifdef CI
	npm pkg delete scripts
endif
	npm ci


install/prod:
ifdef CI
	npm pkg delete scripts
endif
	npm ci --omit=dev


build: build/common build/api build/ui

build/common:
	npm run build -w packages/common
build/ui:
	npm run build -w packages/ui

build/api:
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
	@curl http://${DEPLOY_URL}:3030/update/${GIT_SHA} -H 'authorization: ${CD_TOKEN}'

deploy/dev:
	$(MAKE) DEPLOY_URL=dev.camino.beta.gouv.fr _deploy

deploy/preprod:
	$(MAKE) DEPLOY_URL=preprod.camino.beta.gouv.fr _deploy

deploy/prod:
	$(MAKE) DEPLOY_URL=camino.beta.gouv.fr _deploy

dsfr/generate:
	mkdir tmp
	npm install @gouvfr/dsfr@1.8.5 --no-save
	cp node_modules/@gouvfr/dsfr/dist/dsfr.css tmp/_dsfr.scss
	cp node_modules/@gouvfr/dsfr/dist/utility/utility.css tmp/_utility.scss
	sed -i 's/..\/icons/.\/icons/g' tmp/_utility.scss
	sed -n "/\@font-face {/,/}/p" tmp/_dsfr.scss > tmp/font-face.scss
	sed -i "/\@font-face {/,/}/d" tmp/_dsfr.scss
	echo "@import './font-face.scss'; .dsfr { @import './_dsfr.scss'; @import './_utility.scss'}" > tmp/dsfr.scss
	npx sass --no-source-map tmp/dsfr.scss packages/ui/src/styles/dsfr/dsfr.css
	rm -r tmp
	sed -i 's/.dsfr :root/:root/g' packages/ui/src/styles/dsfr/dsfr.css
	sed -i 's/.dsfr body/body/g' packages/ui/src/styles/dsfr/dsfr.css
	cp -r node_modules/@gouvfr/dsfr/dist/icons packages/ui/src/styles/dsfr/
	cp -r node_modules/@gouvfr/dsfr/dist/fonts packages/ui/src/styles/dsfr/

matrices:
	npm run matrices -w packages/api