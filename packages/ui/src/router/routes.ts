import { activitesFiltresNames, CaminoFiltre, entreprisesFiltresNames, titresFiltresNames, utilisateursFiltresNames } from 'camino-common/src/filters'
import type { LocationQueryRaw, RouteRecordRaw } from 'vue-router'
import { RouteMeta } from 'vue-router'
const demarchesFiltres = [
  'titresIds',
  'domainesIds',
  'typesIds',
  'statutsIds',
  'entreprisesIds',
  'substancesIds',
  'references',
  'demarchesTypesIds',
  'demarchesStatutsIds',
  'etapesInclues',
  'etapesExclues',
] as const satisfies readonly CaminoFiltre[]

const travauxFiltres = [
  'titresIds',
  'domainesIds',
  'typesIds',
  'statutsIds',
  'entreprisesIds',
  'substancesIds',
  'references',
  'travauxTypesIds',
  'demarchesStatutsIds',
  'etapesInclues',
  'etapesExclues',
] as const satisfies readonly CaminoFiltre[]
const administrationsFiltres: readonly CaminoFiltre[] = ['nomsAdministration', 'administrationTypesIds'] as const

// prettier-ignore
const ROUTES = ['dashboard','statsDGTM','titres','titreCreation','titre','demarches','demarche','travaux','etape','etapeCreation','etapeEdition','resultatMiseEnConcurrence','utilisateurs','utilisateur','entreprises','entreprise','administrations','administration','activites','activite','activiteEdition','statistiques','journaux','statistiquesbetagouv','aPropos','homepage','erreur' ] as const
type CaminoRoute<T extends CaminoRouteNames> = Pick<RouteRecordRaw, 'path'> & { name: T; meta: RouteMeta }
export const routesDefinitions = {
  dashboard: {
    path: '/dashboard',
    name: 'dashboard',
    meta: {
      title: 'Tableau de bord',
      menuSection: 'dashboard',
      filtres: [],
    },
  },
  statsDGTM: {
    path: '/dashboard/dgtmstats',
    name: 'statsDGTM',
    meta: {
      title: 'Statistiques de la DGTM',
      menuSection: 'dashboard',
      // TODO 2024-10-29 ici on triche pour avoir le full width... trouver mieux ?
      filtres: ['activiteStatutsIds'],
    },
  },
  titres: {
    path: '/titres',
    name: 'titres',
    meta: {
      title: 'Titres',
      menuSection: 'titres',
      filtres: titresFiltresNames,
    },
  },
  titreCreation: {
    path: '/titres/creation',
    name: 'titreCreation',
    meta: {
      title: "Création d'un titre",
      menuSection: 'titres',
      filtres: [],
    },
  },
  titre: {
    path: '/titres/:id',
    name: 'titre',
    meta: {
      title: 'Détail du titre',
      menuSection: 'titres',
      filtres: [],
    },
  },
  demarches: {
    path: '/demarches',
    name: 'demarches',
    meta: {
      title: 'Liste des démarches',
      menuSection: 'demarches',
      filtres: demarchesFiltres,
    },
  },
  demarche: {
    path: '/demarches/:demarcheId',
    name: 'demarche',
    meta: {
      title: 'Détail de la démarche',
      menuSection: 'demarches',
      filtres: [],
    },
  },
  resultatMiseEnConcurrence: {
    path: '/demarches/:demarcheId/resultat-mise-en-concurrence',
    name: 'resultatMiseEnConcurrence',
    meta: {
      title: 'Résultat de la mise en concurrence',
      filtres: [],
      menuSection: null,
    },
  },
  travaux: {
    path: '/travaux',
    name: 'travaux',
    meta: {
      title: 'Liste des travaux',
      menuSection: 'travaux',
      filtres: travauxFiltres,
    },
  },
  etape: {
    path: '/etapes/:id',
    name: 'etape',
    meta: {
      title: "Détail d'une étape",
      filtres: [],
      menuSection: 'titres',
    },
  },
  etapeCreation: {
    path: '/etapes/creation',
    name: 'etapeCreation',
    meta: {
      title: "Création d'une étape",
      menuSection: 'titres',
      filtres: [],
    },
  },
  etapeEdition: {
    path: '/etapes/:id/edition',
    name: 'etapeEdition',
    meta: {
      title: "Édition d'une étape",
      menuSection: 'titres',
      filtres: [],
    },
  },
  utilisateurs: {
    path: '/utilisateurs',
    name: 'utilisateurs',
    meta: {
      title: 'Liste des utilisateurs',
      menuSection: 'utilisateurs',
      filtres: utilisateursFiltresNames,
    },
  },
  utilisateur: {
    path: '/utilisateurs/:id',
    name: 'utilisateur',
    meta: {
      title: "Détail d'un utilisateur",
      menuSection: 'utilisateurs',
      filtres: [],
    },
  },
  entreprises: {
    path: '/entreprises',
    name: 'entreprises',
    meta: {
      title: 'Liste des entreprises',
      menuSection: 'entreprises',
      filtres: entreprisesFiltresNames,
    },
  },
  entreprise: {
    path: '/entreprises/:id',
    name: 'entreprise',
    meta: {
      title: "Détail d'une entreprise",
      menuSection: 'entreprises',
      filtres: [],
    },
  },
  administrations: {
    path: '/administrations',
    name: 'administrations',
    meta: {
      title: 'Liste des administrations',
      menuSection: 'administrations',
      filtres: administrationsFiltres,
    },
  },
  administration: {
    path: '/administrations/:id',
    name: 'administration',
    meta: {
      title: "Détail d'une administration",
      menuSection: 'administrations',
      filtres: [],
    },
  },
  activites: {
    path: '/activites',
    name: 'activites',
    meta: {
      title: 'Liste des activités',
      menuSection: 'activites',
      filtres: activitesFiltresNames,
    },
  },
  activite: {
    path: '/activites/:activiteId',
    name: 'activite',
    meta: {
      title: "Détail d'une activité",
      menuSection: 'activites',
      filtres: [],
    },
  },
  activiteEdition: {
    path: '/activites/:activiteId/edition',
    name: 'activiteEdition',
    meta: {
      title: "Édition de l'activité",
      menuSection: 'activites',
      filtres: [],
    },
  },
  statistiques: {
    path: '/statistiques/:tabId?',
    name: 'statistiques',
    meta: {
      menuSection: null,
      title: 'Statistiques',
      filtres: [],
    },
  },
  journaux: {
    path: '/journaux',
    name: 'journaux',
    meta: {
      menuSection: 'journaux',
      title: 'Journaux',
      filtres: ['titresIds'],
    },
  },
  // url /stats : demande de Samuel
  // pour avoir une uniformité entre toutes les start-ups
  statistiquesbetagouv: {
    path: '/stats',
    name: 'statistiquesbetagouv',
    meta: {
      title: 'Statistiques',
      menuSection: null,
      filtres: [],
    },
  },
  aPropos: {
    path: '/a-propos',
    name: 'aPropos',
    meta: {
      title: 'À propos',
      menuSection: null,
      filtres: [],
    },
  },
  homepage: {
    path: '/',
    name: 'homepage',
    meta: {
      title: 'Page principale',
      filtres: [],
      menuSection: null,
    },
  },
  erreur: {
    path: '/:pathMatch(.*)*',
    name: 'erreur',
    meta: {
      title: 'Erreur',
      menuSection: null,
      filtres: [],
    },
  },
} as const satisfies { [key in CaminoRouteNames]: CaminoRoute<key> }
export type CaminoRouteNames = (typeof ROUTES)[number]
type RouterParamsNames<url> = url extends `${infer start}/${infer rest}`
  ? RouterParamsNames<start> & RouterParamsNames<rest>
  : url extends `:${infer param}?`
    ? { [k in param]?: string }
    : url extends `:${infer param}`
      ? { [k in param]: string }
      : {} // eslint-disable-line
export type CaminoVueRoute<T extends CaminoRouteNames> = { name: T; params: RouterParamsNames<(typeof routesDefinitions)[T]['path']>; query?: LocationQueryRaw }
export type CaminoRouteLocation = Required<CaminoVueRoute<CaminoRouteNames>>
