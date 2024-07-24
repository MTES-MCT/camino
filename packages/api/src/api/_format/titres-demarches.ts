import { ITitreDemarche } from '../../types'

import { titreEtapeFormat } from './titres-etapes'
import { titreFormat } from './titres'
import { titreDemarcheFormatFields } from './_fields'
import { FieldsDemarche } from '../../database/queries/_options'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'

export const titreDemarcheFormat = (titreDemarche: ITitreDemarche, fields: FieldsDemarche = titreDemarcheFormatFields) => {
  if (isNullOrUndefined(fields)) return titreDemarche

  if (fields.titre && titreDemarche.titre) {
    titreDemarche.titre = titreFormat(titreDemarche.titre, fields.titre)
  }

  if (fields.etapes && titreDemarche.etapes && titreDemarche.etapes.length) {
    titreDemarche.etapes = titreDemarche.etapes.map(te => {
      const etape = titreEtapeFormat(te, fields.etapes)
      delete etape.heritageProps
      delete etape.heritageContenu

      return etape
    })
  }

  return titreDemarche
}
