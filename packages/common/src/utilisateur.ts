import { Role, ROLES, roleValidator, userNotNullValidator, utilisateurIdValidator } from './roles'
import { AdministrationId, administrationIdValidator, IDS } from './static/administrations'
import { z } from 'zod'
import { entrepriseIdValidator } from './entreprise'

export const qgisTokenValidator = z.object({ token: z.string(), url: z.string() })
export type QGISToken = z.infer<typeof qgisTokenValidator>

export const utilisateurToEdit = z.object({
  id: utilisateurIdValidator,
  role: z.enum<Role, typeof ROLES>(ROLES),
  entreprises: z.array(entrepriseIdValidator),
  administrationId: z.enum<AdministrationId, typeof IDS>(IDS).nullable(),
})

export type UtilisateurToEdit = z.infer<typeof utilisateurToEdit>

export const newsletterAbonnementValidator = z.object({ newsletter: z.boolean() })

export const newsletterRegistrationValidator = z.object({
  email: z.string(),
})

export const utilisateurValidator = userNotNullValidator.and(
  z.object({
    telephoneMobile: z.string().nullable(),
    telephoneFixe: z.string().nullable(),
  })
)

export type Utilisateur = z.infer<typeof utilisateurValidator>
export const utilisateursTableValidator = z.object({
  elements: z.array(utilisateurValidator),
  total: z.number(),
})
export type UtilisateursTable = z.infer<typeof utilisateursTableValidator>

const utilisateursColonneIdSortable = z.enum(['nom', 'prenom', 'email', 'role'])
export type UtilisateursColonneIdSortable = z.infer<typeof utilisateursColonneIdSortable>

const tableSearchParamsValidator = z.object({
  page: z.coerce.number().optional().default(1),
  intervalle: z.coerce.number().optional().default(10),
  colonne: utilisateursColonneIdSortable.optional().default('nom'),
  ordre: z.enum(['asc', 'desc']).optional().default('asc'),
})

export const utilisateursSearchParamsValidator = tableSearchParamsValidator.and(
  z.object({
    nomsUtilisateurs: z.string().optional(),
    emails: z.string().optional(),
    roles: z.array(roleValidator).optional(),
    administrationIds: z.array(administrationIdValidator).optional(),
    entreprisesIds: z.array(entrepriseIdValidator).optional(),
  })
)
export type UtilisateursSearchParamsInput = (typeof utilisateursSearchParamsValidator)['_input']
export type UtilisateursSearchParams = z.infer<typeof utilisateursSearchParamsValidator>
