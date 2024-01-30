import { ITitreEtape } from '../../types.js'

import { DocumentTypeData, etapeTypeFormat } from './etapes-types.js'
import { entrepriseFormat } from './entreprises.js'
import { titreEtapeFormatFields } from './_fields.js'
import { titreDemarcheFormat } from './titres-demarches.js'

export const titreEtapeFormat = (titreEtape: ITitreEtape, fields = titreEtapeFormatFields, documentTypeData: DocumentTypeData | null = null) => {
  if (titreEtape.demarche) {
    titreEtape.demarche = titreDemarcheFormat(titreEtape.demarche, fields.demarche)
  }

  if (titreEtape.type) {
    titreEtape.type = etapeTypeFormat(titreEtape, documentTypeData)
  }

  if (!fields) return titreEtape

  titreEtape.titulaires = titreEtape.titulaires?.map(entrepriseFormat)

  titreEtape.amodiataires = titreEtape.amodiataires?.map(entrepriseFormat)

  return titreEtape
}
