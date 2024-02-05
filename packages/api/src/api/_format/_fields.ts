import { IFields } from '../../types.js'

export const titreEtapeFormatFields = {
  sections: {},
} as IFields

export const titreDemarcheFormatFields = {
  etapes: titreEtapeFormatFields,
} as IFields

export const titreFormatFields = {
  surface: {},
  demarches: titreDemarcheFormatFields,
  activites: {
    sections: {},
  },
  administrations: {},
} as IFields

titreDemarcheFormatFields.titre = titreFormatFields
