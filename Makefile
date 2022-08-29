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
