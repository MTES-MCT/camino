import { IUtilisateur, IUser } from '../../types'

import {
  isAdministration,
  isBureauDEtudes,
  isEntreprise,
  isSuper
} from 'camino-common/src/roles'

export const userFormat = (utilisateur: IUtilisateur | null) => {
  if (!utilisateur) return null

  const user = utilisateur as IUser

  user.sections = {
    travaux: isSuper(user) || isAdministration(user),
    activites: isSuper(user) || isAdministration(user) || isEntreprise(user),
    administrations: isSuper(user) || isAdministration(user),
    utilisateurs:
      isSuper(user) ||
      isAdministration(user) ||
      isEntreprise(user) ||
      isBureauDEtudes(user),
    metas: isSuper(user),
    journaux: isSuper(user)
  }

  return user
}
