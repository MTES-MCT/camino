import { administrationIdValidator } from './static/administrations.js'
import { entrepriseIdValidator } from './entreprise.js'
import { z } from 'zod'

export const ROLES = ['super', 'admin', 'editeur', 'lecteur', 'entreprise', 'bureau d’études', 'defaut'] as const
export type Role = (typeof ROLES)[number]
type UserEntreprise = { role: 'entreprise' } & EntrepriseUserNotNull
type UserBureaudEtudes = { role: 'bureau d’études' } & EntrepriseUserNotNull
type UserAdmin = { role: 'admin' } & AdminUserNotNull
type UserLecteur = { role: 'lecteur' } & AdminUserNotNull
type UserEditeur = { role: 'editeur' } & AdminUserNotNull

export const utilisateurIdValidator = z.string().brand('UtilisateurId')
export type UtilisateurId = z.infer<typeof utilisateurIdValidator>

export const toUtilisateurId = (utilisateurId: string): UtilisateurId => utilisateurIdValidator.parse(utilisateurId)

const baseUserNotNullValidator = z.object({ id: utilisateurIdValidator, email: z.string(), role: z.enum(ROLES), nom: z.string(), prenom: z.string() })
export type BaseUserNotNull = z.infer<typeof baseUserNotNullValidator>

const superRoleValidator = z.literal('super')
export type SuperRole = z.infer<typeof superRoleValidator>
const superUserNotNullValidator = baseUserNotNullValidator.extend({ role: superRoleValidator })
export type UserSuper = z.infer<typeof superUserNotNullValidator>

const defautRoleValidator = z.literal('defaut')
export type defautRole = z.infer<typeof defautRoleValidator>
const defautUserNotNullValidator = baseUserNotNullValidator.extend({ role: defautRoleValidator })
export type UserDefaut = z.infer<typeof defautUserNotNullValidator>

const ADMINISTRATION_ROLES = ['admin', 'editeur', 'lecteur'] as const satisfies readonly Role[]
const administrationRoleValidator = z.enum(ADMINISTRATION_ROLES)
export type AdministrationRole = z.infer<typeof administrationRoleValidator>

const adminUserNotNullValidator = baseUserNotNullValidator.extend({ role: administrationRoleValidator, administrationId: administrationIdValidator })
export type AdminUserNotNull = z.infer<typeof adminUserNotNullValidator>

const ENTREPRISE_ROLES = ['entreprise', 'bureau d’études'] as const satisfies readonly Role[]
const entrepriseRoleValidator = z.enum(ENTREPRISE_ROLES)
export type EntrepriseOrBureauDetudeRole = z.infer<typeof entrepriseRoleValidator>
const entrepriseUserNotNullValidator = baseUserNotNullValidator.extend({ role: entrepriseRoleValidator, entreprises: z.array(z.object({ id: entrepriseIdValidator })) })

export type EntrepriseUserNotNull = z.infer<typeof entrepriseUserNotNullValidator>
export const userNotNullValidator = z.union([superUserNotNullValidator, defautUserNotNullValidator, adminUserNotNullValidator, entrepriseUserNotNullValidator])
export const userValidator = userNotNullValidator.nullable().optional()

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

export type User = z.infer<typeof userValidator>
export type UserNotNull = z.infer<typeof userNotNullValidator>

export const isAdministrationRole = (role: Role): role is AdministrationRole => administrationRoleValidator.safeParse(role).success
export const isAdministrationAdminRole = (role: Role): role is 'admin' => role === 'admin'
export const isSuperRole = (role: Role): role is 'super' => role === 'super'
export const isDefautRole = (role: Role): role is 'defaut' => role === 'defaut'

export const isEntrepriseOrBureauDetudeRole = (role: Role): role is EntrepriseOrBureauDetudeRole => entrepriseRoleValidator.safeParse(role).success
