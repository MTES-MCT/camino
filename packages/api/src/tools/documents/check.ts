import { filesDocumentCheck } from './files-document-check.js'
import { documentsIndexBuild } from './documents-index-build.js'
import { filesIndexBuild } from './files-index-build.js'
import { documentsFilesCheck } from './documents-files-check.js'
import { Pool } from 'pg'

export const documentsCheck = async (_pool: Pool) => {
  console.info()

  console.info('- - -')
  console.info('vérification des documents')
  console.info()
  const documentsIndex = await documentsIndexBuild()
  const filesIndex = filesIndexBuild()

  documentsFilesCheck(documentsIndex, filesIndex)
  await filesDocumentCheck(documentsIndex, filesIndex)
}
