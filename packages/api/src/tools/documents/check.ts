import { filesDocumentCheck } from './files-document-check.js'
import { documentsIndexBuild } from './documents-index-build.js'
import { filesIndexBuild } from './files-index-build.js'
import { documentsFilesCheck } from './documents-files-check.js'
import { filesPathCheck } from './files-path-check.js'

const documentsCheck = async () => {
  console.info()
  console.info('- - -')
  console.info('vérification des documents')
  console.info()
  const documentsIndex = await documentsIndexBuild()
  const filesIndex = filesIndexBuild()

  documentsFilesCheck(documentsIndex, filesIndex)
  await filesDocumentCheck(documentsIndex, filesIndex)
  filesPathCheck(documentsIndex, filesIndex)
}

export default documentsCheck
