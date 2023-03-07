# Utilisateurs

## Usurpation d'identité

Keycloak permet de se faire passer pour un utilisateur.
Nous l'utilisons lors des phases de recette afin de tester tous les profils utilisateurs

Nous voulions l'intégrer directement à l'application mais pour le moment nous n'avons pas réussi et nous avons levé une issue sur le site de oauth2_proxy : https://github.com/oauth2-proxy/oauth2-proxy/issues/2003


![camino impersonation schema](../img/keycloak_impersonate.svg)


## Ajouter un utilisateur sur le serveur

Aller ici : `infra/roles/user/vars/main.yml` et ajouter l'utilisateur

Lancer ansible sur l'environnement cible (`make dev` `make preprod` `make prod`)
