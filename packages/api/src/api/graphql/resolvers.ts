import GraphQLJSON from 'graphql-type-json'
import { GraphQLUpload } from 'graphql-upload'

import { titre, titres, titreCreer } from './resolvers/titres.js'

import { etape, etapeHeritage, etapeCreer, etapeModifier, etapeSupprimer, etapeDeposer } from './resolvers/titres-etapes.js'

import { documentCreer, documentModifier, documentSupprimer } from './resolvers/documents.js'

import { demarche, demarches, demarcheCreer, demarcheModifier, demarcheSupprimer } from './resolvers/titres-demarches.js'

import { utilisateur, utilisateurs, newsletterInscrire } from './resolvers/utilisateurs.js'

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
  pays,
} from './resolvers/metas.js'

import { activitesTypes, activitesStatuts } from './resolvers/metas-activites.js'

import { titresTypes, titresTypesTitresStatuts, titresTypesDemarchesTypesEtapesTypes, etapesTypesDocumentsTypes } from './resolvers/metas-join.js'

import { substances } from './resolvers/substances.js'

import { entreprises, entreprisesTitresCreation } from './resolvers/entreprises.js'
import { administration, administrations, administrationActiviteTypeEmailCreer, administrationActiviteTypeEmailSupprimer, administrationActivitesTypesEmails } from './resolvers/administrations.js'
import { activites, activiteSupprimer, activiteDeposer } from './resolvers/titres-activites.js'
import { statistiquesGlobales } from './resolvers/statistiques.js'

import { titreDemandeCreer } from './resolvers/titre-demande.js'
import { pointsImporter, perimetreInformations, titreEtapePerimetreInformations } from './resolvers/points.js'
import { journaux } from './resolvers/journaux.js'

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
  entreprises,
  administration,
  administrations,
  utilisateur,
  utilisateurs,
  statistiquesGlobales,
  activites,
  administrationsTypes,
  administrationActivitesTypesEmails,
  regions,
  departements,
  titresTypesTitresStatuts,
  titresTypesDemarchesTypesEtapesTypes,
  etapesTypesDocumentsTypes,
  activitesTypes,
  activitesStatuts,
  pays,
  pointsImporter,
  perimetreInformations,
  titreEtapePerimetreInformations,
  journaux,

  // mutations
  titreCreer,
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
  activiteSupprimer,
  activiteDeposer,
  newsletterInscrire,
  entreprisesTitresCreation,
  administrationActiviteTypeEmailCreer,
  administrationActiviteTypeEmailSupprimer,
  titreDemandeCreer,
}
