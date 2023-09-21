import { IDocument } from '../../types.js'
import { IndexFile } from './_types.js'

import { documentsGet } from '../../database/queries/documents.js'
import { userSuper } from '../../database/user-super.js'
import { documentRepertoireFind } from './document-repertoire-find.js'

const documentPathGet = (document: IDocument) => {
  let path = documentRepertoireFind(document)

  if (!path) {
    console.error(`le repertoire est absent ${document}`)
  }

  if (path === 'demarches') {
    path += `/${document.titreEtapeId}`
  }

  return `${path}/${document.id}.${document.fichierTypeId}`
}

export const documentsIndexBuild = async () => {
  const documents = await documentsGet({}, {}, userSuper)

  return documents.reduce((res: IndexFile, document) => {
    if (document.fichier) {
      res[document.id] = { document, path: documentPathGet(document) }
    }

    return res
  }, {})
}
