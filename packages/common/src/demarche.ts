import { z } from 'zod'
import { demarcheTypeIdValidator } from './static/demarchesTypes.js'
import { titreIdValidator } from './titres.js'

export const demarcheIdValidator = z.string().brand<'DemarcheId'>()
export type DemarcheId = z.infer<typeof demarcheIdValidator>

export const commonDemarcheValidator = z.object({
  id: z.string(),
  titre_id: titreIdValidator,
  type_id: demarcheTypeIdValidator,
})
export type CommonDemarche = z.infer<typeof commonDemarcheValidator>

export const demarcheGetValidator = commonDemarcheValidator.pick({ type_id: true, titre_id: true })
export type DemarcheGet = z.infer<typeof demarcheGetValidator>
