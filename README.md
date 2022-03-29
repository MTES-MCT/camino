# Camino

[![ui/ci](https://github.com/MTES-MCT/camino/actions/workflows/ui-ci.yml/badge.svg)](https://github.com/MTES-MCT/camino/actions/workflows/ui-ci.yml) [![api/ci](https://github.com/MTES-MCT/camino/actions/workflows/api-ci.yml/badge.svg)](https://github.com/MTES-MCT/camino/actions/workflows/api-ci.yml) [![codecov][codecov-img]][codecov]

[codecov-img]: https://codecov.io/gh/MTES-MCT/camino/branch/master/graph/badge.svg
[codecov]: https://codecov.io/gh/MTES-MCT/camino


> Interface web de [Camino](https://camino.beta.gouv.fr), le cadastre minier numérique.

![camino screenshot](packages/ui/camino-screenshot.png)

---

## Composants

* [Interface](packages/ui/README.md)
* [API](packages/api/README.md)

---

## Configuration

- Cloner ce repo : `git clone https://github.com/MTES-MCT/camino.git`.
- Renommer le fichier `.env-example` en `.env` et le compléter.

### Installation

```bash
# installe les dépendances
npm ci
```

### Développement

```bash
# lance un serveur de développement de l'api
# accessible à localhost:4000
npm run dev -w packages/api
```

```bash
# lance un serveur de développement de l'interface 
# accessible à localhost:3000
npm run dev -w packages/ui
```

### Production

```bash
# crée les fichiers de production dans le répertoire dist
npm run build -w packages/ui
npm run build -w packages/api

# lance le serveur de production
npm run start -w packages/ui
npm run start -w packages/api
```

### Tests unitaires

```bash
# lance les tests unitaires en local
npm run test
```

---

## Contribution

Voir `contributing.md` (en anglais) pour plus d'infos.

---

## Credits

### Production

- [La Fabrique Numérique, Ministère de la transition écologique](https://www.ecologique.gouv.fr/inauguration-fabrique-numerique-lincubateur-des-ministeres-charges-lecologie-et-des-territoires)

---

## Licence

Camino API, le cadastre minier numérique ouvert

[AGPL 3 ou plus récent](https://spdx.org/licenses/AGPL-3.0-or-later.html)


TODO: 
* push doc image on develop
* push docker images with git sha

MIGRATION:

* create /srv/www/camino
* récupérer le docker-compose.yml
* merge .env 
  * on prend api/.env, on préfixe API_ sur URL et PORT (On rajoute https à API_URL)
  * on prend ui/.env, il y'a UI_URL, API_MATOMO_MONTHS et API_SENTRY_URL
  * on rajoute DOC_URL, DOC_PORT
* récupérer les données
  * on arrête les serveurs `docker stop camino_api_cron camino_api_app camino_ui_app camino_api_db`
  * la bdd
    * on crée le dossier postgresql `sudo mkdir /srv/www/camino/postgresql && sudo chown 999:999 /srv/www/camino/postgresql`
    * `docker run -ti --rm --entrypoint "" -u postgres -v camino-api_data:/data -v /srv/www/camino/postgresql:/new_data postgis/postgis:12-3.2 bash -c "cp -Rv /data/* /new_data"` 
  * les fichiers
    * `docker run -ti --rm --entrypoint "" -u root -v camino-api_files:/files -v /srv/www/camino/files:/new_files postgis/postgis:12-3.2 bash -c "cp -Rv /files/* /new_files"`
* `docker rm camino_api_cron camino_api_app camino_ui_app camino_api_db` 
* `CAMINO_TAG=develop docker-compose up -d`
* `docker restart nginx-gen nginx-proxy nginx-letsencrypt`


CLEANUP AFTER MIGRATION:
* migrate backup scripts
  * files-backup: `docker cp camino_api_app:/packages/api/files/. /srv/backups/files/`
  * files-restore: `docker cp /srv/backups/files/. camino_api_app:/packages/api/files/ `
  * `sudo rm -f project-create project-delete confirm`
* `docker volume rm camino-api_data camino-api_files`
* `sudo rm -rf /srv/www/camino-api /srv/www/camino-ui /srv/www/camino-api-docs /srv/www/camino-portainer`