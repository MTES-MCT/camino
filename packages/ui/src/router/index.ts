import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import { Dashboard } from '../components/dashboard'
import { Titres } from '../components/titres'
import { isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { CaminoRouteNames, routesDefinitions } from './routes'
const PageIntrouvableAlert = async () => {
  const { PageIntrouvableAlert } = await import('@/components/_ui/alert')

  return PageIntrouvableAlert
}
const DGTMStatsFull = async () => {
  const { DGTMStatsFull } = await import('../components/dashboard/dgtm-stats-full')

  return DGTMStatsFull
}

const EtapeEdition = async () => {
  const { EtapeEdition } = await import('../components/etape-edition')

  return EtapeEdition
}

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

const Metas = async () => {
  const { Metas } = await import('../components/metas')

  return Metas
}

const Statistiques = async () => {
  const { Statistiques } = await import('../components/statistiques')

  return Statistiques
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
const routes = {
  dashboard: {
    ...routesDefinitions.dashboard,
    component: Dashboard,
  },
  statsDGTM: {
    ...routesDefinitions.statsDGTM,
    component: DGTMStatsFull,
  },
  titres: {
    ...routesDefinitions.titres,
    component: Titres,
  },
  titreCreation: {
    ...routesDefinitions.titreCreation,
    component: TitreCreation,
  },
  titre: {
    ...routesDefinitions.titre,
    component: Titre,
  },
  demarches: {
    ...routesDefinitions.demarches,
    component: Demarches,
  },
  demarche: {
    ...routesDefinitions.demarche,
    component: Demarche,
  },
  travaux: {
    ...routesDefinitions.travaux,
    component: Travaux,
  },
  etape: {
    ...routesDefinitions.etape,
    redirect: to => {
      return { name: 'etapeEdition', params: { id: to.params.id } }
    },
  },
  etapeCreation: {
    ...routesDefinitions.etapeCreation,
    component: EtapeEdition,
  },
  etapeEdition: {
    ...routesDefinitions.etapeEdition,
    component: EtapeEdition,
  },
  utilisateurs: {
    ...routesDefinitions.utilisateurs,
    component: Utilisateurs,
  },
  utilisateur: {
    ...routesDefinitions.utilisateur,
    component: Utilisateur,
  },
  entreprises: {
    ...routesDefinitions.entreprises,
    component: Entreprises,
  },
  entreprise: {
    ...routesDefinitions.entreprise,
    component: Entreprise,
  },
  administrations: {
    ...routesDefinitions.administrations,
    component: Administrations,
  },
  administration: {
    ...routesDefinitions.administration,
    component: Administration,
  },
  metas: {
    ...routesDefinitions.metas,
    component: Metas,
  },
  meta: {
    ...routesDefinitions.meta,
    component: Meta,
  },
  activites: {
    ...routesDefinitions.activites,
    component: Activites,
  },
  activite: {
    ...routesDefinitions.activite,
    component: Activite,
  },
  activiteEdition: {
    ...routesDefinitions.activiteEdition,
    component: ActiviteEdition,
  },
  statistiques: {
    ...routesDefinitions.statistiques,
    component: Statistiques,
  },
  journaux: {
    ...routesDefinitions.journaux,
    component: Journaux,
  },
  // url /stats : demande de Samuel
  // pour avoir une uniformité entre toutes les start-ups
  statistiquesbetagouv: {
    ...routesDefinitions.statistiquesbetagouv,
    redirect: 'statistiques',
  },
  aPropos: {
    ...routesDefinitions.aPropos,
    component: About,
  },
  homepage: {
    ...routesDefinitions.homepage,
    redirect: { name: 'dashboard', replace: true },
  },
  erreur: {
    ...routesDefinitions.erreur,
    component: PageIntrouvableAlert,
  },
} as const satisfies { [key in CaminoRouteNames]: Readonly<Omit<RouteRecordRaw, 'children'>> }

const history = createWebHistory()

const router = createRouter({
  routes: Object.values(routes) as Readonly<RouteRecordRaw[]>,
  history,
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return new Promise(resolve => {
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
  // Ceci est pour empêcher de nettoyer les filtres quand on clique sur le menu.
  // Par exemple sur "titres et autorisations" , après avoir rajouter des filtres, si on clique à nouveau sur le menu, on perd tous les filtres
  if (from.name === to.name && JSON.stringify(to.params) === JSON.stringify(from.params) && isNullOrUndefinedOrEmpty(Object.keys(to.query))) {
    next(false)
  } else {
    next()
  }
})

export default router
