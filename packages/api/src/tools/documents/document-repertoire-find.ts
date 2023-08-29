import { IDocument, IDocumentRepertoire } from '../../types.js'

export const documentRepertoireFind = (document: Pick<IDocument, 'titreEtapeId'>): IDocumentRepertoire => {
  if (document.titreEtapeId) {
    return 'demarches'
  }

  return 'tmp'
}
