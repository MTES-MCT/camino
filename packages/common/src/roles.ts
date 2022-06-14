export const ROLES = [
  'super',
  'admin',
  'editeur',
  'lecteur',
  'entreprise',
  'defaut'
] as const
export type Role = typeof ROLES[keyof typeof ROLES]

type User = { role: Role } | undefined | null

export const isSuper = (user: User) => userPermissionCheck(user, 'super')
export const isAdministration = (user: User) =>
  isAdministrationAdmin(user) ||
  isAdministrationEditeur(user) ||
  isAdministrationLecteur(user)
export const isAdministrationAdmin = (user: User) =>
  userPermissionCheck(user, 'admin')
export const isAdministrationEditeur = (user: User) =>
  userPermissionCheck(user, 'editeur')
export const isAdministrationLecteur = (user: User) =>
  userPermissionCheck(user, 'lecteur')
export const isEntreprise = (user: User) =>
  userPermissionCheck(user, 'entreprise')
export const isDefault = (user: User) =>
  !user || userPermissionCheck(user, 'defaut')

function userPermissionCheck(user: User, role: Role) {
  return user?.role === role
}
