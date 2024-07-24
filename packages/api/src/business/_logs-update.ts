import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { Index, IEntrepriseEtablissement, IEntreprise } from '../types'

export const logsUpdate = ({
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
  titresEtapesAdministrationsLocalesUpdated,
  titresPropsEtapesIdsUpdated,
  titresActivitesCreated,
  titresActivitesRelanceSent,
  titresActivitesStatutIdsUpdated,
  titresActivitesPropsUpdated,
  titresUpdatedIndex,
  entreprisesUpdated,
  etablissementsUpdated,
  etablissementsDeleted,
}: {
  titresEtapesStatusUpdated?: string[]
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

  if (isNotNullNorUndefinedNorEmpty(titresEtapesStatusUpdated)) {
    console.info(`mise à jour: ${titresEtapesStatusUpdated.length} étape(s) (statut)`)
  }
  if (isNotNullNorUndefinedNorEmpty(titresEtapesOrdreUpdated)) {
    console.info(`mise à jour: ${titresEtapesOrdreUpdated.length} étape(s) (ordre)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresEtapesHeritagePropsUpdated)) {
    console.info(`mise à jour: ${titresEtapesHeritagePropsUpdated.length} étape(s) (héritage des propriétés)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresEtapesHeritageContenuUpdated)) {
    console.info(`mise à jour: ${titresEtapesHeritageContenuUpdated.length} étape(s) (héritage du contenu)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresDemarchesStatutUpdated)) {
    console.info(`mise à jour: ${titresDemarchesStatutUpdated.length} démarche(s) (statut)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresDemarchesPublicUpdated)) {
    console.info(`mise à jour: ${titresDemarchesPublicUpdated.length} démarche(s) (publicité)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresDemarchesOrdreUpdated)) {
    console.info(`mise à jour: ${titresDemarchesOrdreUpdated.length} démarche(s) (ordre)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresStatutIdUpdated)) {
    console.info(`mise à jour: ${titresStatutIdUpdated.length} titre(s) (statuts)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresPublicUpdated)) {
    console.info(`mise à jour: ${titresPublicUpdated.length} titre(s) (publicité)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresDemarchesDatesUpdated)) {
    console.info(`mise à jour: ${titresDemarchesDatesUpdated.length} titre(s) (phases mises à jour)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresEtapesAdministrationsLocalesUpdated)) {
    console.info(`mise à jour: ${titresEtapesAdministrationsLocalesUpdated.length} administration(s) locale(s) modifiée(s) dans des étapes`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresPropsEtapesIdsUpdated)) {
    console.info(`mise à jour: ${titresPropsEtapesIdsUpdated.length} titres(s) (propriétés-étapes)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresActivitesCreated)) {
    console.info(`mise à jour: ${titresActivitesCreated.length} activité(s) créée(s)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresActivitesRelanceSent)) {
    console.info(`mise à jour: ${titresActivitesRelanceSent.length} activité(s) relancée(s)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresActivitesStatutIdsUpdated)) {
    console.info(`mise à jour: ${titresActivitesStatutIdsUpdated.length} activité(s) fermée(s)`)
  }

  if (isNotNullNorUndefinedNorEmpty(titresActivitesPropsUpdated)) {
    console.info(`mise à jour: ${titresActivitesPropsUpdated.length} activité(s) (propriété suppression)`)
  }

  if (isNotNullNorUndefined(titresUpdatedIndex) && Object.keys(titresUpdatedIndex).length) {
    console.info(`mise à jour: ${Object.keys(titresUpdatedIndex).length} titre(s) (slugs)`)
  }

  if (isNotNullNorUndefinedNorEmpty(entreprisesUpdated)) {
    console.info(`mise à jour: ${entreprisesUpdated.length} adresse(s) d'entreprise(s)`)
  }

  if (isNotNullNorUndefinedNorEmpty(etablissementsUpdated)) {
    console.info(`mise à jour: ${etablissementsUpdated.length} établissement(s) d'entreprise(s)`)
  }

  if (isNotNullNorUndefinedNorEmpty(etablissementsDeleted)) {
    console.info(`suppression: ${etablissementsDeleted.length} établissement(s) d'entreprise(s)`)
  }
}
