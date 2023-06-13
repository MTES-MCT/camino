import { IDocument } from '../../types.js'
import { documentRepertoireFind } from './document-repertoire-find.js'
import { dirCreate } from '../dir-create.js'
import { EntrepriseDocumentId, EntrepriseId } from 'camino-common/src/entreprise.js'

export const entrepriseDocumentFilePathFind = (
  entrepriseDocumentId: EntrepriseDocumentId,
  entrepriseId: EntrepriseId
): {
  /* eslint-disable no-undef */
  folderPath: typeof folderPath
  fileName: typeof fileName
  fullPath: typeof fullPath
} => {
  const folderPath = `./files/entreprises/${entrepriseId}` as const

  dirCreate(folderPath)
  const fileName = `${entrepriseDocumentId}.pdf` as const

  const fullPath = `${folderPath}/${fileName}` as const

  return { folderPath, fileName, fullPath }
}

export const documentFilePathFind = (document: Pick<IDocument, 'id' | 'fichierTypeId' | 'titreActiviteId' | 'titreEtapeId'>, creation = false) => {
  const repertoire = documentRepertoireFind(document)

  const parentId = document.titreEtapeId || document.titreActiviteId

  let dirPath = `files/${repertoire}`

  if (parentId) {
    dirPath += `/${parentId}`
  }

  if (creation) {
    dirCreate(dirPath)
  }

  return `${dirPath}/${document.id}.${document.fichierTypeId}`
}
