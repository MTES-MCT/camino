import Decimal from 'decimal.js'
import { z } from 'zod'

const decimalValidator = z
  .any()
  .transform((value, ctx) => {
    try {
      return Decimal.isDecimal(value) ? value : new Decimal(value)
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Not a number',
      })

      return undefined
    }
  })
  .refine(Decimal.isDecimal)
const fiscaliteFranceValidator = z.object({
  redevanceCommunale: decimalValidator,
  redevanceDepartementale: decimalValidator,
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
