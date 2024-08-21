# Déploiement de Camino

## DEV https://dev.camino.beta.gouv.fr

> Merger une pull-request

Tout push sur la branche [master](https://gitlab-forge.din.developpement-durable.gouv.fr/pub/pnm-public/camino/tree/master) déclenche la [CI](https://gitlab-forge.din.developpement-durable.gouv.fr/pub/pnm-public/camino/actions/workflows/ci.yml?query=branch%3Amaster), qui, en cas de succès, déclenche le déploiement.

## PREPROD https://preprod.camino.beta.gouv.fr

> Faire pointer la branche **preprod** sur le commit à livrer en preprod

Tout push sur la branche [preprod](https://gitlab-forge.din.developpement-durable.gouv.fr/pub/pnm-public/camino/tree/preprod) déclenche la [CD](https://gitlab-forge.din.developpement-durable.gouv.fr/pub/pnm-public/camino/actions/workflows/deploy.yml?query=branch%3Apreprod).


## PROD https://camino.beta.gouv.fr

> Faire pointer la branche **prod** sur le commit à livrer en prod

Tout push sur la branche [prod](https://gitlab-forge.din.developpement-durable.gouv.fr/pub/pnm-public/camino/-/tree/prod) déclenche la [CD](https://gitlab-forge.din.developpement-durable.gouv.fr/pub/pnm-public/camino/-/pipelines?page=1&scope=branches&ref=prod).
Avant de déployer, une [release gitlab](https://gitlab-forge.din.developpement-durable.gouv.fr/pub/pnm-public/camino/-/releases) est faite, qui contiendra toutes les features/bugfixes embarqués dans cette livraison depuis la version précédente
