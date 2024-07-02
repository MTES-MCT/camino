import { PageIntrouvableAlert } from '@/components/_ui/alert'
import { routesDefinitions } from '@/router/routes'

export const allRoutes = Object.values(routesDefinitions).map(route => {
  if (route.path === '/') {
    return { ...route, component: PageIntrouvableAlert }
  }
  return { ...route, redirect: '/' }
})
