import { restCall } from '../../../../tests/_utils/index.js'
import { dbManager } from '../../../../tests/db-manager.js'
import { expect, test, afterAll, beforeAll, vi } from 'vitest'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'
import type { Pool } from 'pg'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'

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

test('peut récupérer les statistiques de la DGTM', async () => {
  const tested = await restCall(dbPool, CaminoRestRoutes.statistiquesDGTM, {}, { role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] })

  expect(tested.statusCode).toBe(200)
  expect(tested.body).toMatchSnapshot()
})
