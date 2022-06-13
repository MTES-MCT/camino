import { QueryBuilder } from 'objection'

import { IUtilisateur } from '../../../types'

import Journaux from '../../models/journaux'
import { utilisateursQueryModify } from './utilisateurs'
import Utilisateurs from '../../models/utilisateurs'
import { titresQueryModify } from './titres'
import Titres from '../../models/titres'
import { permissionCheck } from 'camino-common/src/roles'

export const journauxQueryModify = (
  q: QueryBuilder<Journaux, Journaux | Journaux[]>,
  user: Omit<IUtilisateur, 'permission'> | null | undefined
) => {
  q.select('journaux.*')

  // Les journaux sont uniquement visibles par les super
  if (!user || !permissionCheck(user.role, ['super'])) {
    q.where(false)
  }

  q.modifyGraph('utilisateur', b => {
    utilisateursQueryModify(
      b as QueryBuilder<Utilisateurs, Utilisateurs | Utilisateurs[]>,
      user
    )
  })

  q.modifyGraph('titre', b => {
    titresQueryModify(b as QueryBuilder<Titres, Titres | Titres[]>, user)
  })

  return q
}
