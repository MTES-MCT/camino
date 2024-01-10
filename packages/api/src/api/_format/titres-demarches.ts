import { IFields, ITitreDemarche } from '../../types.js'

import { titreEtapeFormat } from './titres-etapes.js'
import { titreFormat } from './titres.js'
import { titreDemarcheFormatFields } from './_fields.js'

export const titreDemarcheFormat = (titreDemarche: ITitreDemarche, fields: IFields = titreDemarcheFormatFields) => {
  if (!fields) return titreDemarche

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
