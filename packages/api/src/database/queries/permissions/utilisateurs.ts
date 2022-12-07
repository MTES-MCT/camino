import { raw, QueryBuilder } from 'objection'

import { IUtilisateur } from '../../../types.js'

import Utilisateurs from '../../models/utilisateurs.js'
import Entreprises from '../../models/entreprises.js'
import { entreprisesQueryModify } from './entreprises.js'
import {
  isAdministrationAdmin,
  isAdministrationEditeur,
  isAdministrationLecteur,
  isBureauDEtudes,
  isDefault,
  isEntreprise,
  isSuper
} from 'camino-common/src/roles.js'

export const utilisateursQueryModify = (
  q: QueryBuilder<Utilisateurs, Utilisateurs | Utilisateurs[]>,
  user: IUtilisateur | null | undefined
) => {
  q.select('utilisateurs.*')

  q.whereNotNull('utilisateurs.email')

  if (isAdministrationEditeur(user) || isAdministrationLecteur(user)) {
    // un utilisateur 'editeur' ou 'lecteur'
    // ne voit que les utilisateurs de son administration
    q.where('utilisateurs.administrationId', user.administrationId)
  } else if (
    (isEntreprise(user) || isBureauDEtudes(user)) &&
    user.entreprises?.length
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

  if (isSuper(user)) {
    q.select(raw('true').as('modification'))
    q.select(raw('true').as('suppression'))
    q.select(raw('true').as('permissionModification'))
  } else if (user && isAdministrationAdmin(user)) {
    // restreint le droit d'édition d'un utilisateur
    // aux roles inférieures d'admin
    const rolesPublic = ['entreprise', 'defaut']
    const rolesPublicReplace = rolesPublic.map(() => '?')

    // roles des administrations
    const rolesAdmin = ['editeur', 'lecteur']
    const rolesAdminReplace = rolesAdmin.map(() => '?')

    const permissionModificationSuppression = (alias: string) =>
      q.select(
        raw(
          `case when
           ?? = ?
           or ?? in (${rolesPublicReplace})
           or (?? in (${rolesAdminReplace}) and ?? is not null)
          then true else false end`,
          [
            'utilisateurs.id',
            user.id,
            'utilisateurs.role',
            ...rolesPublic,
            'utilisateurs.role',
            ...rolesAdmin,
            'utilisateurs.administrationId'
          ]
        ).as(alias)
      )

    permissionModificationSuppression('modification')

    permissionModificationSuppression('suppression')

    permissionModificationSuppression('permissionModification')
  } else if (user) {
    q.select(
      raw('(case when ?? = ? then true else false end)', [
        'utilisateurs.id',
        user.id
      ]).as('modification')
    )
    q.select(raw('false').as('suppression'))
    q.select(raw('false').as('permissionModification'))
  } else {
    q.select(raw('false').as('modification'))
    q.select(raw('false').as('suppression'))
    q.select(raw('false').as('permissionModification'))
  }

  if (isSuper(user) || isAdministrationAdmin(user)) {
    q.select(raw('true').as('utilisateursCreation'))
  } else {
    q.select(raw('false').as('utilisateursCreation'))
  }

  q.modifyGraph('entreprises', u =>
    entreprisesQueryModify(
      u as QueryBuilder<Entreprises, Entreprises | Entreprises[]>,
      user
    )
  )

  return q
}
