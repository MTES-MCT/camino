import { titresActivitesStatutIdsUpdate } from './processes/titres-activites-statut-ids-update'
import { titresActivitesUpdate } from './processes/titres-activites-update'
import { titresDemarchesOrdreUpdate } from './processes/titres-demarches-ordre-update'
import { titresDemarchesPublicUpdate } from './processes/titres-demarches-public-update'
import { titresDemarchesStatutIdUpdate } from './processes/titres-demarches-statut-ids-update'
import { titresEtapesAdministrationsLocalesUpdate } from './processes/titres-etapes-administrations-locales-update'
import { titresEtapesOrdreUpdate } from './processes/titres-etapes-ordre-update'
import { titresDemarchesDatesUpdate } from './processes/titres-phases-update'
import { titresPublicUpdate } from './processes/titres-public-update'
import { titresPropsEtapesIdsUpdate } from './processes/titres-props-etapes-ids-update'
import { titresStatutIdsUpdate } from './processes/titres-statut-ids-update'
import { titresEtapesHeritagePropsUpdate } from './processes/titres-etapes-heritage-props-update'
import { titresEtapesHeritageContenuUpdate } from './processes/titres-etapes-heritage-contenu-update'
import { titresActivitesPropsUpdate } from './processes/titres-activites-props-update'
import { titresSlugsUpdate } from './processes/titres-slugs-update'
import { logsUpdate } from './_logs-update'
import { userSuper } from '../database/user-super'
import { titresActivitesRelanceSend } from './processes/titres-activites-relance-send'
import type { Pool } from 'pg'
import { demarchesDefinitionsCheck } from '../tools/demarches/definitions-check'
import { titreTypeDemarcheTypeEtapeTypeCheck } from '../tools/demarches/tde-check'
import { titresEtapesStatutUpdate } from './processes/titres-etapes-statut-update'

export const daily = async (pool: Pool): Promise<void> => {
  try {
    console.info()
    console.info('- - -')
    console.info('mise à jour quotidienne')

    const titresEtapesStatusUpdated = await titresEtapesStatutUpdate(pool)
    const titresEtapesOrdreUpdated = await titresEtapesOrdreUpdate(pool, userSuper)
    const titresEtapesHeritagePropsUpdated = await titresEtapesHeritagePropsUpdate(userSuper)
    const titresEtapesHeritageContenuUpdated = await titresEtapesHeritageContenuUpdate(pool, userSuper)

    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate(pool)
    const titresDemarchesOrdreUpdated = await titresDemarchesOrdreUpdate()
    const titresDemarchesDatesUpdated = await titresDemarchesDatesUpdate(pool)
    const titresDemarchesPublicUpdated = await titresDemarchesPublicUpdate()

    const titresStatutIdUpdated = await titresStatutIdsUpdate()
    const titresPublicUpdated = await titresPublicUpdate(pool)
    const { titresEtapesAdministrationsLocalesUpdated } = await titresEtapesAdministrationsLocalesUpdate()
    const titresPropsEtapesIdsUpdated = await titresPropsEtapesIdsUpdate()

    const titresActivitesCreated = await titresActivitesUpdate(pool)
    const titresActivitesRelanceSent = await titresActivitesRelanceSend(pool)
    const titresActivitesStatutIdsUpdated = await titresActivitesStatutIdsUpdate()
    const titresActivitesPropsUpdated = await titresActivitesPropsUpdate()
    const titresUpdatedIndex = await titresSlugsUpdate()

    await demarchesDefinitionsCheck()
    await titreTypeDemarcheTypeEtapeTypeCheck()

    logsUpdate({
      titresEtapesStatusUpdated,
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
