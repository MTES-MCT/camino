import { IUtilisateur, IUser } from '../../types'

import { permissionCheck } from 'camino-common/src/roles'

const userFormat = (utilisateur: IUtilisateur | null) => {
  if (!utilisateur) return null

  const user = utilisateur as IUser

  const hasPermissions = permissionCheck(user?.role, [
    'super',
    'admin',
    'editeur',
    'lecteur',
    'entreprise'
  ])

  user.sections = {
    travaux: permissionCheck(user?.role, [
      'admin',
      'editeur',
      'lecteur',
      'super'
    ]),
    activites: hasPermissions,
    administrations: permissionCheck(user?.role, [
      'super',
      'admin',
      'editeur',
      'lecteur'
    ]),
    utilisateurs: hasPermissions,
    metas: permissionCheck(user?.role, ['super']),
    journaux: permissionCheck(user?.role, ['super'])
  }

  return user
}

export { userFormat }
