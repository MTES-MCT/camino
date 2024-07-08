/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { DbQueryAccessError, Redefine, effectDbQueryAndValidate } from '../../pg-database.js'
import { Pool } from 'pg'
import { z } from 'zod'
import { IInsertLogInternalQuery } from './logs.queries.types.js'
import { UtilisateurId } from 'camino-common/src/roles.js'
import { CaminoError } from 'camino-common/src/zod-tools.js'
import { ZodUnparseable } from '../../tools/fp-tools.js'
import { Effect } from 'effect'

export const addLog = (pool: Pool, utilisateur_id: UtilisateurId, method: string, path: string, body?: unknown): Effect.Effect<void[], CaminoError<ZodUnparseable | DbQueryAccessError>> =>
  effectDbQueryAndValidate(insertLogInternal, { utilisateur_id, method, path, body }, pool, z.void())

const insertLogInternal = sql<
  Redefine<
    IInsertLogInternalQuery,
    {
      utilisateur_id: UtilisateurId
      method: string
      path: string
      body?: unknown
    },
    void
  >
>`
insert into logs (utilisateur_id, path, method, body)
    values ($ utilisateur_id !, $path !, $ method !, $ body)
;
`
