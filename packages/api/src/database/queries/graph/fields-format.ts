import { IFields } from '../../../types'

const fieldsOrderDesc = ['etablissements', 'demarches', 'activites']
const fieldsOrderAsc = ['references']
const fieldsToRemove = ['heritageProps', 'communes']
const titreFieldsToRemove: string[] = ['geojson4326Centre', 'references']

// ajoute des propriétés requises par /database/queries/_format
export const fieldsFormat = (fields: IFields, parent: string): IFields => {
  const isParentTitre = ['titres', 'titre'].includes(parent)

  // supprime la propriété `coordonnees`
  fieldsToRemove.forEach(key => {
    // eslint-disable-next-line
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
    // eslint-disable-next-line
    if (fields.surface) {
      fields.pointsEtape = { id: {} }
      delete fields.surface
    }
    // eslint-disable-next-line
    if (fields.substances) {
      fields.substancesEtape = { id: {} }
      delete fields.substances
    }

    // eslint-disable-next-line
    if (fields.titulaireIds) {
      fields.titulairesEtape = { id: {} }
      delete fields.titulaireIds
    }
    // eslint-disable-next-line
    if (fields.amodiataireIds) {
      fields.amodiatairesEtape = { id: {} }
      delete fields.amodiataireIds
    }

    // supprime certaines propriétés
    titreFieldsToRemove.forEach(key => {
      // eslint-disable-next-line
      if (fields[key]) {
        delete fields[key]
      }
    })
  }

  // on a besoin des activités si elles sont absentes
  // pour calculer le nombre d'activités par type
  // eslint-disable-next-line
  if (!fields.activites) {
    // eslint-disable-next-line
    if (fields.activitesEnConstruction || fields.activitesAbsentes) {
      fields.activites = { id: {} }
    }
  }

  // pour calculer la propriété « déposable » sur les étapes
  if (['etapes', 'etape'].includes(parent)) {
    // eslint-disable-next-line
    if (!fields.demarche) {
      fields.demarche = { id: {} }
    }
    // eslint-disable-next-line
    if (!fields.demarche.titre) {
      fields.demarche.titre = { id: {} }
    }
  }

  return fields
}
