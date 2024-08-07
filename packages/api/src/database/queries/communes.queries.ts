import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database'
import { IGetCommuneIdsInternalQuery, IGetCommunesInternalQuery, IInsertCommuneInternalQuery } from './communes.queries.types'
import { CommuneId, Commune, communeValidator } from 'camino-common/src/static/communes'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'
import { Pool } from 'pg'
import { z } from 'zod'

export const getCommunes = async (pool: Pool, params: { ids: NonEmptyArray<CommuneId> }): Promise<{ id: CommuneId; nom: string }[]> => {
  return dbQueryAndValidate(getCommunesInternal, params, pool, communeValidator)
}

const getCommunesInternal = sql<Redefine<IGetCommunesInternalQuery, { ids: NonEmptyArray<CommuneId> }, Commune>>`
select
    id,
    nom
from
    communes
where
    id in $$ ids
`

export const getCommuneIds = async (pool: Pool): Promise<CommuneId[]> => {
  return (await dbQueryAndValidate(getCommuneIdsInternal, undefined, pool, communeValidator.pick({ id: true }))).map(({ id }) => id)
}

const getCommuneIdsInternal = sql<Redefine<IGetCommuneIdsInternalQuery, undefined, Pick<Commune, 'id'>>>`
select
    id
from
    communes
`

export const insertCommune = async (pool: Pool, params: { id: CommuneId; nom: string; geometry: string }): Promise<void> => {
  await dbQueryAndValidate(insertCommuneInternal, params, pool, z.void())
}
const insertCommuneInternal = sql<Redefine<IInsertCommuneInternalQuery, { id: CommuneId; nom: string; geometry: string }, void>>`
insert into communes (id, nom, geometry)
    values ($ id !, $ nom !, $ geometry !)
`
