import { z } from 'zod'

export const tempDocumentNameValidator = z.string().brand('TempDocumentName')

export type TempDocumentName = z.infer<typeof tempDocumentNameValidator>
