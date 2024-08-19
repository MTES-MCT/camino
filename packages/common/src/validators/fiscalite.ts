import Decimal from 'decimal.js'
import { z } from 'zod'

export const decimalValidator = z
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
    taxeAurifereBrute: decimalValidator,
    totalInvestissementsDeduits: decimalValidator,
    taxeAurifere: decimalValidator,
  }),
})
export type FiscaliteGuyane = z.infer<typeof fiscaliteGuyaneValidator>

export const fiscaliteValidator = z.union([fiscaliteGuyaneValidator, fiscaliteFranceValidator])
export type Fiscalite = z.infer<typeof fiscaliteValidator>
