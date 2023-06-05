import { sql } from '@pgtyped/runtime'
import { Redefine } from '../../pg-database.js'
import { z } from 'zod'
import { IGetCommunesQuery } from './communes.queries.types.js'
import { CommuneId, communeIdValidator } from 'camino-common/src/static/communes.js'

export const getCommunesValidator = z.object({ id: communeIdValidator, nom: z.string() })
export type GetCommunesOutput = z.infer<typeof getCommunesValidator>

export const getCommunes = sql<Redefine<IGetCommunesQuery, { ids: CommuneId[] }, GetCommunesOutput>>`
select
    id,
    nom
from
    communes
where
    id in $$ ids
`
