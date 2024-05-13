import { titreGet } from '../database/queries/titres.js'

import { titresDemarchesPublicUpdate } from './processes/titres-demarches-public-update.js'
import { titresActivitesUpdate } from './processes/titres-activites-update.js'
import { titresStatutIdsUpdate } from './processes/titres-statut-ids-update.js'
import { titresPropsEtapesIdsUpdate } from './processes/titres-props-etapes-ids-update.js'
import { titresDemarchesDatesUpdate } from './processes/titres-phases-update.js'
import { titresDemarchesOrdreUpdate } from './processes/titres-demarches-ordre-update.js'
import { titresPublicUpdate } from './processes/titres-public-update.js'
import { titresSlugsUpdate } from './processes/titres-slugs-update.js'
import { logsUpdate } from './_logs-update.js'
import { titresActivitesPropsUpdate } from './processes/titres-activites-props-update.js'
import { userSuper } from '../database/user-super.js'
import type { Pool } from 'pg'
import { TitreId } from 'camino-common/src/validators/titres.js'
import { DemarcheId } from 'camino-common/src/demarche.js'

export const titreDemarcheUpdate = async (pool: Pool, titreDemarcheId: DemarcheId | null, titreId: TitreId) => {
  try {
    console.info()
    console.info('- - -')
    console.info(`mise à jour d'une démarche : ${titreDemarcheId}`)

    const titre = await titreGet(titreId, { fields: {} }, userSuper)

    if (!titre) {
      throw new Error(`warning: le titre ${titreId} n'existe pas`)
    }

    let titresDemarchesPublicUpdated

    const titresDemarchesOrdreUpdated = await titresDemarchesOrdreUpdate([titreId])
    const [titresDemarchesDatesUpdated = []] = await titresDemarchesDatesUpdate(pool, [titreId])

    // si c'est une création ou modification
    // pas une suppression
    if (titreDemarcheId) {
      titresDemarchesPublicUpdated = await titresDemarchesPublicUpdate([titreId])
    }
    const titresStatutIdUpdated = await titresStatutIdsUpdate([titreId])
    const titresPublicUpdated = await titresPublicUpdate(pool, [titreId])
    const titresPropsEtapesIdsUpdated = await titresPropsEtapesIdsUpdate([titreId])
    const titresActivitesCreated = await titresActivitesUpdate(pool, [titreId])
    const titresActivitesPropsUpdated = await titresActivitesPropsUpdate([titreId])

    const titresUpdatedIndex = await titresSlugsUpdate([titreId])

    logsUpdate({
      titresDemarchesPublicUpdated,
      titresDemarchesOrdreUpdated,
      titresStatutIdUpdated,
      titresPublicUpdated,
      titresDemarchesDatesUpdated,
      titresPropsEtapesIdsUpdated,
      titresActivitesCreated,
      titresActivitesPropsUpdated,
      titresUpdatedIndex,
    })
  } catch (e) {
    console.error(`erreur: titreDemarcheUpdate ${titreId}`)
    console.error(e)
    throw e
  }
}
