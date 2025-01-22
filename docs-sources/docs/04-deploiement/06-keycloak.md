## Intégration avec ProConnect

Nous utilisons la version 26 de keycloak, avec le provider [keycloak-franceconnect](https://github.com/InseeFr/Keycloak-FranceConnect) et le thème [DSFR](https://github.com/codegouvfr/keycloak-theme-dsfr)


Ceci est un mini tutoriel pour configurer proconnect et réussir à récupérer le numéro de siret dans le token, afin d'associer des utilisateurs automatiquement à des entreprises.

Dans l'administration de Keycloak, dans le realm Camino

- Ajouter le provider 'Agent connect' (il devrait être renommé ProConnect un jour)
- alias 'proconnect'
- display name 'ProConnect'
- client id 'le clientid généré par la démarche simplifiée'
- client secret 'le client secret généré par la démarche simplifiée
- environnement AgentConnect 'INTEGRATION_INTERNET' (pour les tests, PRODUCTION_INTERNET pour la prod)

Une fois sauvegardé, de nouvelles options apparaissent.

Pour les scopes, on a mis 'openid profile email siret given_name usual_name'

On coche 'trust email'

Pour le First login flow override, on a notre propre flow qui s'appelle 'CaminoIdentityProviderFlow'

Dans les mapper:
- on ajoute un attribute importer siret, il faut mettre siret partout en gros...
- on ajoute un attribute importer usual_name, il faut le mapper sur lastName
- on ajoute un attribute importer given_name, il faut le mapper sur firstName




Ensuite il faut aller dans le client (par exemple 'camino-local' pour le développement)
Dans l'onglet Settings, modifier Login theme à "DSFR"
Dans l'onglet client scopes, il faut modifier le 'camino-local-dedicated'
Il faut ajouter un mapper de type "user attribute" (pareil, on met siret partout...)

Et voilà \o/
