import { restCall, userGenerate } from '../../../../tests/_utils/index.js'
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

test("peut récupérer les indicateurs d'impact pour data.gouv", async () => {
  await userGenerate({ role: 'defaut' })
  const tested = await restCall(dbPool, '/rest/statistiques/datagouv', {}, undefined)

  expect(tested.statusCode).toBe(200)
  expect(
    tested.body.map((line: { date: string }) => {
      line.date = 'mocked'

      return line
    })
  ).toMatchSnapshot()
})
