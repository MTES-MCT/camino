import { QueryBuilder } from 'objection'

import Journaux from '../../models/journaux.js'
import { utilisateursQueryModify } from './utilisateurs.js'
import Utilisateurs from '../../models/utilisateurs.js'
import { titresQueryModify } from './titres.js'
import Titres from '../../models/titres.js'
import { isSuper, User } from 'camino-common/src/roles.js'

export const journauxQueryModify = (q: QueryBuilder<Journaux, Journaux | Journaux[]>, user: User) => {
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
