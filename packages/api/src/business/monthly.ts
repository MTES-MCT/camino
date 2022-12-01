import { entreprisesUpdate } from './processes/entreprises-update.js'
import { titresEtapesAreasUpdate } from './processes/titres-etapes-areas-update.js'
import { updateTerritoires } from '../tools/territoires-update.js'
import { subscribeUsersToGuyaneExploitants } from './entreprises-guyane.js'

export const monthly = async () => {
  try {
    console.info()
    console.info('- - -')
    console.info('mise à jour mensuelle')

    await updateTerritoires()
    await titresEtapesAreasUpdate()
    await entreprisesUpdate()
    await subscribeUsersToGuyaneExploitants()
  } catch (e) {
    console.info('erreur:', e)

    throw e
  }
}
