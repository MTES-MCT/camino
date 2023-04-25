import { sql } from '@pgtyped/runtime'
import { DemarcheGet } from 'camino-common/src/demarche'
import { Redefine } from '../../pg-database'
import { IGetDemarcheDbQuery } from './demarches.queries.types'

export const getDemarcheDb = sql<Redefine<IGetDemarcheDbQuery, { id: string }, DemarcheGet>>`
select
    d.titre_id,
    d.type_id
from
    titres_demarches d
where
    d.id = $ id
LIMIT 1
`
