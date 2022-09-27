import { entreprisesUpdate } from './processes/entreprises-update'
import { titresEtapesAreasUpdate } from './processes/titres-etapes-areas-update'
import { updateTerritoires } from '../tools/territoires-update'
import { subscribeUsersToGuyaneExploitants } from './entreprises-guyane'

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
