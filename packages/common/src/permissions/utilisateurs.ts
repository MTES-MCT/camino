import { isSuper, isAdministrationAdmin, isAdministrationEditeur, User, isAdministration, isEntreprise, isBureauDEtudes, ROLES, Role, UserNotNull } from '../roles'

export const canCreateEntreprise = (user: User): boolean => isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)
export const canReadUtilisateurs = (user: User): boolean => isSuper(user) || isAdministration(user) || isEntreprise(user) || isBureauDEtudes(user)

export const canReadUtilisateur = (user: User, id: string): boolean => user?.id === id || canReadUtilisateurs(user)
export const canDeleteUtilisateur = (user: User, id: string): boolean => {
  if (isSuper(user)) {
    return true
  }

  return user?.id === id
}
export const canEditPermission = (user: User, utilisateur: UserNotNull): boolean => {
  if (user?.id === utilisateur.id) {
    return false
  }
  if (getAssignableRoles(user).includes(utilisateur.role)) {
    if (isAdministrationAdmin(user) && isAdministration(utilisateur) && user.administrationId !== utilisateur.administrationId) {
      return false
    }

    return true
  }

  return false
}

export const getAssignableRoles = (user: User): readonly Role[] => {
  if (isSuper(user)) {
    return ROLES
  }
  if (isAdministrationAdmin(user)) {
    return ['admin', 'editeur', 'lecteur', 'entreprise', 'bureau d’études', 'defaut']
  }

  return []
}
