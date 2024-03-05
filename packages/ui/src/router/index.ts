import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import store from '../store'

import { Dashboard } from '../components/dashboard'
import { DGTMStatsFull } from '../components/dashboard/dgtm-stats-full'
import { Titres } from '../components/titres'
import EtapeEdition from '../components/etape-edition.vue'

const TitreCreation = async () => {
  const { TitreCreation } = await import('../components/titre-creation')
  return TitreCreation
}

const Activite = async () => {
  const { Activite } = await import('../components/activite')
  return Activite
}

const ActiviteEdition = async () => {
  const { ActiviteEdition } = await import('../components/activite-edition')
  return ActiviteEdition
}
const Activites = async () => {
  const { Activites } = await import('../components/activites')
  return Activites
}
const Demarches = async () => {
  const { Demarches } = await import('../components/demarches')
  return Demarches
}
const Demarche = async () => {
  const { Demarche } = await import('../components/demarche')
  return Demarche
}
const Travaux = async () => {
  const { Travaux } = await import('../components/travaux')
  return Travaux
}

const Titre = async () => {
  const { Titre } = await import('../components/titre')
  return Titre
}

const Utilisateur = async () => {
  const { Utilisateur } = await import('../components/utilisateur')
  return Utilisateur
}
const Utilisateurs = async () => {
  const { Utilisateurs } = await import('../components/utilisateurs')
  return Utilisateurs
}
const Entreprise = async () => {
  const { Entreprise } = await import('../components/entreprise')
  return Entreprise
}
const Entreprises = async () => {
  const { Entreprises } = await import('../components/entreprises')
  return Entreprises
}
const Administration = async () => {
  const { Administration } = await import('../components/administration')
  return Administration
}
const Administrations = async () => {
  const { Administrations } = await import('../components/administrations')
  return Administrations
}
const Meta = async () => {
  const { Meta } = await import('../components/meta')
  return Meta
}

const MetaTitre = async () => {
  const { MetaTitre } = await import('../components/meta-titre')
  return MetaTitre
}
const MetaDemarche = async () => {
  const { MetaDemarche } = await import('../components/meta-demarche')
  return MetaDemarche
}
const MetaEtape = async () => {
  const { MetaEtape } = await import('../components/meta-etape')
  return MetaEtape
}
const MetaActivite = async () => {
  const { MetaActivite } = await import('../components/meta-activite')
  return MetaActivite
}
const Metas = async () => {
  const { Metas } = await import('../components/metas')
  return Metas
}
const CaminoError = async () => {
  const { CaminoError } = await import('../components/error')
  return CaminoError
}
const StatistiquesGlobales = async () => {
  const { Globales } = await import('../components/statistiques/globales')
  return Globales
}
const Statistiques = async () => {
  const { Statistiques } = await import('../components/statistiques')
  return Statistiques
}
const StatsGuyane = async () => {
  const { Guyane } = await import('../components/statistiques/guyane')
  return Guyane
}
const StatistiquesGranulatsMarins = async () => {
  const { GranulatsMarins } = await import('../components/statistiques/granulats-marins')
  return GranulatsMarins
}
const StatistiquesMinerauxMetauxMetropole = async () => {
  const { MinerauxMetauxMetropole } = await import('../components/statistiques/mineraux-metaux-metropole')
  return MinerauxMetauxMetropole
}
const Journaux = async () => {
  const { Journaux } = await import('../components/journaux')
  return Journaux
}

const About = async () => {
  const { About } = await import('../components/content/about')
  return About
}

export type MenuSection = 'dashboard' | 'titres' | 'demarches' | 'travaux' | 'activites' | 'administrations' | 'entreprises' | 'utilisateurs' | 'metas' | 'statistiques' | 'journaux'

declare module 'vue-router' {
  interface RouteMeta {
    menuSection: MenuSection | null
    title: string
  }
}

const routes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      title: 'Tableau de bord',
      menuSection: 'dashboard',
    },
  },
  {
    path: '/dashboard/dgtmstats',
    name: 'Stats DGTM',
    component: DGTMStatsFull,
    meta: {
      title: 'Statistiques de la DGTM',
      menuSection: 'dashboard',
    },
  },
  {
    path: '/titres',
    name: 'titres',
    component: Titres,
    meta: {
      title: 'Titres',
      menuSection: 'titres',
    },
  },
  {
    path: '/titres/creation',
    name: 'titre-creation',
    component: TitreCreation,
    meta: {
      title: "Création d'un titre",
      menuSection: 'titres',
    },
  },
  {
    path: '/titres/:id',
    name: 'titre',
    component: Titre,
    meta: {
      title: 'Détail du titre',
      menuSection: 'titres',
    },
  },
  {
    path: '/demarches',
    name: 'demarches',
    component: Demarches,
    meta: {
      title: 'Liste des démarches',
      menuSection: 'demarches',
    },
  },
  {
    path: '/demarches/:demarcheId',
    name: 'demarche',
    component: Demarche,
  },
  {
    path: '/travaux',
    name: 'travaux',
    component: Travaux,
    meta: {
      title: 'Liste des travaux',
      menuSection: 'travaux',
    },
  },
  {
    path: '/etapes/:id',
    name: 'etape',
    redirect: to => {
      return { name: 'etape-edition', params: { id: to.params.id } }
    },
  },
  {
    path: '/etapes/creation',
    name: 'etape-creation',
    component: EtapeEdition,
    meta: {
      title: "Création d'une étape",
      menuSection: 'titres',
    },
  },
  {
    path: '/etapes/:id/edition',
    name: 'etape-edition',
    component: EtapeEdition,
    meta: {
      title: "Édition d'une étape",
      menuSection: 'titres',
    },
  },
  {
    path: '/utilisateurs',
    name: 'utilisateurs',
    component: Utilisateurs,
    meta: {
      title: 'Liste des utilisateurs',
      menuSection: 'utilisateurs',
    },
  },
  {
    path: '/utilisateurs/:id',
    name: 'utilisateur',
    component: Utilisateur,
    meta: {
      title: "Détail d'un utilisateur",
      menuSection: 'utilisateurs',
    },
  },
  {
    path: '/entreprises',
    name: 'entreprises',
    component: Entreprises,
    meta: {
      title: 'Liste des entreprises',
      menuSection: 'entreprises',
    },
  },
  {
    path: '/entreprises/:id',
    name: 'entreprise',
    component: Entreprise,
    meta: {
      title: "Détail d'une entreprise",
      menuSection: 'entreprises',
    },
  },
  {
    path: '/administrations',
    name: 'administrations',
    component: Administrations,
    meta: {
      title: 'Liste des administrations',
      menuSection: 'administrations',
    },
  },
  {
    path: '/administrations/:id',
    name: 'administration',
    component: Administration,
    meta: {
      title: "Détail d'une administration",
      menuSection: 'administrations',
    },
  },
  {
    path: '/metas',
    name: 'metas',
    component: Metas,
    meta: {
      title: 'Métas',
      menuSection: 'metas',
    },
  },
  {
    path: '/metas/titre',
    name: 'meta-titre',
    component: MetaTitre,
    meta: {
      title: 'Métas des titres',
      menuSection: 'metas',
    },
  },
  {
    path: '/metas/demarche',
    name: 'meta-demarche',
    component: MetaDemarche,
    meta: {
      title: 'Métas des démarches',
      menuSection: 'metas',
    },
  },
  {
    path: '/metas/etape',
    name: 'meta-etape',
    component: MetaEtape,
    meta: {
      title: 'Métas des étapes',
      menuSection: 'metas',
    },
  },
  {
    path: '/metas/activite',
    name: 'meta-activite',
    component: MetaActivite,
    meta: {
      title: 'Métas des activités',
      menuSection: 'metas',
    },
  },
  {
    path: '/metas/:id',
    name: 'meta',
    component: Meta,
    meta: {
      title: "Détail d'une méta",
      menuSection: 'metas',
    },
  },
  {
    path: '/activites',
    name: 'activites',
    component: Activites,
    meta: {
      title: 'Liste des activités',
      menuSection: 'activites',
    },
  },
  {
    path: '/activites/:activiteId',
    name: 'activite',
    component: Activite,
    meta: {
      title: "Détail d'une activité",
      menuSection: 'activites',
    },
  },
  {
    path: '/activites/:activiteId/edition',
    name: 'activite-edition',
    component: ActiviteEdition,
    meta: {
      title: "Édition de l'activité",
      menuSection: 'activites',
    },
  },
  {
    path: '/statistiques',
    name: 'statistiques',
    component: Statistiques,
    meta: {
      menuSection: null,
      title: 'Liste des statistiques',
    },
    children: [
      {
        path: 'guyane',
        name: 'statistiques-guyane',
        component: StatsGuyane,
        meta: {
          menuSection: null,
          title: 'Statistiques de la Guyane',
        },
      },
      {
        path: 'globales',
        name: 'statistiques-globales',
        component: StatistiquesGlobales,
        meta: {
          menuSection: null,
          title: 'Statistiques globales',
        },
      },
      {
        path: 'granulats-marins',
        name: 'statistiques-granulats-marins',
        component: StatistiquesGranulatsMarins,
        meta: {
          menuSection: null,
          title: 'Statistiques des granulats marins',
        },
      },
      {
        path: 'mineraux-metaux-metropole',
        name: 'statistiques-mineraux-metaux-metropole',
        component: StatistiquesMinerauxMetauxMetropole,
        meta: {
          menuSection: null,
          title: 'Statistiques minéraux métaux de l’Hexagone',
        },
      },
    ],
  },
  {
    path: '/journaux',
    name: 'journaux',
    component: Journaux,
    meta: {
      menuSection: 'journaux',
      title: 'Journaux',
    },
  },
  // url /stats : demande de Samuel
  // pour avoir une uniformité entre toutes les start-ups
  {
    path: '/stats',
    redirect: 'statistiques',
  },
  {
    path: '/a-propos',
    name: 'a-propos',
    component: About,
    meta: {
      title: 'À propos',
      menuSection: null,
    },
  },
  {
    name: 'homepage',
    path: '/',
    redirect: { name: 'dashboard', replace: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'erreur',
    component: CaminoError,
    meta: {
      title: 'Erreur',
      menuSection: null,
    },
    props: {
      couleur: 'error',
      message: 'Page introuvable',
    },
  },
] as const satisfies Readonly<(Omit<RouteRecordRaw, 'children'> & { children?: Readonly<RouteRecordRaw['children']> })[]>

// TODO 2023-06-29 make children
export type CaminoRoutePaths = (typeof routes)[number]['path']

const history = createWebHistory()

const router = createRouter({
  routes: routes as Readonly<RouteRecordRaw[]>,
  history,
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(savedPosition)
        }, 500)
      })
    } else if (to.name === 'titres' && 'vueId' in to.query && !Array.isArray(to.query.vueId) && to.query.vueId === 'carte') {
      return false
    } else if (to.name === 'titre' && from.name === 'titre') {
      return false
    } else {
      return { top: 0 }
    }
  },
})

router.isReady().then(async () => {})

router.beforeEach(async (to, from, next) => {
  document.title = typeof to.meta.title === 'string' ? `${to.meta.title} - Camino` : 'le cadastre minier numérique ouvert - Camino'

  next()
})

router.afterEach((to, from) => {
  // si on enlève l’erreur dans le beforeEach, cela va enlever l’erreur et tenter d’afficher l’ancien composant qui va
  // potentiellement regénérer une erreur. Il faut donc attendre que la route soit changée pour l’enlever.
  if (store.state.error && to.name !== from.name) {
    store.dispatch('errorRemove')
  }
})

export default router
