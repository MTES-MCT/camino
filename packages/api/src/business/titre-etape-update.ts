import { titreDemarcheGet } from '../database/queries/titres-demarches'
import type { DemarcheId } from 'camino-common/src/demarche'
import type { EtapeId } from 'camino-common/src/etape'

import { titresActivitesUpdate } from './processes/titres-activites-update'
import { titresDemarchesPublicUpdate } from './processes/titres-demarches-public-update'
import { titresDemarchesStatutIdUpdate } from './processes/titres-demarches-statut-ids-update'
import { titresEtapesHeritagePropsUpdate } from './processes/titres-etapes-heritage-props-update'
import { titresEtapesHeritageContenuUpdate } from './processes/titres-etapes-heritage-contenu-update'
import { titresDemarchesOrdreUpdate } from './processes/titres-demarches-ordre-update'
import { titresEtapesAreasUpdate } from './processes/titres-etapes-areas-update'
import { titresEtapesOrdreUpdate } from './processes/titres-etapes-ordre-update'
import { titresStatutIdsUpdate } from './processes/titres-statut-ids-update'
import { titresDemarchesDatesUpdate } from './processes/titres-phases-update'
import { titresEtapesAdministrationsLocalesUpdate } from './processes/titres-etapes-administrations-locales-update'
import { titresPropsEtapesIdsUpdate } from './processes/titres-props-etapes-ids-update'
import { titresSlugsUpdate } from './processes/titres-slugs-update'
import { titresPublicUpdate } from './processes/titres-public-update'
import { logsUpdate } from './_logs-update'
import { titresActivitesPropsUpdate } from './processes/titres-activites-props-update'
import { userSuper } from '../database/user-super'
import { titresEtapesDepotCreate } from './processes/titres-demarches-depot-create'
import type { UserNotNull } from 'camino-common/src/roles'
import type { Pool } from 'pg'

export const titreEtapeUpdateTask = async (pool: Pool, titreEtapeId: EtapeId | null, titreDemarcheId: DemarcheId, user: UserNotNull) => {
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
    const titresPublicUpdated = await titresPublicUpdate(pool, [titreId])

    // si l'étape est supprimée, pas de mise à jour
    if (titreEtapeId) {
      await titresEtapesAreasUpdate(pool, [titreEtapeId])
    }

    const { titresEtapesAdministrationsLocalesUpdated = [] } = await titresEtapesAdministrationsLocalesUpdate(titreEtapeId ? [titreEtapeId] : undefined)

    const titresPropsEtapesIdsUpdated = await titresPropsEtapesIdsUpdate([titreId])

    const titresActivitesCreated = await titresActivitesUpdate(pool, [titreId])
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
