import { CommuneId } from 'camino-common/src/static/communes'
import { Pool } from 'pg'
import { getCommunes } from './communes.queries'
import { isNonEmptyArray } from 'camino-common/src/typescript-tools'

export const getCommunesIndex = async (pool: Pool, ids: CommuneId[]): Promise<Record<CommuneId, string>> => {
  const communes = isNonEmptyArray(ids) ? await getCommunes(pool, { ids }) : []

  return communes.reduce<Record<CommuneId, string>>((acc, commune) => {
    acc[commune.id] = commune.nom

    return acc
  }, {})
}
