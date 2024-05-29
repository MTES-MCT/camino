/* eslint-disable no-unused-vars */

import { NavigationFailure, Router } from 'vue-router'
import { CaminoRouteNames, CaminoVueRouter } from '@/router/routes'

type CaminoRouter<T extends CaminoRouteNames> = Omit<Router, 'push'> & { push: (value: CaminoVueRouter<T>) => Promise<NavigationFailure | void | undefined> }

declare module 'vue-router' {
  export function useRouter<T extends CaminoRouteNames>(): CaminoRouter<T>
}
