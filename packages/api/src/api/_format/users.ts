import { IUser } from '../../types'

import {
  isAdministration,
  isBureauDEtudes,
  isEntreprise,
  isSuper,
  User
} from 'camino-common/src/roles'

export const userFormat = (utilisateur: User) => {
  if (!utilisateur) return null

  const user = utilisateur as IUser

  user.sections = {
    travaux: isSuper(utilisateur) || isAdministration(utilisateur),
    activites:
      isSuper(utilisateur) ||
      isAdministration(utilisateur) ||
      isEntreprise(utilisateur),
    administrations: isSuper(utilisateur) || isAdministration(utilisateur),
    utilisateurs:
      isSuper(utilisateur) ||
      isAdministration(utilisateur) ||
      isEntreprise(utilisateur) ||
      isBureauDEtudes(utilisateur),
    metas: isSuper(utilisateur),
    journaux: isSuper(utilisateur)
  }

  return user
}
