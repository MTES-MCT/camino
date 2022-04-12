# configuration des scripts de déploiement

## Déploiement

Dans /srv/www/camino, lancer

```bash
CAMINO_TAG=camino_git_sha docker-compose up -d
```

ou camino_git_sha est le sha associé à la release