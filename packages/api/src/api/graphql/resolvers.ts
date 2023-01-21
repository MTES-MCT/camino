import GraphQLJSON from 'graphql-type-json'
import { GraphQLUpload } from 'graphql-upload'

import {
  titre,
  titres,
  titreCreer,
  titreSupprimer,
  titreModifier
} from './resolvers/titres.js'

import {
  etape,
  etapeHeritage,
  etapeCreer,
  etapeModifier,
  etapeSupprimer,
  etapeDeposer
} from './resolvers/titres-etapes.js'

import {
  documents,
  documentCreer,
  documentModifier,
  documentSupprimer
} from './resolvers/documents.js'

import {
  demarche,
  demarches,
  demarcheCreer,
  demarcheModifier,
  demarcheSupprimer
} from './resolvers/titres-demarches.js'

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
} from './resolvers/utilisateurs.js'

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
} from './resolvers/metas.js'

import {
  activitesTypes,
  activitesStatuts,
  activitesTypesTitresTypes,
  activitesTypesDocumentsTypes,
  activitesTypesPays
} from './resolvers/metas-activites.js'

import {
  titresTypes,
  titresTypesTitresStatuts,
  titresTypesDemarchesTypes,
  titresTypesDemarchesTypesEtapesTypes,
  titresTypesDemarchesTypesEtapesTypesDocumentsTypes,
  titresTypesDemarchesTypesEtapesTypesJustificatifsTypes,
  etapesTypesDocumentsTypes,
  etapesTypesJustificatifsTypes
} from './resolvers/metas-join.js'

import { substances } from './resolvers/substances.js'

import {
  entreprise,
  entreprises,
  entrepriseCreer,
  entrepriseModifier,
  entreprisesTitresCreation
} from './resolvers/entreprises.js'
import {
  administration,
  administrations,
  administrationTitreTypeTitreStatutModifier,
  administrationTitreTypeEtapeTypeModifier,
  administrationActiviteTypeModifier,
  administrationActiviteTypeEmailCreer,
  administrationActiviteTypeEmailSupprimer,
  administrationActivitesTypesEmails
} from './resolvers/administrations.js'
import {
  activite,
  activites,
  activiteModifier,
  activiteSupprimer,
  activiteDeposer
} from './resolvers/titres-activites.js'
import { statistiquesGlobales } from './resolvers/statistiques.js'
import { statistiquesGranulatsMarins } from './resolvers/statistiques-granulats-marins.js'

import { titreDemandeCreer } from './resolvers/titre-demande.js'
import {
  pointsImporter,
  perimetreInformations,
  titreEtapePerimetreInformations
} from './resolvers/points.js'
import { journaux } from './resolvers/journaux.js'
import { utilisateurTitreAbonner } from './resolvers/utilisateurs-titres.js'

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
