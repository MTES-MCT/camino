import { IFields } from '../../types.js'

export const titreEtapeFormatFields = {
  geojsonMultiPolygon: {},
  geojsonPoints: {},
  sections: {},
} as IFields

export const titreDemarcheFormatFields = {
  etapes: titreEtapeFormatFields,
} as IFields

export const titreFormatFields = {
  surface: {},
  geojsonMultiPolygon: {},
  geojsonPoints: {},
  demarches: titreDemarcheFormatFields,
  activites: {
    sections: {},
  },
  administrations: {},
} as IFields

titreDemarcheFormatFields.titre = titreFormatFields
