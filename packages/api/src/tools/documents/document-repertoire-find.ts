import { IDocument, IDocumentRepertoire } from '../../types.js'

export const documentRepertoireFind = (document: Pick<IDocument, 'titreActiviteId' | 'titreEtapeId'>): IDocumentRepertoire => {
  if (document.titreActiviteId) {
    return 'activites'
  }

  if (document.titreEtapeId) {
    return 'demarches'
  }

  return 'tmp'
}
