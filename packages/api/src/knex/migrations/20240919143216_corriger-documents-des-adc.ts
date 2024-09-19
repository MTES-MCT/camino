/* eslint-disable sql/no-unsafe-query */

import { EtapeAvisId, EtapeId } from 'camino-common/src/etape'
import { DOCUMENTS_TYPES_IDS, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { Knex } from 'knex'
import { LargeObjectId } from '../../database/largeobjects'
import { CaminoDate, dateFormat } from 'camino-common/src/date'

export const up = async (knex: Knex): Promise<void> => {
  const avisAMigrer: { rows: { id: EtapeAvisId; date: CaminoDate; etape_id: EtapeId; largeobject_id: LargeObjectId }[] } = await knex.raw(
    `SELECT id, date, etape_id, largeobject_id
    FROM etape_avis
    WHERE description = ANY(?) AND etape_id IN (SELECT id FROM titres_etapes WHERE type_id = 'adc')`,
    [
      [
        DocumentsTypes[DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesDeLAdministrationCentrale].nom,
        DocumentsTypes[DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesCivilsEtMilitaires].nom,
        DocumentsTypes[DOCUMENTS_TYPES_IDS.lettre].nom,
      ],
    ]
  )

  for (let i = 0; i < avisAMigrer.rows.length; i += 1) {
    const { id, date, etape_id, largeobject_id } = avisAMigrer.rows[i]
    await knex.raw(`INSERT INTO etapes_documents (id, etape_document_type_id, etape_id, description, public_lecture, entreprises_lecture, largeobject_id) VALUES (?, ?, ?, ?, FALSE, FALSE, ?)`, [
      id,
      DOCUMENTS_TYPES_IDS.lettreDeSaisineDesCollectivites,
      etape_id,
      `Document en date du ${dateFormat(date)}`,
      largeobject_id,
    ])
  }

  await knex.raw('DELETE FROM etape_avis WHERE id = ANY(?)', [avisAMigrer.rows.map(({ id }) => id)])
}

export const down = (): void => {}
