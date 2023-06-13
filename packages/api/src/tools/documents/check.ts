import { filesDocumentCheck } from './files-document-check.js'
import { documentsIndexBuild } from './documents-index-build.js'
import { filesIndexBuild } from './files-index-build.js'
import { documentsFilesCheck } from './documents-files-check.js'
import { getEntrepriseDocuments } from '../../api/rest/entreprises.queries.js'
import { Pool } from 'pg'
import { execSync } from 'node:child_process'
import { entrepriseDocumentFilePathFind } from './document-path-find.js'
import { userSuper } from '../../database/user-super.js'

export const documentsCheck = async (pool: Pool) => {
  console.info()

  console.info('- - -')
  console.info('vérification des documents')
  console.info()
  const documentsIndex = await documentsIndexBuild()
  const filesIndex = filesIndexBuild()

  documentsFilesCheck(documentsIndex, filesIndex)
  await filesDocumentCheck(documentsIndex, filesIndex)

  const entrepriseDocuments = await getEntrepriseDocuments([], [], pool, userSuper)

  const filesNames = execSync(`find ./files/entreprises | grep pdf`).toString().split('\n')

  entrepriseDocuments.forEach(entrepriseDocument => {
    const { fullPath } = entrepriseDocumentFilePathFind(entrepriseDocument.id, entrepriseDocument.entreprise_id)

    if (!filesNames.includes(fullPath)) {
      console.info(`Le document d’entreprise ${entrepriseDocument.id} est introuvable sur le disque dur`)
    }
  })

  filesNames.forEach(fileName => {
    if (!entrepriseDocuments.some(({ id, entreprise_id }) => fileName === entrepriseDocumentFilePathFind(id, entreprise_id).fullPath)) {
      console.info(`Le document d’entreprise ${fileName} est présent sur le disque mais est introuvable dans la base de données`)
    }
  })
}
