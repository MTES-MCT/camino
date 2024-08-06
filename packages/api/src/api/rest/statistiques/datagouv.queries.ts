import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../../pg-database'
import { Pool } from 'pg'
import { z } from 'zod'
import { roleValidator } from 'camino-common/src/roles'
import { administrationIdValidator } from 'camino-common/src/static/administrations'
import { IGetUtilisateursStatsDbQuery } from './datagouv.queries.types'

export const getUtilisateursStats = async (pool: Pool) => dbQueryAndValidate(getUtilisateursStatsDb, undefined, pool, getUtilisateursStatsValidator)

const getUtilisateursStatsValidator = z.object({ role: roleValidator, administration_id: administrationIdValidator.nullable() })
type GetUtilisateursStats = z.infer<typeof getUtilisateursStatsValidator>
const getUtilisateursStatsDb = sql<Redefine<IGetUtilisateursStatsDbQuery, void, GetUtilisateursStats>>`
select
    u.role,
    u.administration_id
from
    utilisateurs u
where
    u.email is not null
    and u.role != 'super'
`
