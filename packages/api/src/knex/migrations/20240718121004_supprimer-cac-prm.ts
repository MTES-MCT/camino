/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { EtapeId } from 'camino-common/src/etape.js'
import { Knex } from 'knex'

export const up = async (knex: Knex) => {
  const result: { rows: { id: EtapeId }[] } = await knex.raw("SELECT id FROM titres_etapes WHERE slug LIKE 'm-pr-%' AND type_id = 'cac'")
  const etapeIds = result.rows.map(({ id }) => id)

  if (etapeIds.length > 0) {
    await knex.raw(`DELETE FROM etapes_documents WHERE etape_id IN (${etapeIds.map(t => `'${t}'`).join(',')})`)
    await knex.raw(`DELETE FROM titres_etapes WHERE id IN (${etapeIds.map(t => `'${t}'`).join(',')})`)
  }
}

export const down = () => ({})
