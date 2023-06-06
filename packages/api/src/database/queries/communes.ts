import { dbQueryAndValidate } from '../../pg-database.js'
import { CommuneId } from 'camino-common/src/static/communes.js'
import { Pool } from 'pg'
import { getCommunes, getCommunesValidator } from './communes.queries.js'

export const getCommunesIndex = async (pool: Pool, ids: CommuneId[]): Promise<Record<CommuneId, string>> => {
  const communes = await dbQueryAndValidate(getCommunes, { ids }, pool, getCommunesValidator)

  return communes.reduce<Record<CommuneId, string>>((acc, commune) => {
    acc[commune.id] = commune.nom

    return acc
  }, {})
}
