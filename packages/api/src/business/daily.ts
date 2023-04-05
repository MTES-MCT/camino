import { titresActivitesStatutIdsUpdate } from './processes/titres-activites-statut-ids-update.js'
import { titresActivitesUpdate } from './processes/titres-activites-update.js'
import { titresDatesUpdate } from './processes/titres-dates-update.js'
import { titresDemarchesOrdreUpdate } from './processes/titres-demarches-ordre-update.js'
import { titresDemarchesPublicUpdate } from './processes/titres-demarches-public-update.js'
import { titresDemarchesStatutIdUpdate } from './processes/titres-demarches-statut-ids-update.js'
import { titresEtapesAdministrationsLocalesUpdate } from './processes/titres-etapes-administrations-locales-update.js'
import { titresEtapesOrdreUpdate } from './processes/titres-etapes-ordre-update.js'
import { titresPhasesUpdate } from './processes/titres-phases-update.js'
import { titresPointsReferencesCreate } from './processes/titres-points-references-create.js'
import { titresPublicUpdate } from './processes/titres-public-update.js'
import { titresPropsEtapesIdsUpdate } from './processes/titres-props-etapes-ids-update.js'
import { titresContenusEtapesIdsUpdate } from './processes/titres-contenus-etapes-ids-update.js'
import { titresStatutIdsUpdate } from './processes/titres-statut-ids-update.js'
import { titresCoordonneesUpdate } from './processes/titres-coordonnees-update.js'
import { titresEtapesHeritagePropsUpdate } from './processes/titres-etapes-heritage-props-update.js'
import { titresEtapesHeritageContenuUpdate } from './processes/titres-etapes-heritage-contenu-update.js'
import { titresActivitesPropsUpdate } from './processes/titres-activites-props-update.js'
import { titresSlugsUpdate } from './processes/titres-slugs-update.js'
import { logsUpdate } from './_logs-update.js'
import { userSuper } from '../database/user-super.js'
import { titresActivitesRelanceSend } from './processes/titres-activites-relance-send.js'

export const daily = async () => {
  try {
    console.info()
    console.info('- - -')
    console.info('mise à jour quotidienne')

    const titresEtapesOrdreUpdated = await titresEtapesOrdreUpdate(userSuper)
    const titresEtapesHeritagePropsUpdated = await titresEtapesHeritagePropsUpdate(userSuper)
    const titresEtapesHeritageContenuUpdated = await titresEtapesHeritageContenuUpdate(userSuper)
    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate()
    const titresDemarchesPublicUpdated = await titresDemarchesPublicUpdate()
    const titresDemarchesOrdreUpdated = await titresDemarchesOrdreUpdate()
    const [titresPhasesUpdated = [], titresPhasesDeleted = []] = await titresPhasesUpdate()
    const titresStatutIdUpdated = await titresStatutIdsUpdate()
    const titresPublicUpdated = await titresPublicUpdate()
    // const titresDatesUpdated = await titresDatesUpdate()
    // const pointsReferencesCreated = await titresPointsReferencesCreate()
    // const { titresEtapesAdministrationsLocalesUpdated } = await titresEtapesAdministrationsLocalesUpdate()
    // const titresPropsEtapesIdsUpdated = await titresPropsEtapesIdsUpdate()
    // const titresContenusEtapesIdsUpdated = await titresContenusEtapesIdsUpdate()

    // const titresCoordonneesUpdated = await titresCoordonneesUpdate()
    // const titresActivitesCreated = await titresActivitesUpdate()
    // const titresActivitesRelanceSent = await titresActivitesRelanceSend()
    // const titresActivitesStatutIdsUpdated = await titresActivitesStatutIdsUpdate()
    // const titresActivitesPropsUpdated = await titresActivitesPropsUpdate()
    // const titresUpdatedIndex = await titresSlugsUpdate()

    // logsUpdate({
    //   // titresEtapesOrdreUpdated,
    //   // titresEtapesHeritagePropsUpdated,
    //   // titresEtapesHeritageContenuUpdated,
    //   // titresDemarchesStatutUpdated,
    //   // titresDemarchesPublicUpdated,
    //   // titresDemarchesOrdreUpdated,
    //   // titresStatutIdUpdated,
    //   // titresPublicUpdated,
    //   titresPhasesUpdated,
    //   titresPhasesDeleted,
    //   titresDatesUpdated,
    //   pointsReferencesCreated,
    //   titresEtapesAdministrationsLocalesUpdated: titresEtapesAdministrationsLocalesUpdated.map(({ titreEtapeId }) => titreEtapeId),
    //   titresPropsEtapesIdsUpdated,
    //   titresContenusEtapesIdsUpdated,
    //   titresCoordonneesUpdated,
    //   titresActivitesCreated,
    //   titresActivitesRelanceSent,
    //   titresActivitesStatutIdsUpdated,
    //   titresActivitesPropsUpdated,
    //   titresUpdatedIndex,
    // })
  } catch (e) {
    console.info('erreur:', e)

    throw e
  }
}
