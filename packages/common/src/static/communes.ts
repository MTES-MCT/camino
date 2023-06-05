import { z } from 'zod'

export const communeIdValidator = z.string().brand('Communes')

export type CommuneId = z.infer<typeof communeIdValidator>

export const toCommuneId = (value: string) => communeIdValidator.parse(value)
