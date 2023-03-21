import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import store from '../store'

import { Dashboard } from '../components/dashboard'
import { DGTMStatsFull } from '../components/dashboard/dgtm-stats-full'
import Titre from '../components/titre.vue'
import { Titres } from '../components/titres'
import Demarches from '../components/demarches.vue'
import Etape from '../components/etape.vue'
import Activite from '../components/activite.vue'
import Activites from '../components/activites.vue'
import TitreCreation from '../components/titre-creation.vue'
import EtapeEdition from '../components/etape-edition.vue'
import ActiviteEdition from '../components/activite-edition.vue'
import Travaux from '../components/travaux.vue'
import { MenuSection } from '@/utils/matomo'
const Utilisateur = async () => {
  const { Utilisateur } = await import('../components/utilisateur')
  return Utilisateur
}
const Utilisateurs = () => import('../components/utilisateurs.vue')
const Entreprise = async () => {
  const { Entreprise } = await import('../components/entreprise')
  return Entreprise
}
const Entreprises = () => import('../components/entreprises.vue')
const Administration = async () => {
  const { Administration } = await import('../components/administration')
  return Administration
}
const Administrations = async () => {
  const { Administrations } = await import('../components/administrations')
  return Administrations
}
const Meta = () => import('../components/meta.vue')
const MetaTitre = () => import('../components/meta-titre.vue')
const MetaDemarche = () => import('../components/meta-demarche.vue')
const MetaEtape = () => import('../components/meta-etape.vue')
const MetaActivite = () => import('../components/meta-activite.vue')
const Metas = () => import('../components/metas.vue')
const Error = async () => {
  const { Error } = await import('../components/error')
  return Error
}
const StatistiquesGlobales = async () => {
  const { Globales } = await import('../components/statistiques/globales')
  return Globales
}
const Statistiques = () => import('../components/statistiques.vue')
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
const Journaux = () => import('../components/journaux.vue')
const About = () => import('../components/content/about.vue')

declare module 'vue-router' {
  interface RouteMeta {
    menuSection: MenuSection
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      menuSection: 'dashboard',
    },
  },
  {
    path: '/dashboard/dgtmstats',
    name: 'Stats DGTM',
    component: DGTMStatsFull,
    meta: {
      menuSection: 'dashboard',
    },
  },
  {
    path: '/titres',
    name: 'titres',
    component: Titres,
    meta: {
      menuSection: 'titres',
    },
  },
  {
    path: '/titres/creation',
    name: 'titre-creation',
    component: TitreCreation,
    meta: {
      menuSection: 'titres',
    },
  },
  {
    path: '/titres/:id',
    name: 'titre',
    component: Titre,
    meta: {
      menuSection: 'titres',
    },
  },
  {
    path: '/demarches',
    name: 'demarches',
    component: Demarches,
    meta: {
      menuSection: 'demarches',
    },
  },
  {
    path: '/travaux',
    name: 'travaux',
    component: Travaux,
    meta: {
      menuSection: 'travaux',
    },
  },
  {
    path: '/etapes/:id',
    name: 'etape',
    component: Etape,
    meta: {
      menuSection: 'titres',
    },
  },
  {
    path: '/etapes/creation',
    name: 'etape-creation',
    component: EtapeEdition,
    meta: {
      menuSection: 'titres',
    },
  },
  {
    path: '/etapes/:id/edition',
    name: 'etape-edition',
    component: EtapeEdition,
    meta: {
      menuSection: 'titres',
    },
  },
  {
    path: '/utilisateurs',
    name: 'utilisateurs',
    component: Utilisateurs,
    meta: {
      menuSection: 'utilisateurs',
    },
  },
  {
    path: '/utilisateurs/:id',
    name: 'utilisateur',
    component: Utilisateur,
    meta: {
      menuSection: 'utilisateurs',
    },
  },
  {
    path: '/entreprises',
    name: 'entreprises',
    component: Entreprises,
    meta: {
      menuSection: 'entreprises',
    },
  },
  {
    path: '/entreprises/:id',
    name: 'entreprise',
    component: Entreprise,
    meta: {
      menuSection: 'entreprises',
    },
  },
  {
    path: '/administrations',
    name: 'administrations',
    component: Administrations,
    meta: {
      menuSection: 'administrations',
    },
  },
  {
    path: '/administrations/:id',
    name: 'administration',
    component: Administration,
    meta: {
      menuSection: 'administrations',
    },
  },
  {
    path: '/metas',
    name: 'metas',
    component: Metas,
    meta: {
      menuSection: 'metas',
    },
  },
  {
    path: '/metas/titre',
    name: 'meta-titre',
    component: MetaTitre,
    meta: {
      menuSection: 'metas',
    },
  },
  {
    path: '/metas/demarche',
    name: 'meta-demarche',
    component: MetaDemarche,
    meta: {
      menuSection: 'metas',
    },
  },
  {
    path: '/metas/etape',
    name: 'meta-etape',
    component: MetaEtape,
    meta: {
      menuSection: 'metas',
    },
  },
  {
    path: '/metas/activite',
    name: 'meta-activite',
    component: MetaActivite,
    meta: {
      menuSection: 'metas',
    },
  },
  {
    path: '/metas/:id',
    name: 'meta',
    component: Meta,
    meta: {
      menuSection: 'metas',
    },
  },
  {
    path: '/activites',
    name: 'activites',
    component: Activites,
    meta: {
      menuSection: 'activites',
    },
  },
  {
    path: '/activites/:id',
    name: 'activite',
    component: Activite,
    meta: {
      menuSection: 'activites',
    },
  },
  {
    path: '/activites/:id/edition',
    name: 'activite-edition',
    component: ActiviteEdition,
    meta: {
      menuSection: 'activites',
    },
  },
  {
    path: '/statistiques',
    name: 'statistiques',
    component: Statistiques,
    children: [
      {
        path: 'guyane',
        name: 'statistiques-guyane',
        component: StatsGuyane,
      },
      {
        path: 'globales',
        name: 'statistiques-globales',
        component: StatistiquesGlobales,
      },
      {
        path: 'granulats-marins',
        name: 'statistiques-granulats-marins',
        component: StatistiquesGranulatsMarins,
      },
      {
        path: 'mineraux-metaux-metropole',
        name: 'statistiques-mineraux-metaux-metropole',
        component: StatistiquesMinerauxMetauxMetropole,
      },
    ],
  },
  {
    path: '/journaux',
    name: 'journaux',
    component: Journaux,
    meta: {
      menuSection: 'journaux',
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
  },
  {
    name: 'homepage',
    path: '/',
    redirect: { name: 'dashboard', replace: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'erreur',
    component: Error,
    props: {
      couleur: 'error',
      message: 'Page introuvable',
    },
  },
]

const history = createWebHistory()

const router = createRouter({
  routes,
  history,
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
})

router.isReady().then(async () => {})

router.beforeEach(async (to, from, next) => {
  if (!store.getters['user/isLoaded']) {
    await store.dispatch('user/identify')
  }

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
