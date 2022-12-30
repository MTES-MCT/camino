# Déploiement de Camino

## DEV https://dev.camino.beta.gouv.fr

> Merger une pull-request

Tout push sur la branche [master](https://github.com/MTES-MCT/camino/tree/master) déclenche la [CI](https://github.com/MTES-MCT/camino/actions/workflows/ci.yml?query=branch%3Amaster), qui, en cas de succès, déclenche le déploiement.

## PREPROD https://preprod.camino.beta.gouv.fr

> Faire pointer la branche **preprod** sur le commit à livrer en preprod

Tout push sur la branche [preprod](https://github.com/MTES-MCT/camino/tree/preprod) déclenche la [CD](https://github.com/MTES-MCT/camino/actions/workflows/deploy.yml?query=branch%3Apreprod).


## PROD https://camino.beta.gouv.fr

> Faire pointer la branche **prod** sur le commit à livrer en prod

Tout push sur la branche [prod](https://github.com/MTES-MCT/camino/tree/prod) déclenche la [CD](https://github.com/MTES-MCT/camino/actions/workflows/deploy.yml?query=branch%3Aprod).
Avant de déployer, une [release github](https://github.com/MTES-MCT/camino/releases) est faite, qui contiendra toutes les features/bugfixes embarqués dans cette livraison depuis la version précédente


