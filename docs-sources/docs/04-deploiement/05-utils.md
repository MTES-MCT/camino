# Scripts

## Utilitaires

### Récupérer la base de données de production

Pré-requis: avoir un utilisateur se connectant en SSH sur le serveur de production.

```sh
# récupère la dernière version de la base de données de production
# - depuis le serveur: `/srv/backups/camino.sql`
# - vers le dossier local: `/backups/camino.sql`
u=votre-nom-d-utilisateur npm run db:prod-fetch
```


### Recréer la base de données en production

Pré-requis: avoir un utilisateur se connectant en SSH sur le serveur de production.

```sh

# Se connecter dans le container
docker exec -ti camino_api_app sh
npm run db:migrate

```

---
