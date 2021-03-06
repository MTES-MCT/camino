# API REST de Camino

L'API REST de Camino permet d'accéder aux données en lecture seule dans différents formats.

## Essayer une API REST

### Depuis un navigateur web

Pour essayer une API REST, on peut utiliser une url qui pointe vers l'api dans le champs url du navigateur web (exemple: `api.camino.beta.gouv.fr/titres?domainesIds=w&statutsIds=val`).

Les fichiers téléchargés de type `json`, `geojson`, `csv` peuvent être ouvert avec un simple éditeur de texte (Notepad sur Windows ou TextEdit sur MacOs).

### Avec une application

On peut aussi utiliser une application spécifique pour afficher le résultat des requêtes. Par exemple:

- Installer l'extension [Rester pour Firefox](https://addons.mozilla.org/en-US/firefox/addon/rester/).
- Une fois installée, cliquer sur l'icone de l'extension.
- Sur l'interface de l'extension, dans le champs `URL`, coller une url (exemple: `api.camino.beta.gouv.fr/titres?domainesIds=w&statutsIds=val`) et dans le champs `method`, sélectionner `GET`. Cliquer sur `Send`. Le résultat s'affiche.

## Exemples

### Requête sans authentification

- la liste des titres
- du domaine minier M
- dont le type est permis d'exploitation
- localisés en Guyane
- au format `.json` (par défaut)

`https://api.camino.beta.gouv.fr/titres?domainesIds=m&typesIds=ax&territoires=guyane`

### Requête avec authentification

- la liste des activités
- de l'entreprise `mon-entreprise`
- pour l'utilisateur avec l'identifiant `mon-email@mon-domaine.tld` et le mot de passe: `mon-mot-de-passe`
- au format `.csv`

`https://mon-email%40mon-domaine.tld:mon-mot-de-passe@api.camino.beta.gouv.fr/activites?titresEntreprises=mon-entreprise&format=csv`

---

## Formats

Les données sont disponibles aux formats :

- [JSON](https://www.json.org) (par défaut): tableau d'objets JavaScript
- [CSV](https://fr.wikipedia.org/wiki/Comma-separated_values) : valeurs séparées par des virgules
- [XLSx](https://fr.wikipedia.org/wiki/XLSX) : Microsoft Excel
- [ODS](https://www.openoffice.org/) : OpenOffice
- [GeoJSON](https://geojson.org/) (pour certaines ressources uniquement) : JSON Géographique

## URL

L'API est accessible à cette url : [api.camino.beta.gouv.fr/<ressource>](https://api.camino.beta.gouv.fr/).

## Méthode

Toutes les ressources sont interrogeables avec la méthode `GET`.

## Ressources

### `/titres/:id`

Retourne un titre.

#### Paramètre

- `id` : identifiant du titre

#### Chaîne de requête

- `format` : format des données (`json` ou `geojson`)

### `/titres`

Retourne la liste des titres.

#### Chaîne de requête

- `format` : format des données (`json`, `geojson`, `csv`, `xlsx` ou `ods`)
- `ordre` : tri par ordre (`asc` : ascendant ou `desc` : descendant)
- `colonne` : colonne sur laquelle se fait le tri (`activites`, `nom`, `statut`, `type` ou `domaine`)
- `typesIds` : liste de types de titres
- `domainesIds` : liste de domaines de titres
- `statutsIds` : liste de statuts de titres
- `substances` : substances de titres
- `noms` : noms de titres
- `entreprises` : entreprises titulaires ou amodiataires
- `references` : références métier de titres
- `territoires` : territoires géographiques

### `/demarches`

Retourne la liste des démarches.

#### Chaîne de requête

- `format` : format des données (`json`, `csv`, `xlsx` ou `ods`)
- `ordre` : tri par ordre (`asc` : ascendant ou `desc` : descendant)
- `colonne` : colonne sur laquelle se fait le tri (`titreNom`, `titreDomaine`, `titreType`, `titreStatut`, `type` ou `statut`)
- `typesIds` : liste de types des démarches
- `statutsIds` : liste de statuts des démarches
- `etapesInclues` : liste d'étapes incluses dans les démarches
- `etapesExclues` : liste d'étapes exclues dans les démarches
- `titresTypesIds` : liste de types de titres
- `titresDomainesIds` : liste de domaines de titres
- `titresStatutsIds` : liste de statuts de titres
- `titresNoms` : noms de titres
- `titresEntreprises` : entreprises titulaires ou amodiataires
- `titresSubstances` : substances de titres
- `titresReferences` : références métier de titres
- `titresTerritoires` : territoires géographiques

### `/activites`

Retourne la liste des activités.

#### Chaîne de requête

- `format` : format des données (`json`, `csv`, `xlsx` ou `ods`)
- `ordre` : tri par ordre (`asc` : ascendant ou `desc` : descendant)
- `colonne` : colonne sur laquelle se fait le tri (`titreNom`, `titulaire`, `periode` ou `statut`)
- `typesIds` : liste de types des activités
- `statutsIds` : liste de statuts des activités
- `annees` : années des activités
- `titresTypesIds` : liste de types de titres
- `titresDomainesIds` : liste de domaines de titres
- `titresStatutsIds` : liste de statuts de titres
- `titresNoms` : noms de titres
- `titresEntreprises` : entreprises titulaires ou amodiataires
- `titresSubstances` : substances de titres
- `titresReferences` : références métier de titres
- `titresTerritoires` : territoires géographiques

### `/utilisateurs`

Retourne la liste des utilisateurs

#### Chaîne de requête

- `format` : format des données (`json`, `csv`, `xlsx` ou `ods`)
- `ordre` : tri par ordre (`asc` : ascendant ou `desc` : descendant)
- `colonne` : colonne sur laquelle se fait le tri (`nom`, `prenom`, `email`, `role` ou `lien`)
- `entrepriseIds` : liste d'entreprises des utilisateurs
- `administrationIds` : liste d'administrations des utilisateurs
- `roles` : liste de roles des utilisateurs
- `noms` : noms des utilisateurs
- `emails` : emails des utilisateurs

### `/entreprises`

Retourne la liste des entreprises.

#### Chaîne de requête

- `format` : format des données (`json`, `csv`, `xlsx` ou `ods`)
- `noms` : noms des entreprises

## Authentification

Les utilisateurs ayant un compte Camino peuvent s'identifier sur l'API REST et ainsi accéder à des informations confidentielles.

Pour identifier l'utilisateur, le header `Authentication` de la requête HTTP doit contenir une des valeurs suivantes :

- `Basic <IDENTIFIANT>`. `IDENTIFIANT` est `mon-email@mon-domaine.tld:mon-mot-de-passe` encodé en base 64.
- `Bearer <TOKEN>`. `TOKEN` obtenu après authentification sur le site Camino.

L'identifiant peut aussi être ajouté dans l'URL. Dans ce cas, le signe `@` de l'adresse email doit être converti en `%40` :

- `https://mon-email%40mon-domaine.tld:mon-mot-de-passe@<URL>`
