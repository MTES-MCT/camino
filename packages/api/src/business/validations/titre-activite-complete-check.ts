import { IContenu, IDocument } from '../../types.js'

import { documentsTypesValidate } from './documents-types-validate.js'
import { DocumentType } from 'camino-common/src/static/documentsTypes.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'

export const titreActiviteCompleteCheck = (sections: DeepReadonly<Section[]>, contenu?: IContenu | null, documents?: IDocument[] | null, documentsTypes?: DocumentType[]) => {
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

  const documentsErrors = documentsTypesValidate(documents, documentsTypes)

  return !documentsErrors.length
}
