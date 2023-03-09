import { IUtilisateur } from '../../types.js'

import {
  isAdministrationRole,
  isAdministrationAdmin,
  isSuper,
  User,
  UserNotNull,
  isAdministration,
  isEntrepriseOrBureauDetudeRole,
  isEntrepriseOrBureauDEtude,
  isDefautRole,
  isSuperRole,
  isRole,
} from 'camino-common/src/roles.js'
import { canEditUtilisateur, getAssignableRoles } from 'camino-common/src/permissions/utilisateurs.js'
import { equalStringArrays } from '../../tools/index.js'
import { emailCheck } from '../../tools/email-check.js'
import { isAdministrationId } from 'camino-common/src/static/administrations.js'

const isUser = (utilisateur: Pick<IUtilisateur, 'email' | 'role' | 'administrationId' | 'entreprises'>): utilisateur is UserNotNull => {
  if (!utilisateur.email || !emailCheck(utilisateur.email)) {
    return false
  }
  if (!isRole(utilisateur.role)) {
    return false
  }
  if ((isSuperRole(utilisateur.role) || isDefautRole(utilisateur.role)) && utilisateur.administrationId === undefined && utilisateur.entreprises?.length === 0) {
    return true
  }

  if (isAdministrationRole(utilisateur.role) && isAdministrationId(utilisateur.administrationId) && utilisateur.entreprises?.length === 0) {
    return true
  }
  if (isEntrepriseOrBureauDetudeRole(utilisateur.role) && utilisateur.administrationId === undefined && (utilisateur.entreprises?.length ?? 0) > 0) {
    return true
  }

  return false
}

const userIsCorrect = (utilisateur: Pick<IUtilisateur, 'email' | 'role' | 'administrationId' | 'entreprises' | 'id'>): boolean => isUser(utilisateur)

export const utilisateurUpdationValidate = (user: UserNotNull, utilisateur: Pick<IUtilisateur, 'email' | 'role' | 'administrationId' | 'entreprises' | 'id'>, utilisateurOld: User) => {
  if (!userIsCorrect(utilisateur)) {
    throw new Error('utilisateur incorrect')
  }

  if (!utilisateurOld) {
    throw new Error("l'utilisateur n'existe pas")
  }

  if (!canEditUtilisateur(user, utilisateurOld) || (isUser(utilisateur) && !canEditUtilisateur(user, utilisateur))) {
    throw new Error('droits insuffisants')
  }

  if (utilisateur.role !== utilisateurOld.role) {
    if (user.id === utilisateur.id) {
      throw new Error('impossible de modifier son propre rôle')
    } else if (!getAssignableRoles(user).includes(utilisateur.role)) {
      throw new Error('droits insuffisants pour modifier les rôles')
    }
  }

  if (!isSuper(user)) {
    if (isAdministration(utilisateurOld) && utilisateur.administrationId !== utilisateurOld.administrationId) {
      throw new Error('droits insuffisants pour modifier les administrations')
    }

    if (
      !isAdministrationAdmin(user) &&
      isEntrepriseOrBureauDEtude(utilisateurOld) &&
      !equalStringArrays(utilisateurOld.entreprises.map(({ id }) => id).sort(), (utilisateur.entreprises ?? []).map(({ id }) => id).sort())
    ) {
      throw new Error('droits insuffisants pour modifier les entreprises')
    }
  }
}
