import type { LocationQueryRaw, RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'

// prettier-ignore
const ROUTES = ['dashboard','statsDGTM','titres','titreCreation','titre','demarches','demarche','travaux','etape','etapeCreation','etapeEdition','utilisateurs','utilisateur','entreprises','entreprise','administrations','administration','metas','meta','activites','activite','activiteEdition','statistiques','journaux','statistiquesbetagouv','aPropos','homepage','erreur' ] as const
type CaminoRoute<T extends CaminoRouteNames> = Pick<RouteRecordRaw, 'path' | 'meta'> & { name: T }
export const routesDefinitions = {
  dashboard: {
    path: '/dashboard',
    name: 'dashboard',
    meta: {
      title: 'Tableau de bord',
      menuSection: 'dashboard',
    },
  },
  statsDGTM: {
    path: '/dashboard/dgtmstats',
    name: 'statsDGTM',
    meta: {
      title: 'Statistiques de la DGTM',
      menuSection: 'dashboard',
    },
  },
  titres: {
    path: '/titres',
    name: 'titres',
    meta: {
      title: 'Titres',
      menuSection: 'titres',
    },
  },
  titreCreation: {
    path: '/titres/creation',
    name: 'titreCreation',
    meta: {
      title: "Création d'un titre",
      menuSection: 'titres',
    },
  },
  titre: {
    path: '/titres/:id',
    name: 'titre',
    meta: {
      title: 'Détail du titre',
      menuSection: 'titres',
    },
  },
  demarches: {
    path: '/demarches',
    name: 'demarches',
    meta: {
      title: 'Liste des démarches',
      menuSection: 'demarches',
    },
  },
  demarche: {
    path: '/demarches/:demarcheId',
    name: 'demarche',
  },
  travaux: {
    path: '/travaux',
    name: 'travaux',
    meta: {
      title: 'Liste des travaux',
      menuSection: 'travaux',
    },
  },
  etape: {
    path: '/etapes/:id',
    name: 'etape',
  },
  etapeCreation: {
    path: '/etapes/creation',
    name: 'etapeCreation',
    meta: {
      title: "Création d'une étape",
      menuSection: 'titres',
    },
  },
  etapeEdition: {
    path: '/etapes/:id/edition',
    name: 'etapeEdition',
    meta: {
      title: "Édition d'une étape",
      menuSection: 'titres',
    },
  },
  utilisateurs: {
    path: '/utilisateurs',
    name: 'utilisateurs',
    meta: {
      title: 'Liste des utilisateurs',
      menuSection: 'utilisateurs',
    },
  },
  utilisateur: {
    path: '/utilisateurs/:id',
    name: 'utilisateur',
    meta: {
      title: "Détail d'un utilisateur",
      menuSection: 'utilisateurs',
    },
  },
  entreprises: {
    path: '/entreprises',
    name: 'entreprises',
    meta: {
      title: 'Liste des entreprises',
      menuSection: 'entreprises',
    },
  },
  entreprise: {
    path: '/entreprises/:id',
    name: 'entreprise',
    meta: {
      title: "Détail d'une entreprise",
      menuSection: 'entreprises',
    },
  },
  administrations: {
    path: '/administrations',
    name: 'administrations',
    meta: {
      title: 'Liste des administrations',
      menuSection: 'administrations',
    },
  },
  administration: {
    path: '/administrations/:id',
    name: 'administration',
    meta: {
      title: "Détail d'une administration",
      menuSection: 'administrations',
    },
  },
  metas: {
    path: '/metas',
    name: 'metas',
    meta: {
      title: 'Métas',
      menuSection: 'metas',
    },
  },
  meta: {
    path: '/metas/:id',
    name: 'meta',
    meta: {
      title: "Détail d'une méta",
      menuSection: 'metas',
    },
  },
  activites: {
    path: '/activites',
    name: 'activites',
    meta: {
      title: 'Liste des activités',
      menuSection: 'activites',
    },
  },
  activite: {
    path: '/activites/:activiteId',
    name: 'activite',
    meta: {
      title: "Détail d'une activité",
      menuSection: 'activites',
    },
  },
  activiteEdition: {
    path: '/activites/:activiteId/edition',
    name: 'activiteEdition',
    meta: {
      title: "Édition de l'activité",
      menuSection: 'activites',
    },
  },
  statistiques: {
    path: '/statistiques/:tabId?',
    name: 'statistiques',
    meta: {
      menuSection: null,
      title: 'Statistiques',
    },
  },
  journaux: {
    path: '/journaux',
    name: 'journaux',
    meta: {
      menuSection: 'journaux',
      title: 'Journaux',
    },
  },
  // url /stats : demande de Samuel
  // pour avoir une uniformité entre toutes les start-ups
  statistiquesbetagouv: {
    path: '/stats',
    name: 'statistiquesbetagouv',
  },
  aPropos: {
    path: '/a-propos',
    name: 'aPropos',
    meta: {
      title: 'À propos',
      menuSection: null,
    },
  },
  homepage: {
    path: '/',
    name: 'homepage',
  },
  erreur: {
    path: '/:pathMatch(.*)*',
    name: 'erreur',
    meta: {
      title: 'Erreur',
      menuSection: null,
    },
  },
} as const satisfies { [key in CaminoRouteNames]: CaminoRoute<key> }
export type CaminoRouteNames = (typeof ROUTES)[number]
type RouterParamsNames<url> = url extends `${infer start}/${infer rest}` ? RouterParamsNames<start> & RouterParamsNames<rest> : url extends `:${infer param}` ? { [k in param]: string } : {} // eslint-disable-line @typescript-eslint/ban-types
export type CaminoVueRouter<T extends CaminoRouteNames> = { name: T; params: RouterParamsNames<(typeof routesDefinitions)[T]['path']>; query?: LocationQueryRaw }
export type CaminoRouteLocation = Pick<RouteLocationNormalizedLoaded, 'query' | 'name' | 'params'>
