export const ROLES = [
  'super',
  'admin',
  'editeur',
  'lecteur',
  'entreprise',
  'bureau d’études',
  'defaut'
] as const
export type Role = typeof ROLES[number]
type UserEntreprise = { role: 'entreprise' }
type UserBureaudEtudes = { role: 'bureau d’études' }
type UserAdmin = { role: 'admin' }
type UserLecteur = { role: 'lecteur' }
type UserEditeur = { role: 'editeur' }
type UserSuper = { role: 'super' }
type UserDefaut = { role: 'defaut' }

type User =
  | UserSuper
  | UserAdmin
  | UserEditeur
  | UserLecteur
  | UserEntreprise
  | UserBureaudEtudes
  | UserDefaut
  | undefined
  | null

export const isSuper = (user: User): user is UserSuper =>
  userPermissionCheck(user, 'super')

export const isAdministration = (
  user: User
): user is UserLecteur | UserAdmin | UserEditeur =>
  isAdministrationAdmin(user) ||
  isAdministrationEditeur(user) ||
  isAdministrationLecteur(user)
export const isAdministrationAdmin = (user: User): user is UserAdmin =>
  userPermissionCheck(user, 'admin')
export const isAdministrationEditeur = (user: User): user is UserEditeur =>
  userPermissionCheck(user, 'editeur')
export const isAdministrationLecteur = (user: User): user is UserLecteur =>
  userPermissionCheck(user, 'lecteur')
export const isEntreprise = (user: User): user is UserEntreprise =>
  userPermissionCheck(user, 'entreprise')
export const isBureauDEtudes = (user: User): user is UserBureaudEtudes =>
  userPermissionCheck(user, 'bureau d’études')
export const isDefault = (user: User): user is UserDefaut | undefined =>
  !user || userPermissionCheck(user, 'defaut')

export const isRole = (role: Role | string | undefined | null): role is Role =>
  ROLES.includes(role)

function userPermissionCheck(user: User, role: Role) {
  return user?.role === role
}
