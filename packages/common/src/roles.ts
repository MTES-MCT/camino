import { AdministrationId } from './administrations'
import { isNotNullNorUndefined } from './typescript-tools'
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
type UserEntreprise = { role: 'entreprise'; administrationId: undefined }
type UserBureaudEtudes = {
  role: 'bureau d’études'
  administrationId: undefined
}
type UserAdmin = { role: 'admin'; administrationId: AdministrationId }
type UserLecteur = { role: 'lecteur'; administrationId: AdministrationId }
type UserEditeur = { role: 'editeur'; administrationId: AdministrationId }
type UserSuper = { role: 'super'; administrationId: undefined }
type UserDefaut = { role: 'defaut'; administrationId: undefined }

type User =
  | { role: Role; administrationId: undefined | null | AdministrationId }
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
  userPermissionCheck(user, 'admin') &&
  isNotNullNorUndefined(user?.administrationId)
export const isAdministrationEditeur = (user: User): user is UserEditeur =>
  userPermissionCheck(user, 'editeur') &&
  isNotNullNorUndefined(user?.administrationId)
export const isAdministrationLecteur = (user: User): user is UserLecteur =>
  userPermissionCheck(user, 'lecteur') &&
  isNotNullNorUndefined(user?.administrationId)
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
