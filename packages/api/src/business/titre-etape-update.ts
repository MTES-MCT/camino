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
import { titresActivitesPropsUpdate } from './processes/titres-activites-props-update'
import { userSuper } from '../database/user-super'
import type { UserNotNull } from 'camino-common/src/roles'
import type { Pool } from 'pg'
import { callAndExit } from '../tools/fp-tools'
import { etapeMiseEnConcurrenceUpdate } from './processes/titres-etapes-mise-en-concurrence'
import { etapesFondamentaleIdUpdate } from './processes/titres-etapes-fondamentale-id-update'
import { etapeConsentementUpdate } from './processes/titres-etapes-consentement'

export const titreEtapeUpdateTask = async (pool: Pool, titreEtapeId: EtapeId | null, titreDemarcheId: DemarcheId, user: UserNotNull): Promise<void> => {
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

    if (titreEtapeId) {
      await callAndExit(etapeMiseEnConcurrenceUpdate(pool, titreEtapeId))
      await callAndExit(etapeConsentementUpdate(pool, titreEtapeId))
    }

    await titresEtapesOrdreUpdate(pool, user, titreDemarcheId)
    await callAndExit(etapesFondamentaleIdUpdate(pool, titreDemarcheId))

    await titresEtapesHeritagePropsUpdate(user, [titreDemarcheId])
    await titresEtapesHeritageContenuUpdate(pool, user, titreDemarcheId)

    const titreId = titreDemarche.titreId
    await titresDemarchesStatutIdUpdate(pool, titreId)
    await titresDemarchesOrdreUpdate([titreId])
    await titresDemarchesDatesUpdate(pool, [titreId])
    await titresDemarchesPublicUpdate([titreId])
    await titresStatutIdsUpdate([titreId])
    await titresPublicUpdate(pool, [titreId])

    // si l'étape est supprimée, pas de mise à jour
    if (titreEtapeId) {
      await titresEtapesAreasUpdate(pool, [titreEtapeId])
    }

    await titresEtapesAdministrationsLocalesUpdate(titreEtapeId ? [titreEtapeId] : undefined)

    await titresPropsEtapesIdsUpdate([titreId])
    await titresActivitesUpdate(pool, [titreId])
    await titresActivitesPropsUpdate([titreId])
    await titresSlugsUpdate([titreId])
  } catch (e) {
    console.error(`erreur: titreEtapeUpdate ${titreEtapeId}`)
    console.error(e)
    throw e
  }
}
