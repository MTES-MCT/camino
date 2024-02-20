/* eslint-disable @typescript-eslint/strict-boolean-expressions */

const fieldsOrderDesc = ['etablissements', 'demarches', 'activites']
const fieldsOrderAsc = ['references']
const fieldsToRemove = ['heritageProps', 'communes']
const titreFieldsToRemove: string[] = ['geojson4326Centre', 'references']

interface IFields {
  [key: string]: IFields
}

// ajoute des propriétés requises par /database/queries/_format
export const fieldsFormat = (fields: IFields, parent: string) => {
  const isParentTitre = ['titres', 'titre', 'amodiataireTitres', 'titulaireTitres'].includes(parent)

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
