import { z } from 'zod'
import { caminoAnneeValidator, caminoDateValidator } from './date.js'
import { activiteDocumentTypeIdValidator } from './static/documentsTypes.js'
import { sectionWithValueValidator } from './titres.js'
import { activiteStatutIdValidator } from './static/activitesStatuts.js'
import { activiteTypeIdValidator } from './static/activitesTypes.js'
import { tempDocumentNameValidator } from './document.js'

export const activiteSlugValidator = z.string().brand<'ActiviteSlug'>()
export type ActiviteSlug = z.infer<typeof activiteSlugValidator>

export const activiteIdValidator = z.string().brand<'ActiviteId'>()
export type ActiviteId = z.infer<typeof activiteIdValidator>

export const activiteIdOrSlugValidator = z.union([activiteIdValidator, activiteSlugValidator])
export type ActiviteIdOrSlug = z.infer<typeof activiteIdOrSlugValidator>

export const activiteDocumentIdValidator = z.string().brand<'ActiviteDocumentId'>()
export type ActiviteDocumentId = z.infer<typeof activiteDocumentIdValidator>

export const activiteDocumentValidator = z.object({
  id: activiteDocumentIdValidator,
  description: z.string().nullable(),
  date: caminoDateValidator,
  activite_document_type_id: activiteDocumentTypeIdValidator,
})

export type ActiviteDocument = z.infer<typeof activiteDocumentValidator>

export const activiteValidator = z.object({
  id: activiteIdValidator,
  activite_statut_id: activiteStatutIdValidator,
  type_id: activiteTypeIdValidator,
  slug: activiteSlugValidator,
  annee: caminoAnneeValidator,
  date_saisie: caminoDateValidator.nullable(),
  date: caminoDateValidator,
  periode_id: z.number(),
  suppression: z.boolean(),
  deposable: z.boolean(),
  modification: z.boolean(),
  sections_with_value: z.array(sectionWithValueValidator),
  titre: z.object({
    nom: z.string(),
    slug: z.string(),
  }),
  activite_documents: z.array(activiteDocumentValidator),
})
export type Activite = z.infer<typeof activiteValidator>

export const tempActiviteDocumentValidator = activiteDocumentValidator.omit({ id: true }).extend({ tempDocumentName: tempDocumentNameValidator })
export type TempActiviteDocument = z.infer<typeof tempActiviteDocumentValidator>

export const activiteEditionValidator = z.object({
  sectionsWithValue: z.array(sectionWithValueValidator),
  activiteDocumentIds: z.array(activiteDocumentIdValidator),
  newTempDocuments: z.array(tempActiviteDocumentValidator),
})
