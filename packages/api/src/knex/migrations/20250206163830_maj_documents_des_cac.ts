import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape'
import { AutreDocumentTypeId, DocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  const { rows }: { rows: { id: EtapeDocumentId; etape_id: EtapeId; etape_document_type_id: DocumentTypeId | AutreDocumentTypeId }[] } = await knex.raw(`
    SELECT ed.id, ed.etape_id, ed.etape_document_type_id
    FROM etapes_documents ed
    WHERE ed.etape_id IN (SELECT id FROM titres_etapes WHERE type_id IN ('cim', 'cac') AND archive IS FALSE)`)

  const index = rows.reduce<Record<EtapeId, { id: EtapeId; documents: { id: EtapeDocumentId; type_id: DocumentTypeId | AutreDocumentTypeId }[] }>>((acc, row) => {
    if (isNullOrUndefined(acc[row.etape_id])) {
      acc[row.etape_id] = {
        id: row.etape_id,
        documents: [],
      }
    }

    acc[row.etape_id].documents.push({
      id: row.id,
      type_id: row.etape_document_type_id,
    })
    return acc
  }, {})

  const etapes = Object.values(index)
  for (const etape of etapes) {
    if (etape.documents.length === 0) {
      throw new Error(`Cette étape n'a pas de documents: ${etape.id}`)
    }

    for (const document of etape.documents) {
      await knex.raw("UPDATE etapes_documents SET etape_document_type_id = 'lac' WHERE id = ?", [document.id])
    }
  }
}

export const down = (): void => {}
