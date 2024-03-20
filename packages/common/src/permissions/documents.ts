import { DocumentType } from 'camino-common/src/static/documentsTypes.js'
import { EtapeDocument } from '../etape';

export const isDocumentsComplete = (
  documents: Pick<EtapeDocument, 'etape_document_type_id'>[],
  documentsTypes?: Pick<DocumentType, 'id' | 'optionnel'>[]
): { valid: true } | { valid: false; errors: string[] } => {
  const errors = [] as string[]

  if (documentsTypes) {
    documentsTypes
      .filter(dt => !dt.optionnel)
      .forEach(dt => {
        if (!documents?.find(d => d.etape_document_type_id === dt.id )) {
          errors.push(`le document "${dt.id}" est obligatoire`)
        }
      })
  } else if (documents?.length) {
    errors.push(`impossible de lier un document`)
  }

  if (errors.length === 0) {
    return { valid: true }
  }

  return { valid: false, errors }
}
