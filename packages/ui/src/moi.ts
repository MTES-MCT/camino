import { memoize } from 'camino-common/src/typescript-tools'
import { getWithJson } from './api/client-rest'

export const userMemoized = memoize(() => getWithJson('/moi', {}))
