import { z } from 'zod'


export const titreIdValidator = z.string().brand<'TitreId'>()
export type TitreId = z.infer<typeof titreIdValidator>

export const titreSlugValidator = z.string().brand<'TitreSlug'>()
export type TitreSlug = z.infer<typeof titreSlugValidator>
export const titreIdOrSlugValidator = z.union([titreSlugValidator, titreIdValidator])
export type TitreIdOrSlug = z.infer<typeof titreIdOrSlugValidator>
