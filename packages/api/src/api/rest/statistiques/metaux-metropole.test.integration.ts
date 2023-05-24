import { restCall } from '../../../../tests/_utils/index.js'
import { dbManager } from '../../../../tests/db-manager.js'
import { expect, test, afterAll, beforeAll, vi } from 'vitest'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'
import type { Pool } from 'pg'

console.info = vi.fn()
// console.error = vi.fn()
let dbPool: Pool

beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

test('peut récupérer les statistiques des métaux de métropole', async () => {
  const tested = await restCall(dbPool, '/rest/statistiques/minerauxMetauxMetropole', {}, undefined)

  expect(tested.statusCode).toBe(200)
  expect(tested.body).toMatchSnapshot()
})
