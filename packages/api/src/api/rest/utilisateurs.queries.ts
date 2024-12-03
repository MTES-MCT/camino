import { sql } from '@pgtyped/runtime'
import { QGISToken } from 'camino-common/src/utilisateur'
import { CaminoError } from 'camino-common/src/zod-tools'
import { Effect, pipe } from 'effect'
import { Pool } from 'pg'
import { z } from 'zod'
import { effectDbQueryAndValidate, EffectDbQueryAndValidateErrors, Redefine } from '../../pg-database'
import { UserNotNull, UtilisateurId } from 'camino-common/src/roles'
import bcrypt from 'bcryptjs'
import { IUpdateQgisTokenInternalQuery } from './utilisateurs.queries.types'

export const updateQgisToken = (pool: Pool, user: UserNotNull, qgisToken: QGISToken): Effect.Effect<boolean, CaminoError<EffectDbQueryAndValidateErrors>> =>
  pipe(
    effectDbQueryAndValidate(updateQgisTokenInternal, { user_id: user.id, qgisToken: bcrypt.hashSync(qgisToken, 10) }, pool, z.void()),
    Effect.map(() => true)
  )

const updateQgisTokenInternal = sql<Redefine<IUpdateQgisTokenInternalQuery, { user_id: UtilisateurId; qgisToken: string }, void>>`UPDATE utilisateurs set qgis_token=$qgisToken! where id=$user_id!`
