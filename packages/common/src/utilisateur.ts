import { Role, ROLES, utilisateurIdValidator } from './roles'
import { AdministrationId, IDS } from './static/administrations'
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
