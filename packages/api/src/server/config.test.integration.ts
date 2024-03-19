import { restCall } from '../../tests/_utils/index.js'
import { expect, test, describe, vi } from 'vitest'
import type { Pool } from 'pg'

console.info = vi.fn()
console.error = vi.fn()

describe('config', () => {
  test('récupère la configuration', async () => {
    const tested = await restCall(null as unknown as Pool, '/config', {}, undefined)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "API_MATOMO_ID": "plop",
        "API_MATOMO_URL": "plop",
        "SENTRY_DSN": "plop",
      }
    `)
  })
})
