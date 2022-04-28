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
    const { titresCommunes, titresForets, titresSDOMZones } =
      await titresEtapesAreasUpdate()
    const {
      areasUpdated: communesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesCommunesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesCommunesDeleted = []
    } = titresCommunes
    const {
      areasUpdated: foretsUpdated = [],
      titresEtapesAreasUpdated: titresEtapesForetsUpdated = [],
      titresEtapesAreasDeleted: titresEtapesForetsDeleted = []
    } = titresForets
    const {
      areasUpdated: sdomZonesUpdated = [],
      titresEtapesAreasUpdated: titresEtapesSDOMZonesUpdated = [],
      titresEtapesAreasDeleted: titresEtapesSDOMZonesDeleted = []
    } = titresSDOMZones

    logsUpdate({
      entreprisesUpdated,
      etablissementsUpdated,
      etablissementsDeleted,
      communesUpdated,
      titresEtapesCommunesUpdated,
      titresEtapesCommunesDeleted,
      foretsUpdated,
      titresEtapesForetsUpdated,
      titresEtapesForetsDeleted,
      sdomZonesUpdated,
      titresEtapesSDOMZonesUpdated,
      titresEtapesSDOMZonesDeleted
    })
  } catch (e) {
    console.info('erreur:', e)

    throw e
  }
}

export default monthly
