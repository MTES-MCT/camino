import { ITitreEtape } from '../../types.js'

import { entrepriseFormat } from './entreprises.js'
import { titreEtapeFormatFields } from './_fields.js'
import { titreDemarcheFormat } from './titres-demarches.js'

export const titreEtapeFormat = (titreEtape: ITitreEtape, fields = titreEtapeFormatFields) => {
  if (titreEtape.demarche) {
    titreEtape.demarche = titreDemarcheFormat(titreEtape.demarche, fields.demarche)
  }

  if (!fields) return titreEtape

  titreEtape.titulaires = titreEtape.titulaires?.map(entrepriseFormat)

  titreEtape.amodiataires = titreEtape.amodiataires?.map(entrepriseFormat)

  return titreEtape
}
