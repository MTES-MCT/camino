import { IContenu, IDocument } from '../../types.js'

import { DocumentTypeId } from 'camino-common/src/static/documentsTypes.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { isDocumentsComplete } from 'camino-common/src/permissions/documents.js'

export const titreActiviteCompleteCheck = (
  sections: DeepReadonly<Section[]>,
  documentsTypes: Readonly<
    {
      documentTypeId: DocumentTypeId
      optionnel: boolean
    }[]
  >,
  contenu?: IContenu | null,
  documents?: IDocument[] | null
): boolean => {
  const activiteComplete = sections.every(s =>
    s.elements?.every(
      e =>
        e.optionnel ||
        (contenu && (e.type === 'checkboxes' ? (contenu[s.id][e.id] as string[]).length : contenu[s.id][e.id] !== undefined && contenu[s.id][e.id] !== null && contenu[s.id][e.id] !== ''))
    )
  )

  if (!activiteComplete) {
    return false
  }

  const documentsCheck = isDocumentsComplete(
    documents ?? [],
    documentsTypes.map(({ documentTypeId, optionnel }) => ({ id: documentTypeId, optionnel }))
  )

  return documentsCheck.valid
}
