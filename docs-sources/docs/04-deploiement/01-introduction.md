# Déploiement de Camino

- Tout commit sur master déploie automatiquement camino en dev (dev.camino.beta.gouv.fr)
- Pour déployer en preprod, il faut déclencher manuellement le workflow https://github.com/MTES-MCT/camino/actions/workflows/cd.yml avec l'environnement de preprod et le hash de commit que l'on souhaite déployer
- Pour déployer en prod, il suffit de faire pointer la branche `release-candidate` sur le commit que l'on souhaite déployer en production
