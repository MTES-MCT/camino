import { dbQueryAndValidate } from '../../pg-database.js'
import { CommuneId, communeValidator } from 'camino-common/src/static/communes.js'
import { Pool } from 'pg'
import { getCommunes } from './communes.queries.js'
import { isNonEmptyArray } from 'camino-common/src/typescript-tools.js'

export const getCommunesIndex = async (pool: Pool, ids: CommuneId[]): Promise<Record<CommuneId, string>> => {
  const communes = isNonEmptyArray(ids) ? await dbQueryAndValidate(getCommunes, { ids }, pool, communeValidator) : []

  return communes.reduce<Record<CommuneId, string>>((acc, commune) => {
    acc[commune.id] = commune.nom

    return acc
  }, {})
}
