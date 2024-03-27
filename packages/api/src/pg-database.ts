import { TaggedQuery } from '@pgtyped/runtime'
import type { Pool } from 'pg'
import { z } from 'zod'
import type { ZodType, ZodTypeDef } from 'zod'
import { type Either, Left, type CaminoError, zodParseEither } from 'camino-common/src/either.js'

export type Redefine<T, P, O> = T extends { params: infer A; result: infer B }
  ? { inputs: keyof A; outputs: keyof B } extends { inputs: keyof P; outputs: keyof O }
    ? { inputs: keyof P; outputs: keyof O } extends { inputs: keyof A; outputs: keyof B }
      ? { params: P; result: O }
      : false
    : false
  : false

/** @deprecated use newDbQueryAndValidate and rename once migrated */
export const dbQueryAndValidate = async <Params, Result, T extends ZodType<Result, ZodTypeDef, unknown>>(
  query: TaggedQuery<{ params: Params; result: Result }>,
  params: Params,
  pool: Pool,
  validator: T
): Promise<Result[]> => {
  // eslint-disable-next-line no-restricted-syntax
  const result = await query.run(params, pool)

  return z.array(validator).parse(result)
}

export const newDbQueryAndValidate = async <Params, Result, T extends ZodType<Result, ZodTypeDef, unknown>>(
  query: TaggedQuery<{ params: Params; result: Result }>,
  params: Params,
  pool: Pool,
  validator: T
): Promise<Either<CaminoError, Result[]>> => {
  try {
    // eslint-disable-next-line no-restricted-syntax
    const result = await query.run(params, pool)

    return zodParseEither(z.array(validator), result)
  } catch (e) {
    let extra = ''
    if (typeof e === 'string') {
      extra = e.toUpperCase()
    } else if (e instanceof Error) {
      extra = e.message
    }

    return Left({ message: 'error while accessing the database', extra })
  }
}

