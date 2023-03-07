import { isSuper, isAdministrationAdmin, isAdministrationEditeur, User, isAdministration, isEntreprise, isBureauDEtudes, isAdministrationLecteur, ROLES, Role } from '../roles.js'

export const canCreateEntreprise = (user: User): boolean => isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)
export const canCreateUtilisateur = (user: User): boolean => isSuper(user) || isAdministrationAdmin(user)
export const canReadUtilisateurs = (user: User) => isSuper(user) || isAdministration(user) || isEntreprise(user) || isBureauDEtudes(user)

export const canReadUtilisateur = (user: User, id: string) => user?.id === id || canReadUtilisateurs(user)
export const canEditUtilisateur = (user: User, utilisateur: User) => {
  if (isSuper(user)) {
    return true
  }
  if (isAdministrationAdmin(user) && (isAdministrationEditeur(utilisateur) || isAdministrationLecteur(utilisateur)) && user.administrationId === utilisateur.administrationId) {
    return true
  }
  if (user?.id === utilisateur?.id) {
    return true
  }

  return false
}

export const getAssignableRoles = (user: User): readonly Role[] => {
  if (isSuper(user)) {
    return ROLES
  }
  if (isAdministrationAdmin(user)) {
    return ['lecteur', 'editeur', 'entreprise', 'bureau d’études', 'defaut']
  }

  return []
}
