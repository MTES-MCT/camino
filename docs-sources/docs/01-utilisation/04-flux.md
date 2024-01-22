# Flux GeoJSON

Les flux géographiques de Camino exposent les informations sur les titres miniers et autorisations au format GeoJSON.

Ces flux sont générés via l'[API Rest de Camino](https://docs.camino.beta.gouv.fr/pages/Utilisation/03-rest.html).

Chaque titre minier contient les périmètres géographiques ainsi que les propriétés suivantes :

- identifiant, nom, type, nature, domaine minier, et statut
- dates de demande, début et fin
- surface (en km²) du périmètre
- territoires concernés (communes, départements, et régions)
- administrations concernées
- titulaires et amodiataires avec leur numéro de Siren
- engagement financier
- substances
- volume

## Utilisation

### URL

L’url d'accès aux flux de camino est du type : `https://api.camino.beta.gouv.fr/titres?format=geojson`.

### Paramètres

Le paramètre `format=geojson` définit le format des données.

Le résultat de la requête peut être filtré en ajoutant des paramètres à l’url. Les noms et valeurs de ces paramètres sont les mêmes que ceux utilisés dans les filtres sur le site [camino](https://camino.beta.gouv.fr).

#### Construire une requête filtrée avec des paramètres

1. Effectuer une recherche filtrée sur le site [Camino](https://camino.beta.gouv.fr). Par exemple, pour n'afficher que les titres de type _concessions_ du domaine _hydrocarbures_ avec un statut _valide_ l'url est : `https://camino.beta.gouv.fr/titres?domainesIds=h&statutsIds=val&typesIds=cx`.

2. Modifier cette url en ajoutant `api.` après `https://`, et `&format=geojson` en fin de chaîne. L'url modifiée est : `https://api.camino.beta.gouv.fr/titres?domainesIds=h&statutsIds=val&typesIds=cx&format=geojson`.

3. Le résultat s'affiche au format GeoJSON.

### Authentification

Certains titres miniers et autorisations nécessitent d'être identifiés pour être consultés. Ils sont uniquement accessibles via la route `https://api.camino.beta.gouv.fr/titres_qgis`. Un compte sur Camino est requis pour effectuer cette requête. Un jeton QGIS doit être généré à l'aide du bouton `Générer un jeton QGIS` présent sur votre page profil. Attention, ce jeton ne sera visible qu'à ce moment, veillez à bien le sauvegarder pour l'utiliser lors de vos appels. Il est bien sûr possible d'en générer un nouveau pour le remplacer si il a été perdu.

![Screenshot de la page profil avec le bouton pour générer un jeton QGIS](../img/camino_qgis_token_button.png)

#### Construire une requête avec authentification

Ajouter les identifiants Camino dans l'url. L'identifiant à Camino est un email, pour l'utiliser dans l'url, il faut remplacer le caratère `@` par `%40`. Le caractère `@` est ajouté après le jeton qgis.

Exemple: `https://mon-email%40mon-domaine.tld:jeton-qgis@api.camino.beta.gouv.fr/titres_qgis?format=geojson`.

### Proxy du **RIE** (Réseau Interministériel de l'État)

- hôte : `pfrie-std.proxy.e2.rie.gouv.fr`
- Port : `8080`

## Utilisation dans QGIS

Les flux GeoJSON de Camino peuvent être affichés dans [QGIS](https://www.qgis.org) sous forme de couche.

Les donnés importées sont automatiquement mises à jour à chaque ouverture ou rafraîchissement du projet.


Pour récupérer les périmètres et autres informations sur les titres directement dans le logiciel QGIS vous devez aller sur votre page de profil en appuyant sur votre nom en haut à droite de la page.


Sur votre profil, appuyer sur le bouton « Générer des identifiants pour QGIS »

Vous pouvez alors copier/coller cette URL directement dans QGIS à l’emplacement de l’illustration suivante.

1. Dans le menu _Couches_, sélectionner _Gestionnaire des sources de données_, puis choisir l'option _Vecteur_.
2. Dans la popup, utiliser les réglages suivants :

- type de source : `Protocole : HTTP(S), cloud, etc.`
- encodage : `UTF-8`
- Protocole :
  - Type : `GeoJSON`
  - URI : l'URL qui vous venez de copier depuis le menu utilisateur de Camino

![camino qgis data sources manager](media://flux/camino-qgis-data-source-manager.jpg)
