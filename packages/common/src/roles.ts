import { AdministrationId } from './static/administrations'
import { EntrepriseId } from './entreprise'

export const ROLES = ['super', 'admin', 'editeur', 'lecteur', 'entreprise', 'bureau d’études', 'defaut'] as const
export type Role = (typeof ROLES)[number]
type UserEntreprise = { role: 'entreprise' } & EntrepriseUserNotNull
type UserBureaudEtudes = { role: 'bureau d’études' } & EntrepriseUserNotNull
type UserAdmin = { role: 'admin' } & AdminUserNotNull
type UserLecteur = { role: 'lecteur' } & AdminUserNotNull
type UserEditeur = { role: 'editeur' } & AdminUserNotNull
export type UserSuper = { role: 'super' } & BaseUserNotNull
export type UserDefaut = { role: 'defaut' } & BaseUserNotNull

export interface BaseUserNotNull {
  id: string
  email: string
  role: Role
  nom: string
  prenom: string
}
type Extends<T, U extends T> = U
export type AdministrationRole = Extends<Role, 'admin' | 'editeur' | 'lecteur'>
export interface AdminUserNotNull extends BaseUserNotNull {
  role: AdministrationRole
  administrationId: AdministrationId
}

export type EntrepriseOrBureauDetudeRole = Extends<Role, 'entreprise' | 'bureau d’études'>
export interface EntrepriseUserNotNull extends BaseUserNotNull {
  role: EntrepriseOrBureauDetudeRole
  entreprises: { id: EntrepriseId }[]
}

export const isSuper = (user: User): user is UserSuper => userPermissionCheck(user, 'super')

export const isAdministration = (user: User): user is UserLecteur | UserAdmin | UserEditeur => isAdministrationAdmin(user) || isAdministrationEditeur(user) || isAdministrationLecteur(user)
export const isAdministrationAdmin = (user: User): user is UserAdmin => userPermissionCheck(user, 'admin')
export const isAdministrationEditeur = (user: User): user is UserEditeur => userPermissionCheck(user, 'editeur')
export const isAdministrationLecteur = (user: User): user is UserLecteur => userPermissionCheck(user, 'lecteur')
export const isEntrepriseOrBureauDEtude = (user: User): user is UserEntreprise | UserBureaudEtudes => isEntreprise(user) || isBureauDEtudes(user)

export const isEntreprise = (user: User): user is UserEntreprise => userPermissionCheck(user, 'entreprise')
export const isBureauDEtudes = (user: User): user is UserBureaudEtudes => userPermissionCheck(user, 'bureau d’études')
export const isDefault = (user: User): user is UserDefaut | undefined => !user || userPermissionCheck(user, 'defaut')

export const isRole = (role: Role | string | undefined | null): role is Role => ROLES.includes(role)

function userPermissionCheck(user: User, role: Role) {
  return user?.role === role
}

export type User = UserNotNull | undefined | null
export type UserNotNull = UserSuper | UserDefaut | AdminUserNotNull | EntrepriseUserNotNull

export const isAdministrationRole = (role: Role): role is AdministrationRole => ['admin', 'editeur', 'lecteur'].includes(role)
export const isAdministrationAdminRole = (role: Role): role is 'admin' => role === 'admin'
export const isSuperRole = (role: Role): role is 'super' => role === 'super'
export const isDefautRole = (role: Role): role is 'defaut' => role === 'defaut'

export const isEntrepriseOrBureauDetudeRole = (role: Role): role is EntrepriseOrBureauDetudeRole => ['entreprise', 'bureau d’études'].includes(role)
