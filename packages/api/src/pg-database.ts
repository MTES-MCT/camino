import { TaggedQuery } from '@pgtyped/runtime'

import type { Pool } from 'pg'
import { z } from 'zod'
import type { ZodType, ZodTypeDef } from 'zod'
import { CaminoError } from 'camino-common/src/zod-tools'
import { zodParseEffect } from './tools/fp-tools'
import { Effect, Match, pipe } from 'effect'
export type Redefine<T, P, O> = T extends { params: infer A; result: infer B }
  ? { inputs: keyof A; outputs: keyof B } extends { inputs: keyof P; outputs: keyof O }
    ? { inputs: keyof P; outputs: keyof O } extends { inputs: keyof A; outputs: keyof B }
      ? { params: P; result: O }
      : { __camino_error: 'toutes les clés de redefine ne sont pas présentes dans pgtyped' }
    : { __camino_error: 'toutes les clés de pgtyped ne sont pas présentes dans redefine' }
  : { __camino_error: 'on a pas params et result' }

/**
 * @deprecated use newDbQueryAndValidate
 */
export const dbQueryAndValidate = async <Params, Result, T extends ZodType<Result, ZodTypeDef, unknown>>(
  query: TaggedQuery<{ params: Params; result: Result }>,
  params: Params,
  pool: Pool,
  validator: T
): Promise<Result[]> => {
  const result = await query.run(params, pool)

  return z.array(validator).parse(result)
}

export const dbNotFoundError = 'Élément non trouvé dans la base de données' as const
export type DBNotFound = typeof dbNotFoundError
type DbQueryAccessError = "Impossible d'exécuter la requête dans la base de données"
type DbResponseUnparseable = 'Les données en base ne correspondent pas à ce qui est attendu'
export type EffectDbQueryAndValidateErrors = DbQueryAccessError | DbResponseUnparseable
export const effectDbQueryAndValidate = <Params, Result, T extends ZodType<Result, ZodTypeDef, unknown>>(
  query: TaggedQuery<{ params: Params; result: Result }>,
  params: Params,
  pool: Pool,
  validator: T
): Effect.Effect<Result[], CaminoError<EffectDbQueryAndValidateErrors>> => {
  return pipe(
    Effect.tryPromise({
      try: () => query.run(params, pool),
      catch: e => {
        let extra = ''
        if (typeof e === 'string') {
          extra = e.toUpperCase()
        } else if (e instanceof Error) {
          extra = e.message
        }

        return { message: "Impossible d'exécuter la requête dans la base de données" as const, extra }
      },
    }),
    Effect.flatMap(result =>
      zodParseEffect(z.array(validator), result).pipe(
        Effect.mapError(caminoError =>
          Match.value(caminoError.message).pipe(
            Match.when('Problème de validation de données', () => ({ ...caminoError, message: 'Les données en base ne correspondent pas à ce qui est attendu' as const })),
            Match.exhaustive
          )
        )
      )
    )
  )
}
