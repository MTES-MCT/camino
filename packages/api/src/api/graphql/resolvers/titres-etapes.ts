import { Context } from '../../../types.js'

import { titreDemarcheGet } from '../../../database/queries/titres-demarches.js'

import { titreEtapeHeritageBuild } from './_titre-etape.js'

import { titreEtapeFormat } from '../../_format/titres-etapes.js'
import { userSuper } from '../../../database/user-super.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { titreEtapeFormatFields } from '../../_format/_fields.js'
import { EtapeId } from 'camino-common/src/etape.js'
import { DemarcheId } from 'camino-common/src/demarche.js'

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
