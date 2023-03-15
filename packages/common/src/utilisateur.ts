import { Role, ROLES } from './roles.js'
import { AdministrationId, IDS } from './static/administrations.js'
import { z } from 'zod'
import { eidValidator } from './entreprise.js'

export interface QGISToken {
  token?: string
}

export const utilisateurToEdit = z.object({
  id: z.string(),
  role: z.enum<Role, typeof ROLES>(ROLES),
  entreprises: z.array(eidValidator),
  administrationId: z.enum<AdministrationId, typeof IDS>(IDS).nullable(),
})

export type UtilisateurToEdit = z.infer<typeof utilisateurToEdit>
