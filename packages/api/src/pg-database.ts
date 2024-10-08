import { TaggedQuery } from '@pgtyped/runtime'

import type { Pool } from 'pg'
import { z } from 'zod'
import type { ZodType, ZodTypeDef } from 'zod'
import { CaminoError } from 'camino-common/src/zod-tools'
import { ZodUnparseable, zodParseEffectCallback } from './tools/fp-tools'
import { Effect, pipe } from 'effect'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
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

export type DbQueryAccessError = "Impossible d'accéder à la base de données"

export const effectDbQueryAndValidate = <Params, Result, T extends ZodType<Result, ZodTypeDef, unknown>>(
  query: TaggedQuery<{ params: DeepReadonly<Params>; result: Result }>,
  params: DeepReadonly<Params>,
  pool: Pool,
  validator: T
): Effect.Effect<Result[], CaminoError<DbQueryAccessError | ZodUnparseable>> => {
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

        return { message: "Impossible d'accéder à la base de données" as const, extra }
      },
    }),
    Effect.flatMap(zodParseEffectCallback(z.array(validator)))
  )
}
