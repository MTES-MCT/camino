/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { DemarcheGet, DemarcheId, demarcheGetValidator } from 'camino-common/src/demarche.js'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IGetDemarcheDbInternalQuery } from './demarches.queries.types.js'
import { Pool } from 'pg'

export const getDemarcheDb = async (pool: Pool, params: { id: DemarcheId }) => {
  return dbQueryAndValidate(getDemarcheDbInternal, params, pool, demarcheGetValidator)
}

const getDemarcheDbInternal = sql<Redefine<IGetDemarcheDbInternalQuery, { id: DemarcheId }, DemarcheGet>>`
select
    d.titre_id,
    d.type_id
from
    titres_demarches d
where
    d.id = $ id
LIMIT 1
`
