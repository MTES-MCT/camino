import { raw, QueryBuilder } from 'objection'

import { IUtilisateur } from '../../../types'

import { knex } from '../../../knex'

import Utilisateurs from '../../models/utilisateurs'
import Administrations from '../../models/administrations'
import Entreprises from '../../models/entreprises'
import { entreprisesQueryModify } from './entreprises'
import {
  isAdministrationAdmin,
  isAdministrationEditeur,
  isAdministrationLecteur,
  isBureauDEtudes,
  isDefault,
  isEntreprise,
  isSuper
} from 'camino-common/src/roles'

const utilisateursQueryModify = (
  q: QueryBuilder<Utilisateurs, Utilisateurs | Utilisateurs[]>,
  user: IUtilisateur | null | undefined
) => {
  q.select('utilisateurs.*')

  q.whereNotNull('utilisateurs.email')

  if (
    (isAdministrationEditeur(user) || isAdministrationLecteur(user)) &&
    user?.administrations?.length
  ) {
    // un utilisateur 'editeur' ou 'lecteur'
    // ne voit que les utilisateurs de son administration
    const administrationsIds = user.administrations.map(e => e.id)

    q.whereExists(
      (
        Utilisateurs.relatedQuery('administrations') as QueryBuilder<
          Administrations,
          Administrations | Administrations[]
        >
      ).whereIn('administrations.id', administrationsIds)
    )
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
  } else if (
    user &&
    isAdministrationAdmin(user) &&
    user.administrations?.length
  ) {
    // restreint le droit d'édition d'un utilisateur
    // aux roles inférieures d'admin
    const rolesPublic = ['entreprise', 'defaut']
    const rolesPublicReplace = rolesPublic.map(() => '?')

    // roles des administrations
    const rolesAdmin = ['editeur', 'lecteur']
    const rolesAdminReplace = rolesAdmin.map(() => '?')

    const administrationsIds = user.administrations.map(e => e.id)

    q.leftJoin('utilisateurs__administrations as u_a', b => {
      b.on(knex.raw('?? = ??', ['u_a.utilisateur_id', 'utilisateurs.id']))
      b.andOnIn('u_a.administration_id', administrationsIds)
    })

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
            'u_a.administration_id'
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

  if (
    isSuper(user) ||
    isAdministrationAdmin(user) ||
    isAdministrationEditeur(user)
  ) {
    q.select(raw('true').as('entreprisesCreation'))
  } else {
    q.select(raw('false').as('entreprisesCreation'))
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

export { utilisateursQueryModify }
