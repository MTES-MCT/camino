import { sql } from '@pgtyped/runtime'
import { Redefine } from '../../pg-database.js'
import { IGetCommunesQuery, IInsertCommuneQuery } from './communes.queries.types.js'
import { CommuneId, Commune } from 'camino-common/src/static/communes.js'
import { NonEmptyArray } from 'camino-common/src/typescript-tools.js'



export const getCommunes = sql<Redefine<IGetCommunesQuery, { ids: NonEmptyArray<CommuneId> }, Commune>>`
select
    id,
    nom
from
    communes
where
    id in $$ ids
`

export const insertCommune = sql<Redefine<IInsertCommuneQuery, { id: CommuneId, nom: string }, void>>`
insert into communes (id, nom) values ($id, $nom)
`
