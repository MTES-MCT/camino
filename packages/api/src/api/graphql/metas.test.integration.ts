import { dbManager } from '../../../tests/db-manager.js'
import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'

import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest'
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

describe('statuts', () => {
  const metasQuery = queryImport('metas')

  test('peut voir tous les statuts', async () => {
    const res = await graphQLCall(dbPool, metasQuery, {}, { role: 'super' })

    expect(res.body.data).toMatchSnapshot()
  })
})
