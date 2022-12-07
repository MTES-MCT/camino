import type { CaminoConfig } from 'camino-common/src/static/config'
import type { Store } from 'vuex'

/* eslint-disable no-unused-vars */

declare module '@vue/runtime-core' {
  interface State {
    count: number
  }

  interface ComponentCustomProperties {
    $store: Store<any>
  }
}

declare global {
  var caminoConfig: CaminoConfig

  interface ReadonlyArray<T> {
    includes<U>(_x: U & (T & U extends never ? never : unknown)): boolean
  }

  interface Array<T> {
    includes<U>(_x: U & (T & U extends never ? never : unknown)): boolean
    findLast(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): T | undefined
  }
}
