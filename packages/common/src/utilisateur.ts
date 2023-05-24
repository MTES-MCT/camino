import { Role, ROLES } from './roles.js'
import { AdministrationId, IDS } from './static/administrations.js'
import { z } from 'zod'
import { entrepriseIdValidator } from './entreprise.js'

export const qgisTokenValidator = z.object({ token: z.string().optional() })
export type QGISToken = z.infer<typeof qgisTokenValidator>

export const utilisateurToEdit = z.object({
  id: z.string(),
  role: z.enum<Role, typeof ROLES>(ROLES),
  entreprises: z.array(entrepriseIdValidator),
  administrationId: z.enum<AdministrationId, typeof IDS>(IDS).nullable(),
})

export type UtilisateurToEdit = z.infer<typeof utilisateurToEdit>
