import { entreprisesUpdate } from './processes/entreprises-update'
import { titresEtapesAreasUpdate } from './processes/titres-etapes-areas-update'
import { logsUpdate } from './_logs-update'

const monthly = async () => {
  try {
    console.info()
    console.info('- - -')
    console.info('mise à jour mensuelle')

    const {
      entreprisesUpdated = [],
      etablissementsUpdated = [],
      etablissementsDeleted = []
    } = await entreprisesUpdate()
    // mise à jour des forêts et des communes
    await titresEtapesAreasUpdate()

    logsUpdate({
      entreprisesUpdated,
      etablissementsUpdated,
      etablissementsDeleted
    })
  } catch (e) {
    console.info('erreur:', e)

    throw e
  }
}

export default monthly
