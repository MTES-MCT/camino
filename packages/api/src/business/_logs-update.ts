import { Index, IEntrepriseEtablissement, IEntreprise } from '../types.js'

export const logsUpdate = ({
  titresEtapesOrdreUpdated,
  titresEtapesHeritagePropsUpdated,
  titresEtapesHeritageContenuUpdated,
  titresDemarchesStatutUpdated,
  titresDemarchesPublicUpdated,
  titresDemarchesOrdreUpdated,
  titresStatutIdUpdated,
  titresPublicUpdated,
  titresDemarchesDatesUpdated,
  titresEtapesAdministrationsLocalesUpdated,
  titresPropsEtapesIdsUpdated,
  titresContenusEtapesIdsUpdated,
  titresActivitesCreated,
  titresActivitesRelanceSent,
  titresActivitesStatutIdsUpdated,
  titresActivitesPropsUpdated,
  titresUpdatedIndex,
  entreprisesUpdated,
  etablissementsUpdated,
  etablissementsDeleted,
}: {
  titresEtapesOrdreUpdated?: string[]
  titresEtapesHeritagePropsUpdated?: string[]
  titresEtapesHeritageContenuUpdated?: string[]
  titresDemarchesStatutUpdated?: string[]
  titresDemarchesPublicUpdated?: string[]
  titresDemarchesOrdreUpdated?: string[]
  titresStatutIdUpdated?: string[]
  titresPublicUpdated?: string[]
  titresDemarchesDatesUpdated?: string[]
  titresEtapesAdministrationsLocalesUpdated?: string[]
  titresPropsEtapesIdsUpdated?: string[]
  titresContenusEtapesIdsUpdated?: string[]
  titresActivitesCreated?: string[]
  titresActivitesRelanceSent?: string[]
  titresActivitesStatutIdsUpdated?: string[]
  titresActivitesPropsUpdated?: string[]
  titresUpdatedIndex?: Index<string>
  entreprisesUpdated?: IEntreprise[]
  etablissementsUpdated?: IEntrepriseEtablissement[]
  etablissementsDeleted?: string[]
}) => {
  console.info()
  console.info('-')
  console.info('tâches exécutées:')

  if (titresEtapesOrdreUpdated?.length) {
    console.info(`mise à jour: ${titresEtapesOrdreUpdated.length} étape(s) (ordre)`)
  }

  if (titresEtapesHeritagePropsUpdated?.length) {
    console.info(`mise à jour: ${titresEtapesHeritagePropsUpdated.length} étape(s) (héritage des propriétés)`)
  }

  if (titresEtapesHeritageContenuUpdated?.length) {
    console.info(`mise à jour: ${titresEtapesHeritageContenuUpdated.length} étape(s) (héritage du contenu)`)
  }

  if (titresDemarchesStatutUpdated?.length) {
    console.info(`mise à jour: ${titresDemarchesStatutUpdated.length} démarche(s) (statut)`)
  }

  if (titresDemarchesPublicUpdated?.length) {
    console.info(`mise à jour: ${titresDemarchesPublicUpdated.length} démarche(s) (publicité)`)
  }

  if (titresDemarchesOrdreUpdated?.length) {
    console.info(`mise à jour: ${titresDemarchesOrdreUpdated.length} démarche(s) (ordre)`)
  }

  if (titresStatutIdUpdated?.length) {
    console.info(`mise à jour: ${titresStatutIdUpdated.length} titre(s) (statuts)`)
  }

  if (titresPublicUpdated?.length) {
    console.info(`mise à jour: ${titresPublicUpdated.length} titre(s) (publicité)`)
  }

  if (titresDemarchesDatesUpdated?.length) {
    console.info(`mise à jour: ${titresDemarchesDatesUpdated.length} titre(s) (phases mises à jour)`)
  }

  if (titresEtapesAdministrationsLocalesUpdated?.length) {
    console.info(`mise à jour: ${titresEtapesAdministrationsLocalesUpdated.length} administration(s) locale(s) modifiée(s) dans des étapes`)
  }

  if (titresPropsEtapesIdsUpdated?.length) {
    console.info(`mise à jour: ${titresPropsEtapesIdsUpdated.length} titres(s) (propriétés-étapes)`)
  }

  if (titresContenusEtapesIdsUpdated?.length) {
    console.info(`mise à jour: ${titresContenusEtapesIdsUpdated.length} titres(s) (contenu)`)
  }

  if (titresActivitesCreated?.length) {
    console.info(`mise à jour: ${titresActivitesCreated.length} activité(s) créée(s)`)
  }

  if (titresActivitesRelanceSent?.length) {
    console.info(`mise à jour: ${titresActivitesRelanceSent.length} activité(s) relancée(s)`)
  }

  if (titresActivitesStatutIdsUpdated?.length) {
    console.info(`mise à jour: ${titresActivitesStatutIdsUpdated.length} activité(s) fermée(s)`)
  }

  if (titresActivitesPropsUpdated?.length) {
    console.info(`mise à jour: ${titresActivitesPropsUpdated.length} activité(s) (propriété suppression)`)
  }

  if (titresUpdatedIndex && Object.keys(titresUpdatedIndex).length) {
    console.info(`mise à jour: ${Object.keys(titresUpdatedIndex).length} titre(s) (slugs)`)
  }

  if (entreprisesUpdated?.length) {
    console.info(`mise à jour: ${entreprisesUpdated.length} adresse(s) d'entreprise(s)`)
  }

  if (etablissementsUpdated?.length) {
    console.info(`mise à jour: ${etablissementsUpdated.length} établissement(s) d'entreprise(s)`)
  }

  if (etablissementsDeleted?.length) {
    console.info(`suppression: ${etablissementsDeleted.length} établissement(s) d'entreprise(s)`)
  }
}
