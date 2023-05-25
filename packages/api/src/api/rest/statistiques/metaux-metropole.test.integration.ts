import { restCall } from '../../../../tests/_utils/index.js'
import { dbManager } from '../../../../tests/db-manager.js'
import { expect, test, afterAll, beforeAll, vi } from 'vitest'
import type { Pool } from 'pg'

console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool

beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

// TODO 2023-05-24 il faut "mocker" le serveur openfisca pour pouvoir faire cette requête.
// On peut s'appuyer sur request(app) et rajouter une route /calculate qui répond toujours la même chose.
// Difficulté, récupérer le port dynamiquement
test.skip('peut récupérer les statistiques des métaux de métropole', async () => {
  const tested = await restCall(dbPool, '/rest/statistiques/minerauxMetauxMetropole', {}, undefined)

  expect(tested.statusCode).toBe(200)
  expect(tested.body).toMatchSnapshot()
})
