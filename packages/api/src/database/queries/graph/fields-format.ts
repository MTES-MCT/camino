const fieldsOrderDesc = ['etablissements', 'demarches', 'activites']
const fieldsOrderAsc = ['domaines', 'references', 'titresTypes']
const fieldsToRemove = ['heritageProps', 'communes']
const titreFieldsToRemove: string[] = ['geojson4326Centre', 'references']

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
    // - la remplace par `pointsEtape`
    if (fields.surface) {
      fields.pointsEtape = { id: {} }

      delete fields.surface
    }
    if (fields.substances) {
      fields.substancesEtape = { id: {} }

      delete fields.substances
    }

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
  }

  return fields
}
