import GraphQLJSON from 'graphql-type-json'

import { titres } from './resolvers/titres'

import { etapeHeritage } from './resolvers/titres-etapes'

import { demarches, demarcheCreer, demarcheModifier } from './resolvers/titres-demarches'

import { utilisateur, utilisateurs } from './resolvers/utilisateurs'

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
  titresTypesTitresStatuts,
  etapesTypesDocumentsTypes,
  titresTypes,
} from './resolvers/metas'

import { activitesTypes, activitesStatuts } from './resolvers/metas-activites'

import { substances } from './resolvers/substances'

import { activites, activiteDeposer } from './resolvers/titres-activites'
import { statistiquesGlobales } from './resolvers/statistiques'

import { titreDemandeCreer } from '../rest/titre-demande'
import { journaux } from './resolvers/journaux'

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
  demarcheCreer,
  demarcheModifier,
  activiteDeposer,
  titreDemandeCreer,
}
