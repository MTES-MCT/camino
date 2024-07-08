import { CaminoError, CaminoZodErrorReadableMessage } from 'camino-common/src/zod-tools.js'
import { Cause, Effect, Exit, pipe } from 'effect'
import { ZodTypeAny } from 'zod'
import { fromError } from 'zod-validation-error'

export type ZodUnparseable = 'Problème de validation de données'

export const zodParseEffectCallback =
  <T extends ZodTypeAny>(validator: T) =>
  (value: unknown): Effect.Effect<T['_output'], CaminoError<ZodUnparseable>> =>
    zodParseEffect(validator, value)

export const zodParseEffect = <T extends ZodTypeAny>(validator: T, item: unknown): Effect.Effect<T['_output'], CaminoError<ZodUnparseable>> => {
  return Effect.try({
    try: () => validator.parse(item),
    catch: myError => ({ message: 'Problème de validation de données', zodErrorReadableMessage: fromError(myError).toString() as CaminoZodErrorReadableMessage }),
  })
}

export const callAndExit = async <A, T>(toCall: Effect.Effect<A, CaminoError<string>, never>, success: (value: A) => Promise<T>) => {
  const pipeline = await pipe(toCall, Effect.runPromiseExit)

  if (Exit.isSuccess(pipeline)) {
    return success(pipeline.value)
  } else {
    if (Cause.isFailType(pipeline.cause)) {
      throw new Error(pipeline.cause.error.message)
    } else {
      throw new Error(`Unexpected error ${pipeline.cause}`)
    }
  }
}
