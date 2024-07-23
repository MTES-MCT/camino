/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { DbQueryAccessError, Redefine, effectDbQueryAndValidate } from '../../pg-database'
import { Pool } from 'pg'
import { z } from 'zod'
import { IInsertLogInternalQuery } from './logs.queries.types'
import { UtilisateurId } from 'camino-common/src/roles'
import { CaminoError } from 'camino-common/src/zod-tools'
import { ZodUnparseable } from '../../tools/fp-tools'
import { Effect } from 'effect'

type Log = {
  utilisateur_id: UtilisateurId
  method: string
  path: string
  body: any
}
export const addLog = (pool: Pool, utilisateur_id: UtilisateurId, method: string, path: string, body: any): Effect.Effect<void[], CaminoError<ZodUnparseable | DbQueryAccessError>> => effectDbQueryAndValidate(insertLogInternal, { utilisateur_id, method, path, body }, pool, z.void())

const insertLogInternal = sql<
  Redefine<
    IInsertLogInternalQuery,
    Log,
    void
  >
>`
insert into logs (utilisateur_id, path, method, body)
    values ($ utilisateur_id !, $path !, $ method !, $ body)
;
`
