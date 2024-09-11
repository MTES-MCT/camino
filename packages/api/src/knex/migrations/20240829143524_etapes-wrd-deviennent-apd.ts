/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { EtapeId } from 'camino-common/src/etape'
import { DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  const etapes: { rows: { id: EtapeId }[] } = await knex.raw(`SELECT id FROM titres_etapes WHERE type_id = 'wrd'`)
  await knex.raw(`UPDATE titres_etapes SET type_id = 'apd' WHERE type_id = 'wrd'`)

  await knex.raw(`UPDATE etapes_documents SET etape_document_type_id = 'aut', description = ? WHERE etape_document_type_id = 'pro' AND etape_id = ANY(?)`, [
    DocumentsTypes.pro.nom,
    etapes.rows.map(({ id }) => id),
  ])
}

export const down = (): void => {}
