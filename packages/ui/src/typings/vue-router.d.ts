/* eslint-disable no-unused-vars, no-restricted-imports */

import { NavigationFailure, Router, RouterOptions, RouteMeta } from 'vue-router'
import { CaminoRouteNames, CaminoVueRoute } from '@/router/routes'
import { Ref } from 'vue'

type CaminoRouter = Omit<Router, 'push' | 'currentRoute'> & {
  push: <P extends CaminoRouteNames>(value: CaminoVueRoute<P>) => Promise<NavigationFailure | void | undefined>
  currentRoute: Ref<Required<CaminoVueRoute<CaminoRouteNames>>>
}

declare module 'vue-router' {
  export function useRouter(): CaminoRouter
  export function useRoute<T extends CaminoRouteNames = CaminoRouteNames>(): Required<CaminoVueRoute<T>> & { meta: RouteMeta; fullPath: string }
  export function createRouter(options: RouterOptions): CaminoRouter
}
