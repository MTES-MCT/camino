import { QueryBuilder } from 'objection'

import Utilisateurs from '../../models/utilisateurs.js'
import Entreprises from '../../models/entreprises.js'
import { entreprisesQueryModify } from './entreprises.js'
import {
  isAdministrationEditeur,
  isAdministrationLecteur,
  isBureauDEtudes,
  isDefault,
  isEntreprise,
  User
} from 'camino-common/src/roles.js'

export const utilisateursQueryModify = (
  q: QueryBuilder<Utilisateurs, Utilisateurs | Utilisateurs[]>,
  user: User
) => {
  q.select('utilisateurs.*')

  q.whereNotNull('utilisateurs.email')

  if (isAdministrationEditeur(user) || isAdministrationLecteur(user)) {
    // un utilisateur 'editeur' ou 'lecteur'
    // ne voit que les utilisateurs de son administration
    q.where('utilisateurs.administrationId', user.administrationId)
  } else if (
    (isEntreprise(user) || isBureauDEtudes(user)) &&
    user.entreprises.length
  ) {
    // un utilisateur entreprise
    // ne voit que les utilisateurs de son entreprise
    const entreprisesIds = user.entreprises.map(e => e.id)

    q.whereExists(
      (
        Utilisateurs.relatedQuery('entreprises') as QueryBuilder<
          Entreprises,
          Entreprises | Entreprises[]
        >
      ).whereIn('entreprises.id', entreprisesIds)
    )
  } else if (user && isDefault(user)) {
    // un utilisateur "defaut" ne voit que son propre profil
    q.where('id', user.id)
  } else if (!user) {
    // un utilisateur non-authentifié ne voit aucun utilisateur
    q.where(false)
  }

  q.modifyGraph('entreprises', u =>
    entreprisesQueryModify(
      u as QueryBuilder<Entreprises, Entreprises | Entreprises[]>,
      user
    )
  )

  return q
}
