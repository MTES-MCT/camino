import { dbManager } from '../../../tests/db-manager.js'
import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'

import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest'

console.info = vi.fn()
console.error = vi.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('statuts', () => {
  const metasQuery = queryImport('metas')

  test('peut voir tous les statuts', async () => {
    const res = await graphQLCall(metasQuery, {}, { role: 'super' })

    expect(res.body.data).toMatchSnapshot()
  })
})
