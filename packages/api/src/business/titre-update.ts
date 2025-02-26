import { titresActivitesUpdate } from './processes/titres-activites-update'
import { titresPublicUpdate } from './processes/titres-public-update'
import { titresSlugsUpdate } from './processes/titres-slugs-update'
import { TitreId } from 'camino-common/src/validators/titres'
import { Pool } from 'pg'

export const titreUpdateTask = async (pool: Pool, titreId: TitreId): Promise<void> => {
  try {
    console.info()
    console.info('- - -')
    console.info(`mise à jour d'un titre : ${titreId}`)

    await titresPublicUpdate(pool, [titreId])
    await titresActivitesUpdate(pool, [titreId])
    await titresSlugsUpdate([titreId])
  } catch (e) {
    console.error(`erreur: titreUpdate ${titreId}`)
    console.error(e)
    throw e
  }
}
