import { IFields } from '../../types'

const titreActiviteFormatFields = {
  sections: {}
} as IFields

const titreEtapeFormatFields = {
  geojsonMultiPolygon: {},
  geojsonPoints: {},
  sections: {}
} as IFields

const titreDemarcheFormatFields = {
  etapes: titreEtapeFormatFields
} as IFields

const titreFormatFields = {
  surface: {},
  geojsonMultiPolygon: {},
  geojsonPoints: {},
  demarches: titreDemarcheFormatFields,
  activites: titreActiviteFormatFields,
  administrations: {}
} as IFields

titreDemarcheFormatFields.titre = titreFormatFields

export {
  titreEtapeFormatFields,
  titreDemarcheFormatFields,
  titreActiviteFormatFields,
  titreFormatFields
}
