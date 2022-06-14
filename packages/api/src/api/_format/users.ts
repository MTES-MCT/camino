import { IUtilisateur, IUser } from '../../types'

import {
  isAdministration,
  isEntreprise,
  isSuper
} from 'camino-common/src/roles'

export const userFormat = (utilisateur: IUtilisateur | null) => {
  if (!utilisateur) return null

  const user = utilisateur as IUser

  const hasPermissions =
    isSuper(user) || isAdministration(user) || isEntreprise(user)

  user.sections = {
    travaux: isSuper(user) || isAdministration(user),
    activites: hasPermissions,
    administrations: isSuper(user) || isAdministration(user),
    utilisateurs: hasPermissions,
    metas: isSuper(user),
    journaux: isSuper(user)
  }

  return user
}
