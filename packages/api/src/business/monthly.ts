import { entreprisesUpdate } from './processes/entreprises-update.js'
import { titresEtapesAreasUpdate } from './processes/titres-etapes-areas-update.js'
import { updateTerritoires } from '../tools/territoires-update.js'
import { subscribeUsersToGuyaneExploitants } from './entreprises-guyane.js'
import { Pool } from 'pg'

export const monthly = async (pool: Pool) => {
  try {
    console.info()
    console.info('- - -')
    console.info('mise à jour mensuelle')

    await updateTerritoires(pool)
    await titresEtapesAreasUpdate(pool)
    await entreprisesUpdate()
    await subscribeUsersToGuyaneExploitants()
  } catch (e) {
    console.info('erreur:', e)

    throw e
  }
}
