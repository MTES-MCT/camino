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
} from 'camino-common/src/roles'
import { canEditPermission, getAssignableRoles } from 'camino-common/src/permissions/utilisateurs'
import { equalStringArrays } from '../../tools/index'
import { isAdministrationId } from 'camino-common/src/static/administrations'
import { UtilisateurToEdit } from 'camino-common/src/utilisateur'

const userIsCorrect = (utilisateur: UtilisateurToEdit): boolean => {
  if (!isRole(utilisateur.role)) {
    return false
  }
  if ((isSuperRole(utilisateur.role) || isDefautRole(utilisateur.role)) && utilisateur.administrationId === null && utilisateur.entrepriseIds?.length === 0) {
    return true
  }

  if (isAdministrationRole(utilisateur.role) && isAdministrationId(utilisateur.administrationId) && utilisateur.entrepriseIds?.length === 0) {
    return true
  }
  if (isEntrepriseOrBureauDetudeRole(utilisateur.role) && utilisateur.administrationId === null && (utilisateur.entrepriseIds?.length ?? 0) > 0) {
    return true
  }

  return false
}

export const utilisateurUpdationValidate = (user: UserNotNull, utilisateur: UtilisateurToEdit, utilisateurOld: User): void => {
  if (!userIsCorrect(utilisateur)) {
    throw new Error('utilisateur incorrect')
  }

  if (!utilisateurOld) {
    throw new Error("l'utilisateur n'existe pas")
  }

  if (!canEditPermission(user, utilisateurOld) || !canEditPermission(user, utilisateur as unknown as UserNotNull)) {
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
    if (isAdministration(utilisateurOld) && utilisateur.administrationId && utilisateur.administrationId !== utilisateurOld.administrationId) {
      throw new Error('droits insuffisants pour modifier les administrations')
    }

    if (!isAdministrationAdmin(user) && isEntrepriseOrBureauDEtude(utilisateurOld) && !equalStringArrays(utilisateurOld.entrepriseIds.toSorted(), utilisateur.entrepriseIds.toSorted())) {
      throw new Error('droits insuffisants pour modifier les entreprises')
    }
  }
}
