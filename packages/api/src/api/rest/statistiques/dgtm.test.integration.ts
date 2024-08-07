import { restCall } from '../../../../tests/_utils/index'
import { dbManager } from '../../../../tests/db-manager'
import { expect, test, afterAll, beforeAll, vi } from 'vitest'
import type { Pool } from 'pg'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'

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
  const tested = await restCall(dbPool, '/rest/statistiques/dgtm', {}, { role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] })

  expect(tested.statusCode).toBe(200)
  expect(tested.body).toMatchSnapshot()
})
