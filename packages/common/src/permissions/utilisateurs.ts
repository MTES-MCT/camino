import {
  isSuper,
  isAdministrationAdmin,
  isAdministrationEditeur,
  User,
  isAdministration,
  isEntreprise,
  isBureauDEtudes,
  ROLES,
  Role,
  UserNotNull,
  isAdministrationLecteur,
  isEntrepriseOrBureauDEtude,
} from '../roles'
import { DeepReadonly } from '../typescript-tools'

export const canCreateEntreprise = (user: User): boolean => isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)
export const canReadUtilisateurs = (user: DeepReadonly<User>): boolean => isSuper(user) || isAdministration(user) || isEntreprise(user) || isBureauDEtudes(user)

export const canReadUtilisateur = (user: DeepReadonly<User>, utilisateur: UserNotNull): boolean => {
  if (user?.id === utilisateur.id) {
    return true
  }

  if (!canReadUtilisateurs(user)) {
    return false
  }

  if (isAdministrationEditeur(user) || isAdministrationLecteur(user)) {
    // un utilisateur 'editeur' ou 'lecteur'
    // ne voit que les utilisateurs de son administration
    if (!isAdministration(utilisateur) || utilisateur.administrationId !== user.administrationId) {
      return false
    }
  } else if ((isEntreprise(user) || isBureauDEtudes(user)) && user.entreprises.length) {
    // un utilisateur entreprise
    // ne voit que les utilisateurs de son entreprise
    const entreprisesIds = user.entreprises.map(e => e.id)
    if (!isEntrepriseOrBureauDEtude(utilisateur) || entreprisesIds.every(eId => !utilisateur.entreprises.map(({ id }) => id).includes(eId))) {
      return false
    }
  }

  return true
}
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
