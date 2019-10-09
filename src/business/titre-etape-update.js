import 'dotenv/config'
import '../database/index'

import { activitesTypesGet } from '../database/queries/metas'
import { titreGet } from '../database/queries/titres'
import { titreDemarcheGet } from '../database/queries/titres-demarches'
import { titreEtapeGet } from '../database/queries/titres-etapes'
import { communesGet } from '../database/queries/territoires'
import { administrationsGet } from '../database/queries/administrations'

import titresActivitesUpdate from './processes/titres-activites-update'
import titresDatesUpdate from './processes/titres-dates-update'
import titresDemarchesStatutIdUpdate from './processes/titres-demarches-statut-ids-update'
import titresDemarchesOrdreUpdate from './processes/titres-demarches-ordre-update'
import titresEtapeCommunesUpdate from './processes/titres-etapes-communes-update'
import titresEtapesOrdreUpdate from './processes/titres-etapes-ordre-update'
import titresStatutIdsUpdate from './processes/titres-statut-ids-update'
import titresPhasesUpdate from './processes/titres-phases-update'
import titresPropsActivitesUpdate from './processes/titres-props-activites-update'
import titresEtapesAdministrationsUpdate from './processes/titres-etapes-administrations-update'
import titresPropsEtapeIdUpdate from './processes/titres-props-etape-id-update'
import { titreIdsUpdate } from './processes/titres-ids-update'

import { titreActivitesRowUpdate } from '../tools/export/titre-activites'

const titreEtapeUpdate = async (titreEtapeId, titreDemarcheId) => {
  // 1.
  console.log('ordre des étapes…')
  let titreDemarche = await titreDemarcheGet(titreDemarcheId, {
    eager: 'etapes'
  })
  const titresEtapesOrdreUpdated = await titresEtapesOrdreUpdate([
    titreDemarche
  ])

  // 2.
  console.log('statut des démarches…')
  titreDemarche = await titreDemarcheGet(titreDemarcheId, {
    eager: 'etapes'
  })
  let { titreId } = titreDemarche
  let titre = await titreGet(titreId, {
    eager: 'demarches.[etapes]'
  })
  const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate([
    titre
  ])

  // 3.
  console.log('ordre des démarches…')
  titre = await titreGet(titreId, { eager: 'demarches.[etapes]' })
  const titresDemarchesOrdreUpdated = await titresDemarchesOrdreUpdate([titre])

  // 4.
  console.log('statut des titres…')
  titre = await titreGet(titreId, {
    eager: 'demarches.[etapes.[points]]'
  })
  const titresStatutIdUpdated = await titresStatutIdsUpdate([titre])

  // 5.
  console.log('phases des titres…')
  titre = await titreGet(titreId, {
    eager: 'demarches.[phase,etapes.[points]]'
  })
  const titresPhasesUpdated = await titresPhasesUpdate([titre])

  // 6.
  console.log('date de début, de fin et de demande initiale des titres…')
  titre = await titreGet(titreId, {
    eager: 'demarches.[etapes.[points]]'
  })
  const titresDatesUpdated = await titresDatesUpdate([titre])

  // 8.
  console.log('communes associées aux étapes…')
  let titreCommunesUpdated = []
  let titresEtapesCommunesCreated = []
  let titresEtapesCommunesDeleted = []
  // si l'étape est supprimée, pas de mise à jour
  if (titreEtapeId) {
    const titreEtape = await titreEtapeGet(titreEtapeId, {
      eager: '[points(orderAsc), communes]'
    })
    const communes = await communesGet()
    const result = await titresEtapeCommunesUpdate([titreEtape], communes)
    titreCommunesUpdated = result[0]
    titresEtapesCommunesCreated = result[1]
    titresEtapesCommunesDeleted = result[2]
  }

  // 9.
  console.log('administrations associées aux étapes…')
  titre = await titreGet(titreId, {
    eager: 'demarches.etapes.[administrations,communes.[departement]]'
  })
  const administrations = await administrationsGet()
  const [
    titresEtapesAdministrationsCreated = [],
    titresEtapesAdministrationsDeleted = []
  ] = await titresEtapesAdministrationsUpdate([titre], administrations)

  // 10.
  console.log('propriétés des titres (liens vers les étapes)…')
  titre = await titreGet(titreId, {
    eager:
      'demarches.[etapes.[points, titulaires, amodiataires, administrations, substances, communes]]'
  })
  const titresPropsEtapeIdUpdated = await titresPropsEtapeIdUpdate([titre])

  // 11.
  // pour les année 2018 et 2019 (en dur)
  console.log()
  console.log('activités des titres…')
  const annees = [2018, 2019]
  titre = await titreGet(titreId, { eager: 'demarches.[phase]' })
  const activitesTypes = await activitesTypesGet()
  let titresActivitesCreated = await titresActivitesUpdate(
    [titre],
    activitesTypes,
    annees
  )

  // 12.
  console.log()
  console.log('propriétés des titres (activités abs, enc et dep)…')
  titre = await titreGet(titreId, { eager: 'activites' })
  const titresPropsActivitesUpdated = await titresPropsActivitesUpdate([titre])

  // 13.
  console.log('ids de titres, démarches, étapes et sous-éléments…')
  titre = await titreGet(titreId, {})
  const titreUpdated = await titreIdsUpdate(titre)
  let titresUpdatedIdsIndex
  if (titreUpdated && titre.id !== titreUpdated.id) {
    titresActivitesCreated = titreUpdated.activites
    titreId = titreUpdated.id
    titresUpdatedIdsIndex = {
      [titreId]: titre.id
    }
  }

  console.log(
    `mise à jour: ${titresEtapesOrdreUpdated.length} étape(s) (ordre)`
  )
  console.log(
    `mise à jour: ${titresDemarchesStatutUpdated.length} démarche(s) (statut)`
  )
  console.log(
    `mise à jour: ${titresDemarchesOrdreUpdated.length} démarche(s) (ordre)`
  )
  console.log(`mise à jour: ${titresStatutIdUpdated.length} titre(s) (statuts)`)
  console.log(`mise à jour: ${titresPhasesUpdated.length} titre(s) (phases)`)
  console.log(
    `mise à jour: ${titresDatesUpdated.length} titre(s) (propriétés-dates)`
  )
  console.log(`mise à jour: ${titreCommunesUpdated.length} commune(s)`)
  console.log(
    `mise à jour: ${titresEtapesCommunesCreated.length} commune(s) ajoutée(s) dans des étapes`
  )
  console.log(
    `mise à jour: ${titresEtapesCommunesDeleted.length} commune(s) supprimée(s) dans des étapes`
  )
  console.log(
    `mise à jour: ${titresEtapesAdministrationsCreated.length} administration(s) ajoutée(s) dans des étapes`
  )
  console.log(
    `mise à jour: ${titresEtapesAdministrationsDeleted.length} administration(s) supprimée(s) dans des étapes`
  )
  console.log(
    `mise à jour: ${titresPropsEtapeIdUpdated.length} titres(s) (propriétés-étapes)`
  )
  console.log(`mise à jour: ${titresActivitesCreated.length} activités`)
  console.log(
    `mise à jour: ${titresPropsActivitesUpdated.length} titre(s) (propriétés-activités)`
  )
  console.log(`mise à jour: ${titreUpdated ? '1' : '0'} titre(s) (ids)`)

  if (titresActivitesCreated.length) {
    // export des activités vers la spreadsheet camino-db-titres-activites-prod
    console.log('export des activités…')
    await titreActivitesRowUpdate(titresActivitesCreated, titresUpdatedIdsIndex)
  }

  // on récupère le titre bien formaté
  return titreGet(titreId)
}

export default titreEtapeUpdate
