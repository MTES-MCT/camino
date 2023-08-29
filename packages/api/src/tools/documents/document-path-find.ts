import { IDocument } from '../../types.js'
import { documentRepertoireFind } from './document-repertoire-find.js'
import { dirCreate } from '../dir-create.js'

export const documentFilePathFind = (document: Pick<IDocument, 'id' | 'fichierTypeId' | 'titreEtapeId'>, creation = false) => {
  const repertoire = documentRepertoireFind(document)

  const parentId = document.titreEtapeId

  let dirPath = `files/${repertoire}`

  if (parentId) {
    dirPath += `/${parentId}`
  }

  if (creation) {
    dirCreate(dirPath)
  }

  return `${dirPath}/${document.id}.${document.fichierTypeId}`
}
