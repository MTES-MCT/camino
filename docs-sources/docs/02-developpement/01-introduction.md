# Développement de l'API de Camino

> [github.com/MTES-MCT/camino](https://github.com/MTES-MCT/camino)

## Technologies

- [TypeScript](https://typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](http://expressjs.com)
- [PostgreSQL](https://www.postgresql.org/)
- [Express-GraphQL](https://github.com/graphql/express-graphql)
- [Knex.js](https://knexjs.org/)
- [Objection.js](http://vincit.github.io/objection.js/)
- [Eslint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Standardjs](https://standardjs.com/)
- [Docker](https://www.docker.com/)

---

## Guide de démarrage

### Environnement

- Node.js (v.10 ou plus) et npm
- PostgreSQL (v.10 ou plus)

### Configuration et imports des données

- Cloner ce repo : `git clone https://github.com/MTES-MCT/camino.git`.
- Renommer le fichier `.env-example` en `.env` et le compléter.
- Créer une base de données PostgreSQL correspondant au fichier `.env`.

### Installation

```bash
# installe les dépendances
npm ci
```

### Développement

```bash
# démarre le serveur
npm run dev -w packages/api
```

### Production

```bash
# compile l'application avec typescript
npm run build -w packages/api

# démarre le serveur
npm run start -w packages/api
```

---

## Structure des fichiers

```bash
.
│
└── src                  # `fichiers sources. Transformés avec npm run build.`
    ├── index            # `point d'entrée`
    │
    ├── api              # `APIs`
    │   ├── graphql      # `API Graphql`
    │   └── rest         # `API Rest`
    │
    ├── config           #
    │   ├── index        # `variables globales`
    │   └── knex         # `connexion à la base de données`
    │
    ├── database         # `base de données PostgreSQL`
    │   ├── models       # `modèles de la base de données (knex.js / objection.js)`
    │   └── queries      # `requêtes à la base de données (knex.js / objection.js)`
    │
    ├── business         # `logique métier`
    │   ├── processes    # `scripts de traitement`
    │   ├── rules        # `lois et procédures administratives`
    │   ├── utils        # `utilitaires de filtrage et de classement`
    │   ├── daily        # `scripts de mise à jour quotidiens (npm run daily)`
    │   ├── etape-update # `script effectués lors de la mise à jour d'une étape`
    │   └── monthly      # `scripts de mise à jour mensuels (npm run monthly)`
    │
    ├── knex                 # `scripts de migration et d'import de la base de données
    │   ├── migrations       # `migration de la base de données`
    │
    └── tools            # `outils`
        ├── export       # `exportation de la base de données vers des spreadsheets (npm run export)`
        ├── import       # `import de spreadsheets vers des fichiers json dans /sources (npm run import)`
        ├── api-...      # `connexion aux api externes`
        └── emails-send  # `envoi d'email`

```

---

## Contribution

Voir [contributing.md](https://github.com/MTES-MCT/camino/blob/master/contributing.md) (en anglais) pour plus d'infos.

