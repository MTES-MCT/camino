import { entreprisesUpdate } from './processes/entreprises-update'
import { titresEtapesAreasUpdate } from './processes/titres-etapes-areas-update'
import { updateTerritoires } from '../tools/territoires-update'
import { subscribeUsersToGuyaneExploitants } from './entreprises-guyane'
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
