import { QueryBuilder } from 'objection'

import Journaux from '../../models/journaux'
import { isSuper, User } from 'camino-common/src/roles'
import { DeepReadonly } from 'camino-common/src/typescript-tools'

export const journauxQueryModify = (q: QueryBuilder<Journaux, Journaux | Journaux[]>, user: DeepReadonly<User>): QueryBuilder<Journaux, Journaux | Journaux[]> => {
  q.select('journaux.*')

  // Les journaux sont uniquement visibles par les super
  if (!user || !isSuper(user)) {
    q.where(false)
  }

  return q
}
