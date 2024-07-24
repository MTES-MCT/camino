import { userSuper } from '../../database/user-super'
import { dbManager } from '../../../tests/db-manager'
import { restCall } from '../../../tests/_utils/index'
import { test, expect, vi, beforeAll, afterAll } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { renewConfig } from '../../config/index'

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
  renewConfig()
  const tested = await restCall(dbPool, '/deconnecter', {}, userSuper)

  expect(tested.statusCode).toBe(HTTP_STATUS.FOUND)
})

test('resetPassword', async () => {
  process.env.KEYCLOAK_RESET_PASSWORD_URL = 'https://notexisting.url'
  renewConfig()
  const tested = await restCall(dbPool, '/changerMotDePasse', {}, userSuper)

  expect(tested.statusCode).toBe(HTTP_STATUS.FOUND)
})
