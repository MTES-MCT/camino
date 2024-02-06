import { FieldsDemarche, FieldsEtape, FieldsTitre } from '../../database/queries/_options'

export const titreEtapeFormatFields: FieldsEtape = {
}

export const titreDemarcheFormatFields: FieldsDemarche = {
  etapes: titreEtapeFormatFields,
}

export const titreFormatFields: FieldsTitre = {
  surface: {},
  demarches: titreDemarcheFormatFields,
  activites: {},
  administrations: {},
}

titreDemarcheFormatFields.titre = titreFormatFields
