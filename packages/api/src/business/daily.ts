import { titresActivitesStatutIdsUpdate } from './processes/titres-activites-statut-ids-update.js'
import { titresActivitesUpdate } from './processes/titres-activites-update.js'
import { titresDemarchesOrdreUpdate } from './processes/titres-demarches-ordre-update.js'
import { titresDemarchesPublicUpdate } from './processes/titres-demarches-public-update.js'
import { titresDemarchesStatutIdUpdate } from './processes/titres-demarches-statut-ids-update.js'
import { titresEtapesAdministrationsLocalesUpdate } from './processes/titres-etapes-administrations-locales-update.js'
import { titresEtapesOrdreUpdate } from './processes/titres-etapes-ordre-update.js'
import { titresDemarchesDatesUpdate } from './processes/titres-phases-update.js'
import { titresPublicUpdate } from './processes/titres-public-update.js'
import { titresPropsEtapesIdsUpdate } from './processes/titres-props-etapes-ids-update.js'
import { titresStatutIdsUpdate } from './processes/titres-statut-ids-update.js'
import { titresEtapesHeritagePropsUpdate } from './processes/titres-etapes-heritage-props-update.js'
import { titresEtapesHeritageContenuUpdate } from './processes/titres-etapes-heritage-contenu-update.js'
import { titresActivitesPropsUpdate } from './processes/titres-activites-props-update.js'
import { titresSlugsUpdate } from './processes/titres-slugs-update.js'
import { logsUpdate } from './_logs-update.js'
import { userSuper } from '../database/user-super.js'
import { titresActivitesRelanceSend } from './processes/titres-activites-relance-send.js'
import type { Pool } from 'pg'
import { demarchesDefinitionsCheck } from '../tools/demarches/definitions-check.js'
import { titreTypeDemarcheTypeEtapeTypeCheck } from '../tools/demarches/tde-check.js'
import { etapeStatutCheck } from '../tools/demarches/etape-statut-check.js'

export const daily = async (pool: Pool) => {
  try {
    console.info()
    console.info('- - -')
    console.info('mise à jour quotidienne')

    const titresEtapesOrdreUpdated = await titresEtapesOrdreUpdate(pool, userSuper)
    const titresEtapesHeritagePropsUpdated = await titresEtapesHeritagePropsUpdate(userSuper)
    const titresEtapesHeritageContenuUpdated = await titresEtapesHeritageContenuUpdate(pool, userSuper)

    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate(pool)
    const titresDemarchesOrdreUpdated = await titresDemarchesOrdreUpdate()
    const [titresDemarchesDatesUpdated = []] = await titresDemarchesDatesUpdate(pool)
    const titresDemarchesPublicUpdated = await titresDemarchesPublicUpdate()

    const titresStatutIdUpdated = await titresStatutIdsUpdate()
    const titresPublicUpdated = await titresPublicUpdate(pool)
    const { titresEtapesAdministrationsLocalesUpdated } = await titresEtapesAdministrationsLocalesUpdate()
    const titresPropsEtapesIdsUpdated = await titresPropsEtapesIdsUpdate()

    const titresActivitesCreated = await titresActivitesUpdate()
    const titresActivitesRelanceSent = await titresActivitesRelanceSend()
    const titresActivitesStatutIdsUpdated = await titresActivitesStatutIdsUpdate()
    const titresActivitesPropsUpdated = await titresActivitesPropsUpdate()
    const titresUpdatedIndex = await titresSlugsUpdate()

    await demarchesDefinitionsCheck()
    await titreTypeDemarcheTypeEtapeTypeCheck()
    await etapeStatutCheck()

    logsUpdate({
      titresEtapesOrdreUpdated,
      titresEtapesHeritagePropsUpdated,
      titresEtapesHeritageContenuUpdated,
      titresDemarchesStatutUpdated,
      titresDemarchesPublicUpdated,
      titresDemarchesOrdreUpdated,
      titresStatutIdUpdated,
      titresPublicUpdated,
      titresDemarchesDatesUpdated,
      titresEtapesAdministrationsLocalesUpdated: titresEtapesAdministrationsLocalesUpdated.map(({ titreEtapeId }) => titreEtapeId),
      titresPropsEtapesIdsUpdated,
      titresActivitesCreated,
      titresActivitesRelanceSent,
      titresActivitesStatutIdsUpdated,
      titresActivitesPropsUpdated,
      titresUpdatedIndex,
    })
  } catch (e) {
    console.info('erreur:', e)

    throw e
  }
}
