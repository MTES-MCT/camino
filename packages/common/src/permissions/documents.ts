import { DocumentType, DocumentTypeId } from 'camino-common/src/static/documentsTypes.js'
import { CaminoDate } from '../date'

export const isDocumentsComplete = (
  documents: { typeId: DocumentTypeId; fichier?: unknown; fichierNouveau?: unknown; uri?: string | null; url?: string | null; date: CaminoDate }[],
  documentsTypes?: Pick<DocumentType, 'id' | 'optionnel'>[]
): { valid: true } | { valid: false; errors: string[] } => {
  const errors = [] as string[]

  if (documentsTypes) {
    documentsTypes
      .filter(dt => !dt.optionnel)
      .forEach(dt => {
        if (!documents?.find(d => d.typeId === dt.id && !!(d.fichier || d.fichierNouveau || d.uri || d.url) && d.date)) {
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
