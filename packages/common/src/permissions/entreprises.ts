import { EntrepriseId } from '../entreprise'
import { isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, User, isSuper, isAdministration } from '../roles'

export const canCreateEntreprise = (user: User): boolean => {
  if (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return true
  }

  return false
}

export const canEditEntreprise = (user: User, entrepriseId?: EntrepriseId): boolean => {
  if (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return true
  }

  if (isEntreprise(user) || isBureauDEtudes(user)) {
    return user.entrepriseIds.includes(entrepriseId)
  }

  return false
}

export const canSeeEntrepriseDocuments = (user: User, entrepriseId: EntrepriseId): boolean => {
  if (isSuper(user) || isAdministration(user)) {
    return true
  }

  if (isEntreprise(user) || isBureauDEtudes(user)) {
    return user.entrepriseIds.includes(entrepriseId)
  }

  return false
}
