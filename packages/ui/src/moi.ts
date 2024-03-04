import type { InjectionKey } from 'vue'
import { User } from 'camino-common/src/roles'

export const userKey = Symbol('user') as InjectionKey<User>
