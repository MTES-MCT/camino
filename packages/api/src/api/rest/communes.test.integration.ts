import { restCall } from '../../../tests/_utils/index.js'
import { dbManager } from '../../../tests/db-manager.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import type { Pool } from 'pg'
import {constants} from 'http2'
import { dbQueryAndValidate } from '../../pg-database.js'
import { insertCommune } from '../../database/queries/communes.queries.js'
import { toCommuneId } from 'camino-common/src/static/communes.js'
import { z } from 'zod'


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
    const tested = await restCall(dbPool, '/rest/communes', { }, undefined, {ids: []})

    expect(tested.statusCode).toBe(constants.HTTP_STATUS_BAD_REQUEST)
  })

  test('peut récupérer des communes', async () => {

    await dbQueryAndValidate(insertCommune, {id: toCommuneId('72000'), nom: 'Le Mans'}, dbPool, z.void())
    await dbQueryAndValidate(insertCommune, {id: toCommuneId('37000'), nom: 'Tours'}, dbPool, z.void())
    await dbQueryAndValidate(insertCommune, {id: toCommuneId('31000'), nom: 'Toulouse'}, dbPool, z.void())

    let tested = await restCall(dbPool, '/rest/communes', { }, undefined, {ids: ['72000', '37000']})

    expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)
    expect(tested.body).toStrictEqual([{id: toCommuneId('72000'), nom: 'Le Mans'}, {id: toCommuneId('37000'), nom: 'Tours'}])

    tested = await restCall(dbPool, '/rest/communes', { }, undefined, {ids: ['72000']})

    expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)
    expect(tested.body).toStrictEqual([{id: toCommuneId('72000'), nom: 'Le Mans'}])
  })
})
