import { referenceTypeIdValidator } from './static/referencesTypes.js'
import { z } from 'zod'

export const titreReferenceValidator = z.object({
  nom: z.string(),
  referenceTypeId: referenceTypeIdValidator,
})

export type TitreReference = z.infer<typeof titreReferenceValidator>
