import { Alert } from '@/components/_ui/alert'
import type { RouteRecordRaw } from 'vue-router'

export const allRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Alert,
    props: {
      type: 'error',
      title: 'Page introuvable',
      small: true,
    },
  },
  // TODO 2024-04-29 : on recopie toutes les routes de router/index.ts
  {
    path: '/dashboard',
    name: 'dashboard',
    redirect: '/',
  },
  {
    path: '/dashboard/dgtmstats',
    name: 'Stats DGTM',
    redirect: '/',
  },
  {
    path: '/titres',
    name: 'titres',
    redirect: '/',
  },
  {
    path: '/titres/creation',
    name: 'titre-creation',
    redirect: '/',
  },
  {
    path: '/titres/:id',
    name: 'titre',
    redirect: '/',
  },
  {
    path: '/demarches',
    name: 'demarches',
    redirect: '/',
  },
  {
    path: '/demarches/:demarcheId',
    name: 'demarche',
    redirect: '/',
  },
  {
    path: '/travaux',
    name: 'travaux',
    redirect: '/',
  },
  {
    path: '/etapes/:id',
    name: 'etape',
    redirect: '/',
  },
  {
    path: '/etapes/creation',
    name: 'etape-creation',
    redirect: '/',
  },
  {
    path: '/etapes/:id/edition',
    name: 'etape-edition',
    redirect: '/',
  },
  {
    path: '/utilisateurs',
    name: 'utilisateurs',
    redirect: '/',
  },
  {
    path: '/utilisateurs/:id',
    name: 'utilisateur',
    redirect: '/',
  },
  {
    path: '/entreprises',
    name: 'entreprises',
    redirect: '/',
  },
  {
    path: '/entreprises/:id',
    name: 'entreprise',
    redirect: '/',
  },
  {
    path: '/administrations',
    name: 'administrations',
    redirect: '/',
  },
  {
    path: '/administrations/:id',
    name: 'administration',
    redirect: '/',
  },
  {
    path: '/metas',
    name: 'metas',
    redirect: '/',
  },
  {
    path: '/metas/titre',
    name: 'meta-titre',
    redirect: '/',
  },
  {
    path: '/metas/demarche',
    name: 'meta-demarche',
    redirect: '/',
  },
  {
    path: '/metas/etape',
    name: 'meta-etape',
    redirect: '/',
  },
  {
    path: '/metas/activite',
    name: 'meta-activite',
    redirect: '/',
  },
  {
    path: '/metas/:id',
    name: 'meta',
    redirect: '/',
  },
  {
    path: '/activites',
    name: 'activites',
    redirect: '/',
  },
  {
    path: '/activites/:activiteId',
    name: 'activite',
    redirect: '/',
  },
  {
    path: '/activites/:activiteId/edition',
    name: 'activite-edition',
    redirect: '/',
  },
  {
    path: '/statistiques/:tabId?',
    name: 'statistiques',
    redirect: '/',
  },
  {
    path: '/journaux',
    name: 'journaux',
    redirect: '/',
  },
  // url /stats : demande de Samuel
  // pour avoir une uniformité entre toutes les start-ups
  {
    path: '/stats',
    name: 'statistiquesbetagouv',
    redirect: 'statistiques',
  },
  {
    path: '/a-propos',
    name: 'a-propos',
    redirect: '/',
  },
  {
    name: 'homepage',
    path: '/',
    redirect: { name: 'dashboard', replace: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'erreur',
    redirect: '/',
  },
]
