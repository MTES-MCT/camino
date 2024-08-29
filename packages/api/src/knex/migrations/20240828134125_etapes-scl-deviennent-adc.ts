/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape'
import { DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { Knex } from 'knex'
import { LargeObjectId } from '../../database/largeobjects'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { CaminoDate } from 'camino-common/src/date'

export const up = async (knex: Knex): Promise<void> => {
  const etapes: { rows: { id: EtapeId; titre_demarche_id: DemarcheId; archive: boolean; date: CaminoDate }[] } = await knex.raw(
    `SELECT id, titre_demarche_id, archive, date FROM titres_etapes WHERE type_id = 'scl'`
  )

  type EtapeDocumentRow = {
    id: EtapeDocumentId
    etape_document_type_id: DocumentTypeId
    etape_id: EtapeId
    largeobject_id: LargeObjectId
  }
  const etapesDocuments: { rows: EtapeDocumentRow[] } = await knex.raw(
    `SELECT id, etape_document_type_id, etape_id, largeobject_id
    FROM etapes_documents
    WHERE etape_id = ANY(?)`,
    [etapes.rows.map(({ id }) => id)]
  )
  const demarchesAvecAdc: { rows: { id: EtapeId; titre_demarche_id: DemarcheId }[] } = await knex.raw(
    `SELECT titre_demarche_id, id
    FROM titres_etapes
    WHERE type_id = 'adc' AND titre_demarche_id = ANY(?)`,
    [etapes.rows.map(({ titre_demarche_id }) => titre_demarche_id)]
  )

  const indexDesDemarchesAvecAdc = demarchesAvecAdc.rows.reduce<Record<DemarcheId, EtapeId>>((acc, row) => {
    acc[row.titre_demarche_id] = row.id

    return acc
  }, {})
  const indexDesDocuments = etapesDocuments.rows.reduce<Record<EtapeId, EtapeDocumentRow[]>>((acc, row) => {
    if (isNullOrUndefined(acc[row.etape_id])) {
      acc[row.etape_id] = []
    }

    acc[row.etape_id].push(row)

    return acc
  }, {})

  const etapesASupprimer: EtapeId[] = []
  for (let i = 0; i < etapes.rows.length; i += 1) {
    const etape = etapes.rows[i]

    let etapeIdDesAvis = etape.id
    if (etape.archive || isNullOrUndefined(indexDesDemarchesAvecAdc[etape.titre_demarche_id])) {
      await knex.raw(`UPDATE titres_etapes SET type_id = 'adc' WHERE id = ?`, [etape.id])
    } else {
      etapeIdDesAvis = indexDesDemarchesAvecAdc[etape.titre_demarche_id]
      etapesASupprimer.push(etape.id)
    }

    if (isNotNullNorUndefinedNorEmpty(indexDesDocuments[etape.id])) {
      await Promise.all(
        indexDesDocuments[etape.id].map(document =>
          knex.raw(
            `INSERT INTO etape_avis (id, avis_type_id, avis_statut_id, avis_visibility_id, etape_id, description, date, largeobject_id) VALUES (?, 'avisDUneCollectivite', 'Non renseigné', 'Administrations', ?, ?, ?, ?)`,
            [document.id, etapeIdDesAvis, DocumentsTypes[document.etape_document_type_id].nom, etape.date, document.largeobject_id]
          )
        )
      )
    }
  }

  await knex.raw('DELETE FROM etapes_documents WHERE id = ANY(?)', [etapesDocuments.rows.map(({ id }) => id)])
  await knex.raw('DELETE FROM titres_etapes WHERE id = ANY(?)', [etapesASupprimer])
}

export const down = (): void => {}
