import { titreGet } from '../database/queries/titres.js'

import { titresDemarchesPublicUpdate } from './processes/titres-demarches-public-update.js'
import { titresActivitesUpdate } from './processes/titres-activites-update.js'
import { titresStatutIdsUpdate } from './processes/titres-statut-ids-update.js'
import { titresPropsEtapesIdsUpdate } from './processes/titres-props-etapes-ids-update.js'
import { titresContenusEtapesIdsUpdate } from './processes/titres-contenus-etapes-ids-update.js'
import { titresPhasesUpdate } from './processes/titres-phases-update.js'
import { titresDatesUpdate } from './processes/titres-dates-update.js'
import { titresDemarchesOrdreUpdate } from './processes/titres-demarches-ordre-update.js'
import { titresPublicUpdate } from './processes/titres-public-update.js'
import { titresSlugsUpdate } from './processes/titres-slugs-update.js'
import { logsUpdate } from './_logs-update.js'
import { titresCoordonneesUpdate } from './processes/titres-coordonnees-update.js'
import { titresActivitesPropsUpdate } from './processes/titres-activites-props-update.js'
import { userSuper } from '../database/user-super.js'

const titreDemarcheUpdate = async (titreDemarcheId: string | null, titreId: string) => {
  try {
    console.info()
    console.info('- - -')
    console.info(`mise à jour d'une démarche : ${titreDemarcheId}`)

    const titre = await titreGet(titreId, { fields: {} }, userSuper)

    if (!titre) {
      throw new Error(`warning: le titre ${titreId} n'existe pas`)
    }

    let titresDemarchesPublicUpdated

    // si c'est une création ou modification
    // pas une suppression
    if (titreDemarcheId) {
      titresDemarchesPublicUpdated = await titresDemarchesPublicUpdate([titreId])
    }

    const titresDemarchesOrdreUpdated = await titresDemarchesOrdreUpdate([titreId])
    const titresStatutIdUpdated = await titresStatutIdsUpdate([titreId])
    const titresPublicUpdated = await titresPublicUpdate([titreId])
    const [titresPhasesUpdated = [], titresPhasesDeleted = []] = await titresPhasesUpdate([titreId])
    const titresDatesUpdated = await titresDatesUpdate([titreId])
    const titresPropsEtapesIdsUpdated = await titresPropsEtapesIdsUpdate([titreId])
    const titresContenusEtapesIdsUpdated = await titresContenusEtapesIdsUpdate([titreId])
    const titresCoordonneesUpdated = await titresCoordonneesUpdate([titreId])
    const titresActivitesCreated = await titresActivitesUpdate([titreId])
    const titresActivitesPropsUpdated = await titresActivitesPropsUpdate([titreId])

    const titresUpdatedIndex = await titresSlugsUpdate([titreId])

    logsUpdate({
      titresDemarchesPublicUpdated,
      titresDemarchesOrdreUpdated,
      titresStatutIdUpdated,
      titresPublicUpdated,
      titresPhasesUpdated,
      titresPhasesDeleted,
      titresDatesUpdated,
      titresPropsEtapesIdsUpdated,
      titresContenusEtapesIdsUpdated,
      titresCoordonneesUpdated,
      titresActivitesCreated,
      titresActivitesPropsUpdated,
      titresUpdatedIndex,
    })
  } catch (e) {
    console.error(`erreur: titreDemarcheUpdate ${titreId}`)
    console.error(e)
    throw e
  }
}

export default titreDemarcheUpdate
