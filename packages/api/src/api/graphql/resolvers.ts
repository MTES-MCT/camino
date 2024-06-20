import GraphQLJSON from 'graphql-type-json'

import { titres, titreCreer } from './resolvers/titres.js'

import { etapeHeritage } from './resolvers/titres-etapes.js'

import { demarches, demarcheCreer, demarcheModifier, demarcheSupprimer } from './resolvers/titres-demarches.js'

import { utilisateur, utilisateurs, newsletterInscrire } from './resolvers/utilisateurs.js'

import {
  devises,
  demarchesTypes,
  demarchesStatuts,
  documentsTypes,
  domaines,
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

import { titresTypes, titresTypesTitresStatuts, etapesTypesDocumentsTypes } from './resolvers/metas-join.js'

import { substances } from './resolvers/substances.js'

import { activites, activiteDeposer } from './resolvers/titres-activites.js'
import { statistiquesGlobales } from './resolvers/statistiques.js'

import { titreDemandeCreer } from '../rest/titre-demande.js'
import { journaux } from './resolvers/journaux.js'

export default {
  //  types
  Json: GraphQLJSON,

  //  queries
  etapeHeritage,
  demarches,
  demarchesTypes,
  demarchesStatuts,
  devises,
  documentsTypes,
  domaines,
  etapesStatuts,
  geoSystemes,
  phasesStatuts,
  referencesTypes,
  statuts,
  types,
  titresTypes,
  unites,
  version,
  titres,
  substances,
  utilisateur,
  utilisateurs,
  statistiquesGlobales,
  activites,
  administrationsTypes,
  regions,
  departements,
  titresTypesTitresStatuts,
  etapesTypesDocumentsTypes,
  activitesTypes,
  activitesStatuts,
  pays,
  journaux,

  // mutations
  titreCreer,
  demarcheCreer,
  demarcheModifier,
  demarcheSupprimer,
  activiteDeposer,
  newsletterInscrire,
  titreDemandeCreer,
}
