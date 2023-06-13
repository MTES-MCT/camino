import Document from '../../database/models/documents.js'
import { documentFilePathFind } from './document-path-find.js'
import * as fs from 'fs'
import { documentSupprimer } from '../../api/graphql/resolvers/documents.js'
import { userSuper } from '../../database/user-super.js'
import { daysBetween, getCurrent, toCaminoDate } from 'camino-common/src/date.js'
import type { Pool } from 'pg'

export const documentsClean = async (pool: Pool) => {
  console.info()
  console.info('- - -')
  console.info('suppression des documents orphelins')
  console.info()

  const documents = await Document.query().whereNull('titreEtapeId').whereNull('titreActiviteId')

  for (const document of documents) {
    const path = documentFilePathFind(document)

    try {
      const { mtime } = fs.statSync(path)
      if (daysBetween(toCaminoDate(mtime), getCurrent()) >= 1) {
        await documentSupprimer({ id: document.id }, { user: userSuper, pool })
        console.info(`document ${path} supprimé`)
      }
    } catch (e) {}
  }
}
