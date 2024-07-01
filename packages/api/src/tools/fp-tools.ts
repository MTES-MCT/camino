import { CaminoError, CaminoZodErrorReadableMessage } from 'camino-common/src/zod-tools.js'
import E from 'fp-ts/lib/Either.js'
import TE from 'fp-ts/lib/TaskEither.js'
import { ZodTypeAny } from 'zod'
import { fromError } from 'zod-validation-error'

export type ZodUnparseable = 'Problème de validation de données'
export const zodParseEitherCallback =
  <T extends ZodTypeAny>(validator: T) =>
  (value: unknown): E.Either<CaminoError<ZodUnparseable>, T['_output']> =>
    zodParseEither(validator, value)

export const zodParseTaskEitherCallback =
  <T extends ZodTypeAny>(validator: T) =>
  (value: unknown): TE.TaskEither<CaminoError<ZodUnparseable>, T['_output']> =>
    zodParseTaskEither(validator, value)

export const zodParseEither = <T extends ZodTypeAny>(validator: T, item: unknown): E.Either<CaminoError<ZodUnparseable>, T['_output']> => {
  return E.tryCatch(
    () => validator.parse(item),
    myError => ({ message: 'Problème de validation de données', zodErrorReadableMessage: fromError(myError).toString() as CaminoZodErrorReadableMessage })
  )
}

export const zodParseTaskEither = <T extends ZodTypeAny>(validator: T, item: unknown): TE.TaskEither<CaminoError<ZodUnparseable>, T['_output']> => {
  return TE.fromEither(zodParseEither(validator, item))
}
