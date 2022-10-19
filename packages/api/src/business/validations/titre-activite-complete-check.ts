import { IContenu, IDocument, ISection } from '../../types'

import { documentsTypesValidate } from './documents-types-validate'
import { DocumentType } from 'camino-common/src/static/documentsTypes'

export const titreActiviteCompleteCheck = (
  sections: ISection[],
  contenu?: IContenu | null,
  documents?: IDocument[] | null,
  documentsTypes?: DocumentType[]
) => {
  const activiteComplete = sections.every(s =>
    s.elements?.every(
      e =>
        e.optionnel ||
        (contenu &&
          (e.type === 'checkboxes'
            ? (contenu[s.id][e.id] as string[]).length
            : contenu[s.id][e.id] !== undefined &&
              contenu[s.id][e.id] !== null &&
              contenu[s.id][e.id] !== ''))
    )
  )

  if (!activiteComplete) {
    return false
  }

  const documentsErrors = documentsTypesValidate(documents, documentsTypes)

  return !documentsErrors.length
}
