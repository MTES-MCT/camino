import { EtapeDocumentId } from 'camino-common/src/etape'
import { DocumentsTypes, DocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  const { rows }: { rows: { id: EtapeDocumentId; etape_document_type_id: DocumentTypeId; description: string }[] } = await knex.raw(`
    SELECT id, etape_document_type_id, description
    FROM etapes_documents
    WHERE etape_id IN (SELECT id FROM titres_etapes WHERE type_id = 'rif') AND etape_document_type_id != 'aut'
  `)

  for (const row of rows) {
    let description = DocumentsTypes[row.etape_document_type_id].nom
    if (isNotNullNorUndefinedNorEmpty(row.description)) {
      description += `\n${row.description}`
    }

    await knex.raw(
      `
      UPDATE etapes_documents
      SET etape_document_type_id = 'aut', description = ?
      WHERE id = ?
    `,
      [description, row.id]
    )
  }
}

export const down = (): void => {}
