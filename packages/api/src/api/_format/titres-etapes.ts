import { ITitreEtape } from '../../types.js'

import { titreEtapeFormatFields } from './_fields.js'
import { titreDemarcheFormat } from './titres-demarches.js'

export const titreEtapeFormat = (titreEtape: ITitreEtape, fields = titreEtapeFormatFields) => {
  if (titreEtape.demarche) {
    titreEtape.demarche = titreDemarcheFormat(titreEtape.demarche, fields.demarche)
  }

  return titreEtape
}
