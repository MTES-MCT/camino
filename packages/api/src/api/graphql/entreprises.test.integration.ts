import { dbManager } from '../../../tests/db-manager.js'
import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { beforeAll, afterEach, afterAll, test, expect, describe, vi } from 'vitest'
import type { Pool } from 'pg'
console.info = vi.fn()
console.error = vi.fn()

let dbPool: Pool

beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterEach(async () => {
  await dbManager.truncateSchema()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('entreprises', () => {
  const entreprisesQuery = queryImport('entreprises')

  test('peut filter les entreprises archivées ou non (super)', async () => {
    const entrepriseId = 'entreprise-id'
    for (let i = 0; i < 10; i++) {
      await entrepriseUpsert({
        id: newEntrepriseId(`${entrepriseId}-${i}`),
        nom: `${entrepriseId}-${i}`,
        archive: i > 3,
      })
    }

    let res = await graphQLCall(dbPool, entreprisesQuery, { archive: false }, { role: 'super' })
    expect(res.body.errors).toBe(undefined)
    expect(res.body.data.entreprises.elements).toHaveLength(4)

    res = await graphQLCall(dbPool, entreprisesQuery, { archive: true }, { role: 'super' })
    expect(res.body.data.entreprises.elements).toHaveLength(6)

    res = await graphQLCall(dbPool, entreprisesQuery, {}, { role: 'super' })
    expect(res.body.data.entreprises.elements).toHaveLength(10)
  })
})
