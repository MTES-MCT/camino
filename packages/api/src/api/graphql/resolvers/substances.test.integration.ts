import { graphQLCall } from '../../../../tests/_utils/index.js'
import { dbManager } from '../../../../tests/db-manager.js'
import { expect, test, describe, afterAll, beforeAll } from 'vitest'
import type { Pool } from 'pg'

let dbPool: Pool
beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})
describe('substances', () => {
  test('peut voir toutes les substances', async () => {
    const res = await graphQLCall(
      dbPool,
      `query Substances {
  substances {
   id
    nom
    description    
  }
}`,
      {},
      { role: 'defaut' }
    )

    expect(res.body.data).toMatchSnapshot()
  })
})
