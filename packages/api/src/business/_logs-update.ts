import {
  Index,
  IArea,
  ITitreAdministrationLocale,
  IEntrepriseEtablissement,
  IEntreprise
} from '../types'

const logsUpdate = ({
  titresEtapesOrdreUpdated,
  titresEtapesHeritagePropsUpdated,
  titresEtapesHeritageContenuUpdated,
  titresDemarchesStatutUpdated,
  titresDemarchesPublicUpdated,
  titresDemarchesOrdreUpdated,
  titresStatutIdUpdated,
  titresPublicUpdated,
  titresPhasesUpdated,
  titresPhasesDeleted,
  titresDatesUpdated,
  pointsReferencesCreated,
  communesUpdated,
  titresEtapesCommunesUpdated,
  titresEtapesCommunesDeleted,
  foretsUpdated,
  titresEtapesForetsUpdated,
  titresEtapesForetsDeleted,
  sdomZonesUpdated,
  titresEtapesSDOMZonesUpdated,
  titresEtapesSDOMZonesDeleted,
  titresAdministrationsGestionnairesCreated,
  titresAdministrationsGestionnairesDeleted,
  titresEtapesAdministrationsLocalesCreated,
  titresEtapesAdministrationsLocalesDeleted,
  titresPropsEtapesIdsUpdated,
  titresContenusEtapesIdsUpdated,
  titresCoordonneesUpdated,
  titresActivitesCreated,
  titresActivitesRelanceSent,
  titresActivitesStatutIdsUpdated,
  titresActivitesPropsUpdated,
  titresUpdatedIndex,
  entreprisesUpdated,
  etablissementsUpdated,
  etablissementsDeleted,
  utilisateursUpdated
}: {
  titresEtapesOrdreUpdated?: string[]
  titresEtapesHeritagePropsUpdated?: string[]
  titresEtapesHeritageContenuUpdated?: string[]
  titresDemarchesStatutUpdated?: string[]
  titresDemarchesPublicUpdated?: string[]
  titresDemarchesOrdreUpdated?: string[]
  titresStatutIdUpdated?: string[]
  titresPublicUpdated?: string[]
  titresPhasesUpdated?: string[]
  titresPhasesDeleted?: string[]
  titresDatesUpdated?: string[]
  pointsReferencesCreated?: string[]
  communesUpdated?: IArea[]
  titresEtapesCommunesUpdated?: string[]
  titresEtapesCommunesDeleted?: string[]
  foretsUpdated?: IArea[]
  titresEtapesForetsUpdated?: string[]
  titresEtapesForetsDeleted?: string[]
  sdomZonesUpdated?: IArea[]
  titresEtapesSDOMZonesUpdated?: string[]
  titresEtapesSDOMZonesDeleted?: string[]
  titresAdministrationsGestionnairesCreated?: string[]
  titresAdministrationsGestionnairesDeleted?: string[]
  titresEtapesAdministrationsLocalesCreated?: ITitreAdministrationLocale[]
  titresEtapesAdministrationsLocalesDeleted?: ITitreAdministrationLocale[]
  titresPropsEtapesIdsUpdated?: string[]
  titresContenusEtapesIdsUpdated?: string[]
  titresCoordonneesUpdated?: string[]
  titresActivitesCreated?: string[]
  titresActivitesRelanceSent?: string[]
  titresActivitesStatutIdsUpdated?: string[]
  titresActivitesPropsUpdated?: string[]
  titresUpdatedIndex?: Index<string>
  entreprisesUpdated?: IEntreprise[]
  etablissementsUpdated?: IEntrepriseEtablissement[]
  etablissementsDeleted?: string[]
  utilisateursUpdated?: string[]
}) => {
  console.info()
  console.info('-')
  console.info('t??ches ex??cut??es:')

  if (titresEtapesOrdreUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesOrdreUpdated.length} ??tape(s) (ordre)`
    )
  }

  if (titresEtapesHeritagePropsUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesHeritagePropsUpdated.length} ??tape(s) (h??ritage des propri??t??s)`
    )
  }

  if (titresEtapesHeritageContenuUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesHeritageContenuUpdated.length} ??tape(s) (h??ritage du contenu)`
    )
  }

  if (titresDemarchesStatutUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresDemarchesStatutUpdated.length} d??marche(s) (statut)`
    )
  }

  if (titresDemarchesPublicUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresDemarchesPublicUpdated.length} d??marche(s) (publicit??)`
    )
  }

  if (titresDemarchesOrdreUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresDemarchesOrdreUpdated.length} d??marche(s) (ordre)`
    )
  }

  if (titresStatutIdUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresStatutIdUpdated.length} titre(s) (statuts)`
    )
  }

  if (titresPublicUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresPublicUpdated.length} titre(s) (publicit??)`
    )
  }

  if (titresPhasesUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresPhasesUpdated.length} titre(s) (phases mises ?? jour)`
    )
  }

  if (titresPhasesDeleted?.length) {
    console.info(
      `mise ?? jour: ${titresPhasesDeleted.length} titre(s) (phases supprim??es)`
    )
  }

  if (titresDatesUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresDatesUpdated.length} titre(s) (propri??t??s-dates)`
    )
  }

  if (pointsReferencesCreated?.length) {
    console.info(
      `cr??ation: ${pointsReferencesCreated.length} r??f??rence(s) de points`
    )
  }

  if (communesUpdated?.length) {
    console.info(`mise ?? jour: ${communesUpdated.length} commune(s)`)
  }

  if (titresEtapesCommunesUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesCommunesUpdated.length} commune(s) mise(s) ?? jour dans des ??tapes`
    )
  }

  if (titresEtapesCommunesDeleted?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesCommunesDeleted.length} commune(s) supprim??e(s) dans des ??tapes`
    )
  }

  if (foretsUpdated?.length) {
    console.info(`mise ?? jour: ${foretsUpdated.length} foret(s)`)
  }

  if (titresEtapesForetsUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesForetsUpdated.length} foret(s) mise(s) ?? jour dans des ??tapes`
    )
  }

  if (titresEtapesForetsDeleted?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesForetsDeleted.length} foret(s) supprim??e(s) dans des ??tapes`
    )
  }

  if (sdomZonesUpdated?.length) {
    console.info(`mise ?? jour: ${sdomZonesUpdated.length} zone(s) du SDOM`)
  }

  if (titresEtapesSDOMZonesUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesSDOMZonesUpdated.length} zone(s) du SDOM mise(s) ?? jour dans des ??tapes`
    )
  }

  if (titresEtapesSDOMZonesDeleted?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesSDOMZonesDeleted.length} zone(s) du SDOM supprim??e(s) dans des ??tapes`
    )
  }

  if (titresAdministrationsGestionnairesCreated?.length) {
    console.info(
      `mise ?? jour: ${titresAdministrationsGestionnairesCreated.length} administration(s) gestionnaire(s) ajout??e(s) dans des titres`
    )
  }

  if (titresAdministrationsGestionnairesDeleted?.length) {
    console.info(
      `mise ?? jour: ${titresAdministrationsGestionnairesDeleted.length} administration(s) gestionnaire(s) supprim??e(s) dans des titres`
    )
  }

  if (titresEtapesAdministrationsLocalesCreated?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesAdministrationsLocalesCreated.length} administration(s) locale(s) ajout??e(s) dans des ??tapes`
    )
  }

  if (titresEtapesAdministrationsLocalesDeleted?.length) {
    console.info(
      `mise ?? jour: ${titresEtapesAdministrationsLocalesDeleted.length} administration(s) locale(s) supprim??e(s) dans des ??tapes`
    )
  }

  if (titresPropsEtapesIdsUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresPropsEtapesIdsUpdated.length} titres(s) (propri??t??s-??tapes)`
    )
  }

  if (titresContenusEtapesIdsUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresContenusEtapesIdsUpdated.length} titres(s) (contenu)`
    )
  }

  if (titresCoordonneesUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresCoordonneesUpdated.length} titres(s) (coordonn??es)`
    )
  }

  if (titresActivitesCreated?.length) {
    console.info(
      `mise ?? jour: ${titresActivitesCreated.length} activit??(s) cr????e(s)`
    )
  }

  if (titresActivitesRelanceSent?.length) {
    console.info(
      `mise ?? jour: ${titresActivitesRelanceSent.length} activit??(s) relanc??e(s)`
    )
  }

  if (titresActivitesStatutIdsUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresActivitesStatutIdsUpdated.length} activit??(s) ferm??e(s)`
    )
  }

  if (titresActivitesPropsUpdated?.length) {
    console.info(
      `mise ?? jour: ${titresActivitesPropsUpdated.length} activit??(s) (propri??t?? suppression)`
    )
  }

  if (titresUpdatedIndex && Object.keys(titresUpdatedIndex).length) {
    console.info(
      `mise ?? jour: ${Object.keys(titresUpdatedIndex).length} titre(s) (slugs)`
    )
  }

  if (entreprisesUpdated?.length) {
    console.info(
      `mise ?? jour: ${entreprisesUpdated.length} adresse(s) d'entreprise(s)`
    )
  }

  if (etablissementsUpdated?.length) {
    console.info(
      `mise ?? jour: ${etablissementsUpdated.length} ??tablissement(s) d'entreprise(s)`
    )
  }

  if (etablissementsDeleted?.length) {
    console.info(
      `suppression: ${etablissementsDeleted.length} ??tablissement(s) d'entreprise(s)`
    )
  }

  if (utilisateursUpdated?.length) {
    console.info(
      `mise ?? jour: ${utilisateursUpdated.length} utilisateurs(s) inscrits ?? la newsletter`
    )
  }
}

export { logsUpdate }
