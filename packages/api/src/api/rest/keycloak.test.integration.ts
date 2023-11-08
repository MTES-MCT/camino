import { userSuper } from '../../database/user-super.js'
import { dbManager } from '../../../tests/db-manager.js'
import { restCall } from '../../../tests/_utils/index.js'
import { test, expect, vi, beforeAll, afterAll } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'

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

test('deconnecter', async () => {
  process.env.KEYCLOAK_LOGOUT_URL = 'https://notexisting.url'
  process.env.OAUTH_URL = 'https://another.notexisting.url'
  const tested = await restCall(dbPool, '/deconnecter', {}, userSuper)

  expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_FOUND)
})

test('resetPassword', async () => {
  process.env.KEYCLOAK_RESET_PASSWORD_URL = 'https://notexisting.url'
  const tested = await restCall(dbPool, '/changerMotDePasse', {}, userSuper)

  expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_FOUND)
})
