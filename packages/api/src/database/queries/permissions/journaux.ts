import { QueryBuilder } from 'objection'

import Journaux from '../../models/journaux'
import { isSuper, User } from 'camino-common/src/roles'

export const journauxQueryModify = (q: QueryBuilder<Journaux, Journaux | Journaux[]>, user: User): QueryBuilder<Journaux, Journaux | Journaux[]> => {
  q.select('journaux.*')

  // Les journaux sont uniquement visibles par les super
  if (!user || !isSuper(user)) {
    q.where(false)
  }

  return q
}
