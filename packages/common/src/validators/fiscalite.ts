import { z } from 'zod'

const fiscaliteFranceValidator = z.object({
  redevanceCommunale: z.number(),
  redevanceDepartementale: z.number(),
})
export type FiscaliteFrance = z.infer<typeof fiscaliteFranceValidator>

const fiscaliteGuyaneValidator = fiscaliteFranceValidator.extend({
  guyane: z.object({
    taxeAurifereBrute: z.number(),
    totalInvestissementsDeduits: z.number(),
    taxeAurifere: z.number(),
  }),
})
export type FiscaliteGuyane = z.infer<typeof fiscaliteGuyaneValidator>

export const fiscaliteValidator = z.union([fiscaliteFranceValidator, fiscaliteGuyaneValidator])
export type Fiscalite = z.infer<typeof fiscaliteValidator>
