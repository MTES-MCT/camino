import { restCall } from '../../../tests/_utils/index'
import { dbManager } from '../../../tests/db-manager'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { insertCommune } from '../../database/queries/communes.queries'
import { toCommuneId } from 'camino-common/src/static/communes'

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

describe('getCommunes', () => {
  test('ne peut pas récupérer des communes sans ids', async () => {
    const tested = await restCall(dbPool, '/rest/communes', {}, undefined, { ids: [] })

    expect(tested.statusCode).toBe(HTTP_STATUS.BAD_REQUEST)
  })

  test('peut récupérer des communes', async () => {
    const fakeGeometry: string = '010100000000000000000000000000000000000000'
    await insertCommune(dbPool, { id: toCommuneId('72000'), nom: 'Le Mans', geometry: fakeGeometry })
    await insertCommune(dbPool, { id: toCommuneId('37000'), nom: 'Tours', geometry: fakeGeometry })
    await insertCommune(dbPool, { id: toCommuneId('31000'), nom: 'Toulouse', geometry: fakeGeometry })

    let tested = await restCall(dbPool, '/rest/communes', {}, undefined, { ids: ['72000', '37000'] })

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)
    expect(tested.body).toStrictEqual([
      { id: toCommuneId('72000'), nom: 'Le Mans' },
      { id: toCommuneId('37000'), nom: 'Tours' },
    ])

    tested = await restCall(dbPool, '/rest/communes', {}, undefined, { ids: ['72000'] })

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)
    expect(tested.body).toStrictEqual([{ id: toCommuneId('72000'), nom: 'Le Mans' }])
  })
})
