import { z } from 'zod'

export const communeIdValidator = z.string().brand('Communes')

export type CommuneId = z.infer<typeof communeIdValidator>

export const toCommuneId = (value: string) => communeIdValidator.parse(value)

export const communeValidator = z.object({ id: communeIdValidator, nom: z.string() })
export type Commune = z.infer<typeof communeValidator>