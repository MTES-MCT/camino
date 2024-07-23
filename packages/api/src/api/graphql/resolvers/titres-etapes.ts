import { Context } from '../../../types'

import { titreDemarcheGet } from '../../../database/queries/titres-demarches'

import { titreEtapeHeritageBuild } from './_titre-etape'

import { titreEtapeFormat } from '../../_format/titres-etapes'
import { userSuper } from '../../../database/user-super'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { CaminoDate } from 'camino-common/src/date'
import { titreEtapeFormatFields } from '../../_format/_fields'
import { EtapeId } from 'camino-common/src/etape'
import { DemarcheId } from 'camino-common/src/demarche'

export const etapeHeritage = async ({ date, titreDemarcheId, typeId, etapeId }: { date: CaminoDate; titreDemarcheId: DemarcheId; typeId: EtapeTypeId; etapeId: EtapeId | null }, { user }: Context) => {
  try {
    let titreDemarche = await titreDemarcheGet(titreDemarcheId, { fields: {} }, user)

    if (!titreDemarche) throw new Error("la démarche n'existe pas")

    titreDemarche = await titreDemarcheGet(
      titreDemarcheId,
      {
        fields: {
          titre: { id: {} },
          etapes: { id: {} },
        },
      },
      userSuper
    )

    const titreEtape = titreEtapeHeritageBuild(date, typeId, titreDemarche!, titreDemarche!.titre!.typeId, titreDemarche!.typeId, etapeId)
    const titreTypeId = titreDemarche?.titre?.typeId
    if (!titreTypeId) {
      throw new Error(`le type du titre de l'étape ${titreEtape.id} n'est pas chargé`)
    }

    return titreEtapeFormat(titreEtape, titreEtapeFormatFields)
  } catch (e) {
    console.error(e)

    throw e
  }
}
