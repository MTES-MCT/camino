import GraphQLJSON from 'graphql-type-json'
import { GraphQLUpload } from 'graphql-upload'

import {
  titre,
  titres,
  titreCreer,
  titreSupprimer,
  titreModifier
} from './resolvers/titres'

import {
  etape,
  etapeHeritage,
  etapeCreer,
  etapeModifier,
  etapeSupprimer,
  etapeDeposer
} from './resolvers/titres-etapes'

import {
  documents,
  documentCreer,
  documentModifier,
  documentSupprimer
} from './resolvers/documents'

import {
  demarche,
  demarches,
  demarcheCreer,
  demarcheModifier,
  demarcheSupprimer
} from './resolvers/titres-demarches'

import {
  utilisateur,
  utilisateurs,
  moi,
  utilisateurConnecter,
  utilisateurDeconnecter,
  utilisateurCerbereConnecter,
  utilisateurCerbereUrlObtenir,
  utilisateurCreer,
  utilisateurCreationMessageEnvoyer,
  utilisateurModifier,
  utilisateurSupprimer,
  utilisateurMotDePasseModifier,
  utilisateurMotDePasseMessageEnvoyer,
  utilisateurMotDePasseInitialiser,
  utilisateurEmailMessageEnvoyer,
  utilisateurEmailModifier,
  newsletterInscrire
} from './resolvers/utilisateurs'

import {
  devises,
  demarchesTypes,
  demarchesStatuts,
  documentsTypes,
  domaines,
  etapesTypes,
  etapesStatuts,
  geoSystemes,
  phasesStatuts,
  referencesTypes,
  statuts,
  types,
  unites,
  version,
  administrationsTypes,
  regions,
  departements,
  pays
} from './resolvers/metas'

import {
  activitesTypes,
  activitesStatuts,
  activitesTypesTitresTypes,
  activitesTypesDocumentsTypes,
  activitesTypesPays
} from './resolvers/metas-activites'

import {
  titresTypes,
  titresTypesTitresStatuts,
  titresTypesDemarchesTypes,
  titresTypesDemarchesTypesEtapesTypes,
  titresTypesDemarchesTypesEtapesTypesDocumentsTypes,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypes,
  etapesTypesDocumentsTypes,
  etapesTypesJustificatifsTypes
} from './resolvers/metas-join'

import { substances } from './resolvers/substances'

import {
  entreprise,
  entreprises,
  entrepriseCreer,
  entrepriseModifier,
  entreprisesTitresCreation
} from './resolvers/entreprises'
import {
  administration,
  administrations,
  administrationTitreTypeTitreStatutModifier,
  administrationTitreTypeEtapeTypeModifier,
  administrationActiviteTypeModifier,
  administrationActiviteTypeEmailCreer,
  administrationActiviteTypeEmailSupprimer,
  administrationActivitesTypesEmails
} from './resolvers/administrations'
import {
  activite,
  activites,
  activiteModifier,
  activiteSupprimer,
  activiteDeposer
} from './resolvers/titres-activites'
import { statistiquesGlobales } from './resolvers/statistiques'
import { statistiquesGuyane } from './resolvers/statistiques-guyane'
import { statistiquesGranulatsMarins } from './resolvers/statistiques-granulats-marins'

import { titreDemandeCreer } from './resolvers/titre-demande'
import {
  pointsImporter,
  perimetreInformations,
  titreEtapePerimetreInformations
} from './resolvers/points'
import { journaux } from './resolvers/journaux'
import { utilisateurTitreAbonner } from './resolvers/utilisateurs-titres'

export default {
  //  types
  Json: GraphQLJSON,
  FileUpload: GraphQLUpload,

  //  queries
  etape,
  etapeHeritage,
  demarche,
  demarches,
  demarchesTypes,
  demarchesStatuts,
  devises,
  documents,
  documentsTypes,
  domaines,
  etapesTypes,
  etapesStatuts,
  geoSystemes,
  phasesStatuts,
  referencesTypes,
  statuts,
  types,
  titresTypes,
  unites,
  version,
  titre,
  titres,
  substances,
  moi,
  entreprise,
  entreprises,
  administration,
  administrations,
  utilisateur,
  utilisateurs,
  statistiquesGlobales,
  statistiquesGuyane,
  statistiquesGranulatsMarins,
  activite,
  activites,
  administrationsTypes,
  administrationActivitesTypesEmails,
  regions,
  departements,
  titresTypesTitresStatuts,
  titresTypesDemarchesTypes,
  titresTypesDemarchesTypesEtapesTypes,
  titresTypesDemarchesTypesEtapesTypesDocumentsTypes,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypes,
  etapesTypesDocumentsTypes,
  etapesTypesJustificatifsTypes,
  activitesTypes,
  activitesStatuts,
  activitesTypesTitresTypes,
  activitesTypesDocumentsTypes,
  activitesTypesPays,
  pays,
  pointsImporter,
  perimetreInformations,
  titreEtapePerimetreInformations,
  journaux,

  // mutations
  titreCreer,
  titreModifier,
  titreSupprimer,
  demarcheCreer,
  demarcheModifier,
  demarcheSupprimer,
  etapeCreer,
  etapeModifier,
  etapeSupprimer,
  etapeDeposer,
  documentCreer,
  documentModifier,
  documentSupprimer,
  activiteModifier,
  activiteSupprimer,
  activiteDeposer,
  utilisateurConnecter,
  utilisateurDeconnecter,
  utilisateurCerbereConnecter,
  utilisateurCerbereUrlObtenir,
  utilisateurModifier,
  utilisateurCreer,
  utilisateurSupprimer,
  utilisateurMotDePasseModifier,
  utilisateurMotDePasseInitialiser,
  utilisateurMotDePasseMessageEnvoyer,
  utilisateurCreationMessageEnvoyer,
  utilisateurEmailMessageEnvoyer,
  utilisateurEmailModifier,
  utilisateurTitreAbonner,
  newsletterInscrire,
  entrepriseCreer,
  entrepriseModifier,
  entreprisesTitresCreation,
  administrationTitreTypeTitreStatutModifier,
  administrationTitreTypeEtapeTypeModifier,
  administrationActiviteTypeModifier,
  administrationActiviteTypeEmailCreer,
  administrationActiviteTypeEmailSupprimer,
  titreDemandeCreer
}
