import { DocumentType, DocumentTypeId } from 'camino-common/src/static/documentsTypes.js'
import { CaminoDate } from '../date'
import { isNotNullNorUndefined } from '../typescript-tools.js'

export const isDocumentsComplete = (
  documents: { typeId: DocumentTypeId; fichier?: unknown; fichierNouveau?: unknown; date: CaminoDate }[],
  documentsTypes?: Pick<DocumentType, 'id' | 'optionnel'>[]
): { valid: true } | { valid: false; errors: string[] } => {
  const errors = [] as string[]

  if (documentsTypes) {
    documentsTypes
      .filter(dt => !dt.optionnel)
      .forEach(dt => {
        if (!documents?.find(d => d.typeId === dt.id && !!(isNotNullNorUndefined(d.fichier) || isNotNullNorUndefined(d.fichierNouveau)) && d.date)) {
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
