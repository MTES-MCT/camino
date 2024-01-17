import { titreDemarcheGet } from '../database/queries/titres-demarches.js'
import type { DemarcheId } from 'camino-common/src/demarche.js'
import type { EtapeId } from 'camino-common/src/etape.js'

import { titresActivitesUpdate } from './processes/titres-activites-update.js'
import { titresDemarchesPublicUpdate } from './processes/titres-demarches-public-update.js'
import { titresDemarchesStatutIdUpdate } from './processes/titres-demarches-statut-ids-update.js'
import { titresEtapesHeritagePropsUpdate } from './processes/titres-etapes-heritage-props-update.js'
import { titresEtapesHeritageContenuUpdate } from './processes/titres-etapes-heritage-contenu-update.js'
import { titresDemarchesOrdreUpdate } from './processes/titres-demarches-ordre-update.js'
import { titresEtapesAreasUpdate } from './processes/titres-etapes-areas-update.js'
import { titresEtapesOrdreUpdate } from './processes/titres-etapes-ordre-update.js'
import { titresStatutIdsUpdate } from './processes/titres-statut-ids-update.js'
import { titresDemarchesDatesUpdate } from './processes/titres-phases-update.js'
import { titresEtapesAdministrationsLocalesUpdate } from './processes/titres-etapes-administrations-locales-update.js'
import { titresPropsEtapesIdsUpdate } from './processes/titres-props-etapes-ids-update.js'
import { titresContenusEtapesIdsUpdate } from './processes/titres-contenus-etapes-ids-update.js'
import { titresSlugsUpdate } from './processes/titres-slugs-update.js'
import { titresPublicUpdate } from './processes/titres-public-update.js'
import { logsUpdate } from './_logs-update.js'
import { titresActivitesPropsUpdate } from './processes/titres-activites-props-update.js'
import { userSuper } from '../database/user-super.js'
import { titresEtapesDepotCreate } from './processes/titres-demarches-depot-create.js'
import type { UserNotNull } from 'camino-common/src/roles.js'
import type { Pool } from 'pg'

const titreEtapeUpdate = async (pool: Pool, titreEtapeId: EtapeId | null, titreDemarcheId: DemarcheId, user: UserNotNull) => {
  try {
    console.info()
    console.info('- - -')
    console.info(`mise à jour d'une étape : ${titreEtapeId}`)

    const titreDemarche = await titreDemarcheGet(
      titreDemarcheId,
      {
        fields: {},
      },
      userSuper
    )

    if (!titreDemarche) {
      throw new Error(`la démarche ${titreDemarche} n'existe pas`)
    }

    const titresEtapesOrdreUpdated = await titresEtapesOrdreUpdate(pool, user, titreDemarcheId)

    const titresEtapesHeritagePropsUpdated = await titresEtapesHeritagePropsUpdate(user, [titreDemarcheId])
    const titresEtapesHeritageContenuUpdated = await titresEtapesHeritageContenuUpdate(pool, user, titreDemarcheId)

    const titreId = titreDemarche.titreId
    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate(pool, titreId)
    const titresDemarchesOrdreUpdated = await titresDemarchesOrdreUpdate([titreId])
    const [titresDemarchesDatesUpdated = []] = await titresDemarchesDatesUpdate(pool, [titreId])
    const titresDemarchesPublicUpdated = await titresDemarchesPublicUpdate([titreId])
    const titresStatutIdUpdated = await titresStatutIdsUpdate([titreId])
    const titresPublicUpdated = await titresPublicUpdate([titreId])

    // si l'étape est supprimée, pas de mise à jour
    if (titreEtapeId) {
      await titresEtapesAreasUpdate([titreEtapeId])
    }

    const { titresEtapesAdministrationsLocalesUpdated = [] } = await titresEtapesAdministrationsLocalesUpdate(titreEtapeId ? [titreEtapeId] : undefined)

    const titresPropsEtapesIdsUpdated = await titresPropsEtapesIdsUpdate([titreId])

    const titresContenusEtapesIdsUpdated = await titresContenusEtapesIdsUpdate([titreId])

    const titresActivitesCreated = await titresActivitesUpdate([titreId])
    const titresActivitesPropsUpdated = await titresActivitesPropsUpdate([titreId])

    const titresUpdatedIndex = await titresSlugsUpdate([titreId])

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
      titresContenusEtapesIdsUpdated,
      titresActivitesCreated,
      titresActivitesPropsUpdated,
      titresUpdatedIndex,
    })

    await titresEtapesDepotCreate(pool, titreDemarcheId)
  } catch (e) {
    console.error(`erreur: titreEtapeUpdate ${titreEtapeId}`)
    console.error(e)
    throw e
  }
}

export default titreEtapeUpdate
