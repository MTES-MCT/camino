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
const Utilisateur = () => import('../components/utilisateur.vue')
const Utilisateurs = () => import('../components/utilisateurs.vue')
const Entreprise = async () => {
  const { Entreprise } = await import('../components/entreprise')
  return Entreprise
}
const Entreprises = () => import('../components/entreprises.vue')
const Administration = () => import('../components/administration.vue')
const Administrations = () => import('../components/administrations.vue')
const Meta = () => import('../components/meta.vue')
const MetaTitre = () => import('../components/meta-titre.vue')
const MetaDemarche = () => import('../components/meta-demarche.vue')
const MetaEtape = () => import('../components/meta-etape.vue')
const MetaActivite = () => import('../components/meta-activite.vue')
const Metas = () => import('../components/metas.vue')
const Error = () => import('../components/error.vue')
const UserAdd = () => import('../components/user/add.vue')
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
  const { GranulatsMarins } = await import(
    '../components/statistiques/granulats-marins'
  )
  return GranulatsMarins
}
const StatistiquesMinerauxMetauxMetropole = async () => {
  const { MinerauxMetauxMetropole } = await import(
    '../components/statistiques/mineraux-metaux-metropole'
  )
  return MinerauxMetauxMetropole
}
const Journaux = () => import('../components/journaux.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/dashboard/dgtmstats',
    name: 'Stats DGTM',
    component: DGTMStatsFull
  },
  {
    path: '/titres',
    name: 'titres',
    component: Titres
  },
  {
    path: '/titres/creation',
    name: 'titre-creation',
    component: TitreCreation
  },
  {
    path: '/titres/:id',
    name: 'titre',
    component: Titre
  },
  {
    path: '/demarches',
    name: 'demarches',
    component: Demarches
  },
  {
    path: '/travaux',
    name: 'travaux',
    component: Travaux
  },
  {
    path: '/etapes/:id',
    name: 'etape',
    component: Etape
  },
  {
    path: '/etapes/creation',
    name: 'etape-creation',
    component: EtapeEdition
  },
  {
    path: '/etapes/:id/edition',
    name: 'etape-edition',
    component: EtapeEdition
  },
  {
    path: '/utilisateurs',
    name: 'utilisateurs',
    component: Utilisateurs
  },
  {
    path: '/utilisateurs/:id',
    name: 'utilisateur',
    component: Utilisateur
  },
  {
    path: '/entreprises',
    name: 'entreprises',
    component: Entreprises
  },
  {
    path: '/entreprises/:id',
    name: 'entreprise',
    component: Entreprise
  },
  {
    path: '/administrations',
    name: 'administrations',
    component: Administrations
  },
  {
    path: '/administrations/:id',
    name: 'administration',
    component: Administration
  },
  {
    path: '/metas',
    name: 'metas',
    component: Metas
  },
  {
    path: '/metas/titre',
    name: 'meta-titre',
    component: MetaTitre
  },
  {
    path: '/metas/demarche',
    name: 'meta-demarche',
    component: MetaDemarche
  },
  {
    path: '/metas/etape',
    name: 'meta-etape',
    component: MetaEtape
  },
  {
    path: '/metas/activite',
    name: 'meta-activite',
    component: MetaActivite
  },
  {
    path: '/metas/:id',
    name: 'meta',
    component: Meta
  },
  {
    path: '/activites',
    name: 'activites',
    component: Activites
  },
  {
    path: '/activites/:id',
    name: 'activite',
    component: Activite
  },
  {
    path: '/activites/:id/edition',
    name: 'activite-edition',
    component: ActiviteEdition
  },
  {
    path: '/creation-de-compte',
    name: 'account-creation',
    component: UserAdd
  },
  {
    path: '/statistiques',
    name: 'statistiques',
    component: Statistiques,
    children: [
      {
        path: 'guyane',
        name: 'statistiques-guyane',
        component: StatsGuyane
      },
      {
        path: 'globales',
        name: 'statistiques-globales',
        component: StatistiquesGlobales
      },
      {
        path: 'granulats-marins',
        name: 'statistiques-granulats-marins',
        component: StatistiquesGranulatsMarins
      },
      {
        path: 'mineraux-metaux-metropole',
        name: 'statistiques-mineraux-metaux-metropole',
        component: StatistiquesMinerauxMetauxMetropole
      }
    ]
  },
  { path: '/journaux', name: 'journaux', component: Journaux },
  // url /stats : demande de Samuel
  // pour avoir une uniformité entre toutes les start-ups
  {
    path: '/stats',
    redirect: 'statistiques'
  },
  {
    name: 'homepage',
    path: '/',
    redirect: { name: 'dashboard', replace: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'erreur',
    component: Error,
    props: {
      couleur: 'error',
      message: 'Page introuvable'
    }
  }
]

const history = createWebHistory()

const router = createRouter({
  routes,
  history,
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active'
})

router.isReady().then(async () => {})

router.beforeEach(async (to, from, next) => {
  if (!store.getters['user/isLoaded']) {
    await store.dispatch('user/identify')
  }
  if (store.state.menu.component) {
    store.commit('menuClose')
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
