import { entreprisesUpdate } from './processes/entreprises-update'
import { titresEtapesAreasUpdate } from './processes/titres-etapes-areas-update'
import { updateTerritoires } from '../tools/territoires-update'

export const monthly = async () => {
  try {
    console.info()
    console.info('- - -')
    console.info('mise à jour mensuelle')

    await entreprisesUpdate()

    await updateTerritoires()
    // mise à jour des forêts et des communes
    await titresEtapesAreasUpdate()
  } catch (e) {
    console.info('erreur:', e)

    throw e
  }
}
