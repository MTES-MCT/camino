/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IGetCommunesInternalQuery, IInsertCommuneInternalQuery } from './communes.queries.types.js'
import { CommuneId, Commune, communeValidator } from 'camino-common/src/static/communes.js'
import { NonEmptyArray } from 'camino-common/src/typescript-tools.js'
import { Pool } from 'pg'
import { z } from 'zod'

export const getCommunes = async (pool: Pool, params: { ids: NonEmptyArray<CommuneId> }) => {
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

export const insertCommune = async (pool: Pool, params: { id: CommuneId; nom: string }) => {
  return dbQueryAndValidate(insertCommuneInternal, params, pool, z.void())
}
const insertCommuneInternal = sql<Redefine<IInsertCommuneInternalQuery, { id: CommuneId; nom: string }, void>>`
insert into communes (id, nom)
    values ($ id, $ nom)
`
