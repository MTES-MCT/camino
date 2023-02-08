import { IFields } from '../../../types.js'

// ajoute les champs nécessaire pour obtenir le sous-objet titre
// pour vérifier si l'utilisateur a les droits sur les titres
export const fieldsTitreAdd = (fields: IFields) => {
  if (!fields.titre) {
    fields.titre = {
      id: {}
    }
  }

  if (!fields.titre.type) {
    fields.titre.type = { id: {}, type: { id: {} } }
  }

  if (!fields.titre.titulaires) {
    fields.titre.titulaires = { id: {} }
  }

  if (!fields.titre.amodiataires) {
    fields.titre.amodiataires = { id: {} }
  }

  return fields
}

// ajoute les démarches et les étapes sur une requête de titre
// pour calculer ses sections en fonction des sections des étapes
export const titresFieldsAdd = (fields: IFields) => {
  if (fields.activites) {
    if (!fields.activites.type) {
      fields.activites.type = { id: {} }
    }
  }

  if (fields.substances) {
    if (!fields.substancesEtape) {
      fields.substancesEtape = { id: {} }
    }
  }

  if (
    fields.secteursMaritime ||
    fields.administrationsLocale ||
    fields.administrations ||
    fields.sdomZones
  ) {
    if (!fields.pointsEtape) {
      fields.pointsEtape = { id: {} }
    }
  }

  return fields
}
