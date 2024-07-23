import { titresActivitesUpdate } from './processes/titres-activites-update'
import { titresPublicUpdate } from './processes/titres-public-update'
import { titresSlugsUpdate } from './processes/titres-slugs-update'
import { logsUpdate } from './_logs-update'
import { TitreId } from 'camino-common/src/validators/titres'
import { Pool } from 'pg'

export const titreUpdateTask = async (pool: Pool, titreId: TitreId): Promise<void> => {
  try {
    console.info()
    console.info('- - -')
    console.info(`mise à jour d'un titre : ${titreId}`)

    const titresPublicUpdated = await titresPublicUpdate(pool, [titreId])

    const titresActivitesCreated = await titresActivitesUpdate(pool, [titreId])
    const titresUpdatedIndex = await titresSlugsUpdate([titreId])

    logsUpdate({
      titresPublicUpdated,
      titresActivitesCreated,
      titresUpdatedIndex,
    })
  } catch (e) {
    console.error(`erreur: titreUpdate ${titreId}`)
    console.error(e)
    throw e
  }
}
