import { z, ZodNumber } from 'zod'

export const numberFormat = (number: number): string =>
  Intl.NumberFormat('FR-fr', {
    maximumSignificantDigits: 21,
  }).format(number)

const beginIndex = 'A'.charCodeAt(0)
/**
 * On s'en sert pour afficher les points automatiquement, de A, à ZZZZZZZ
 */
export const indexToLetter = (value: number): string => {
  const base26ValueArray = Array.from(value.toString(26))

  return base26ValueArray
    .map((value, index) => {
      if (index === base26ValueArray.length - 1) {
        return String.fromCharCode(beginIndex + parseInt(value, 26))
      }

      return String.fromCharCode(beginIndex + parseInt(value, 26) - 1)
    })
    .join('')
}

export const toDegresMinutes = (value: number): { degres: number; minutes: number } => {
  const degres = Math.trunc(value)
  const minutes = Math.abs((value - degres) * 60)

  return {
    degres,
    minutes: Number.parseFloat(minutes.toFixed(4)),
  }
}

export const km2Validator = z.number().nonnegative().brand('CAMINO_KM2')
export const createM2Validator = (v: ZodNumber): z.ZodBranded<z.ZodEffects<z.ZodNumber, number, number>, 'CAMINO_M2'> => v.transform(value => parseInt(`${value}`)).brand('CAMINO_M2')
export const m2Validator = createM2Validator(z.number())

export const ZERO_KM2 = km2Validator.parse(0)
export type KM2 = z.infer<typeof km2Validator>
export type M2 = z.infer<typeof m2Validator>

export const m2toKm2 = (m2: M2): KM2 => km2Validator.parse(m2 / 1000000)

export const hectareValidator = z.number().nonnegative().brand('CAMINO_HECTARE')
export type Hectare = z.infer<typeof hectareValidator>
export const km2toHectare = (km2: KM2): Hectare => hectareValidator.parse(km2 * 100)
export const hectareToKm2 = (hectare: Hectare): KM2 => km2Validator.parse(hectare / 100)
