const fieldsOrderDesc = ['etablissements', 'demarches', 'activites']
const fieldsOrderAsc = ['domaines', 'points', 'references', 'titresTypes']
const fieldsToRemove = ['coordonnees', 'incertitudes', 'heritageProps', 'communes']
const titreFieldsToRemove: string[] = ['geojsonCentre', 'references']
const geoFieldsToReplace = ['geojsonPoints', 'geojsonMultiPolygon']
const titrePropsEtapesFields = ['surface', 'substances']

interface IFields {
  [key: string]: IFields
}

const graphTitreAdministrationsFormat = (fields: IFields, type: string) => {
  if (!fields.administrations) return

  fields[`administrations${type}`] = {
    ...fields.administrations,
  }
}

// ajoute des propriétés requises par /database/queries/_format
export const fieldsFormat = (fields: IFields, parent: string) => {
  const isParentTitre = ['titres', 'titre', 'amodiataireTitres', 'titulaireTitres'].includes(parent)

  // ajoute la propriété `titreType` sur les démarches
  if (fields.demarches && !fields.demarches.titreType) {
    fields.demarches.titreType = { id: {} }
  }

  // ajoute la propriété `type` sur les démarches
  // pour pouvoir récupérer les types d'étapes spécifiques
  if (fields.demarches && !fields.demarches.type) {
    fields.demarches.type = { id: {} }
  }


  // ajoute la propriété `type` sur les activités
  // pour savoir si une activité est liée à une administration
  if (fields.activites && !fields.activites.type) {
    fields.activites.type = { id: {} }
  }

  // si `geojsonPoints` ou `geojsonMultiPolygon` sont présentes
  // - ajoute la propriété `points`
  // - supprime les propriété `geojsonPoints` ou `geojsonMultiPolygon`
  geoFieldsToReplace.forEach(key => {
    if (fields[key]) {
      if (!fields.points) {
        fields.points = { id: {} }
      }

      delete fields[key]
    }
  })

  // supprime la propriété `coordonnees`
  fieldsToRemove.forEach(key => {
    if (fields[key]) {
      delete fields[key]
    }
  })

  // ajoute `(orderDesc)` à certaine propriétés
  if (fieldsOrderDesc.includes(parent)) {
    // TODO: est ce qu'on peut faire un typage plus propre ?
    fields.$modifier = 'orderDesc' as unknown as IFields
  }

  // ajoute `(orderAsc)` à certaine propriétés
  if (fieldsOrderAsc.includes(parent)) {
    fields.$modifier = 'orderAsc' as unknown as IFields
  }

  if (isParentTitre && fields.administrations) {
    graphTitreAdministrationsFormat(fields, 'Gestionnaires')
    delete fields.administrations
  }

  // sur les titres
  if (isParentTitre) {
    // si la propriété `surface` est présente
    // - la remplace par `surfaceEtape`
    titrePropsEtapesFields.forEach(key => {
      if (fields[key]) {
        fields[`${key}Etape`] = { id: {} }

        delete fields[key]
      }
    })

    // supprime certaines propriétés
    titreFieldsToRemove.forEach(key => {
      if (fields[key]) {
        delete fields[key]
      }
    })

    // trie les types de titres
    if (fields.type) {
      fields.type.$modifier = 'orderAsc' as unknown as IFields
    }

    // ajouter titulaires et amodiataires
  }

  if (['activites', 'activite'].includes(parent)) {
    if (!fields.type) {
      fields.type = { id: {} }
    }
  }

  // on a besoin des activités si elles sont absentes
  // pour calculer le nombre d'activités par type
  if (!fields.activites) {
    if (fields.activitesEnConstruction || fields.activitesAbsentes) {
      fields.activites = { id: {} }
    }
  }

  // pour calculer la propriété « déposable » sur les étapes
  if (['etapes', 'etape'].includes(parent)) {
    if (!fields.documents) {
      fields.documents = { id: {} }
    }

    if (!fields.type) {
      fields.type = { id: {} }
    }

    delete fields.type.documentsTypes

    if (!fields.demarche) {
      fields.demarche = { id: {} }
    }

    if (!fields.demarche.titre) {
      fields.demarche.titre = { id: {} }
    }

    if (!fields.points) {
      fields.points = { id: {} }
    }
  }

  return fields
}
