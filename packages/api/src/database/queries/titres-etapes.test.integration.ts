import { dbManager } from '../../../tests/db-manager'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { etapeCreate } from '../../api/rest/rest-test-utils'
import { updateEtapeDocuments } from './titres-etapes.queries'
import { callAndExit } from '../../tools/fp-tools'
import { Pool } from 'pg'
import { testDocumentCreateTemp } from '../../../tests/_utils/administrations-permissions'
import { Knex } from 'knex'
console.info = vi.fn()
console.error = vi.fn()

let dbPool: Pool
let knexInstance: Knex
beforeAll(async () => {
  const { pool, knex } = await dbManager.populateDb()
  dbPool = pool
  knexInstance = knex
})

afterAll(async () => {
  await dbManager.closeKnex()
})
describe('teste les requêtes sur les démarches', () => {
  describe('updateEtapeDocuments', () => {
    test('on peut insérer un document', async () => {
      const { titreEtapeId } = await etapeCreate()
      const documentToInsert = testDocumentCreateTemp('aac')
      await callAndExit(updateEtapeDocuments(dbPool, titreEtapeId, [documentToInsert]))

      const result = await knexInstance.raw('select * from etapes_documents')

      expect(result.rows).toHaveLength(1)
    })
  })
})
