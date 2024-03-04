import type { InjectionKey, Ref } from 'vue'
import type { User } from 'camino-common/src/roles'
import type { Entreprise } from 'camino-common/src/entreprise'

export const userKey = Symbol('user') as InjectionKey<User>
export const entreprisesKey = Symbol('entreprises') as InjectionKey<Ref<Entreprise[]>>
