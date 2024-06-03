import { Alert } from '@/components/_ui/alert'
import { routesDefinitions } from '@/router/routes'

export const allRoutes = Object.values(routesDefinitions).map(route => {
  if (route.path === '/') {
    return { ...route, component: Alert, props: { type: 'error', title: 'Page introuvable', small: true } }
  }
  return { ...route, redirect: '/' }
})
