import { QueryBuilder } from 'objection'

import Journaux from '../../models/journaux'
import { utilisateursQueryModify } from './utilisateurs'
import Utilisateurs from '../../models/utilisateurs'
import { titresQueryModify } from './titres'
import Titres from '../../models/titres'
import { isSuper, User } from 'camino-common/src/roles'
import { DeepReadonly } from 'camino-common/src/typescript-tools'


export const journauxQueryModify = (q: QueryBuilder<Journaux, Journaux | Journaux[]>, user: DeepReadonly<User>): QueryBuilder<Journaux, Journaux | Journaux[]> => {
  q.select('journaux.*')

  // Les journaux sont uniquement visibles par les super
  if (!user || !isSuper(user)) {
    q.where(false)
  }

  q.modifyGraph('utilisateur', b => {
    utilisateursQueryModify(b as QueryBuilder<Utilisateurs, Utilisateurs | Utilisateurs[]>, user)
  })

  q.modifyGraph('titre', b => {
    titresQueryModify(b as QueryBuilder<Titres, Titres | Titres[]>, user)
  })

  return q
}
