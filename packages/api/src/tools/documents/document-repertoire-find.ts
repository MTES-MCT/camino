import { IDocument, IDocumentRepertoire } from '../../types.js'

export const documentRepertoireFind = (document: Pick<IDocument, 'titreActiviteId' | 'titreEtapeId' | 'entrepriseId'>): IDocumentRepertoire => {
  if (document.titreActiviteId) {
    return 'activites'
  }

  if (document.titreEtapeId) {
    return 'demarches'
  }

  if (document.entrepriseId) {
    return 'entreprises'
  }

  return 'tmp'
}
