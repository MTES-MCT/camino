import { titresActivitesUpdate } from './processes/titres-activites-update.js'
import { titresPublicUpdate } from './processes/titres-public-update.js'
import { titresSlugsUpdate } from './processes/titres-slugs-update.js'
import { logsUpdate } from './_logs-update.js'
import { TitreId } from 'camino-common/src/validators/titres.js'
import { Pool } from 'pg'

const titreUpdate = async (pool: Pool, titreId: TitreId) => {
  try {
    console.info()
    console.info('- - -')
    console.info(`mise à jour d'un titre : ${titreId}`)

    const titresPublicUpdated = await titresPublicUpdate(pool, [titreId])

    const titresActivitesCreated = await titresActivitesUpdate([titreId])
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

export default titreUpdate
