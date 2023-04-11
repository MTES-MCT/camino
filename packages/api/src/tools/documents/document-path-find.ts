import { IDocument } from '../../types.js'
import { documentRepertoireFind } from './document-repertoire-find.js'
import dirCreate from '../dir-create.js'

export const documentFilePathFind = async (document: IDocument, creation = false) => {
  const repertoire = documentRepertoireFind(document)

  const parentId = document.titreEtapeId || document.titreActiviteId || document.entrepriseId

  let dirPath = `files/${repertoire}`

  if (parentId) {
    dirPath += `/${parentId}`
  }

  if (creation) {
    await dirCreate(dirPath)
  }

  return `${dirPath}/${document.id}.${document.fichierTypeId}`
}