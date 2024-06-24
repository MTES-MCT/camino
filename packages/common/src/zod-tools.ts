import { z } from 'zod'
import { isNullOrUndefined } from './typescript-tools.js'
import { caminoDateValidator } from './date.js'
import { etapeTypeIdValidator } from './static/etapesTypes.js'

export const nullToDefault =
  <Y>(defaultWhenNullOrUndefined: NoInfer<Y>) =>
  (val: null | undefined | Y): Y => {
    if (isNullOrUndefined(val)) {
      return defaultWhenNullOrUndefined
    }

    return val
  }

export const makeFlattenValidator = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    value: schema,
    heritee: z.boolean(),
    etapeHeritee: z
      .object({
        etapeTypeId: etapeTypeIdValidator,
        date: caminoDateValidator,
        value: schema,
      })
      .nullable(),
  })

export type CaminoZodErrorReadableMessage = string & { __camino: 'ZodReadableMessage' }
export type CaminoError<T extends string> = {
  message: T
  extra?: any
  zodErrorReadableMessage?: CaminoZodErrorReadableMessage
}
