import { restCall } from '../../tests/_utils/index.js'
import { expect, test, describe, vi } from 'vitest'
import type { Pool } from 'pg'

console.info = vi.fn()
console.error = vi.fn()

describe('config', () => {
  test('récupère la configuration', async () => {
    process.env.UI_HOST = 'beautiful_ui_host'
    const tested = await restCall(null as unknown as Pool, '/config', {}, undefined)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "environment": "dev",
        "uiHost": "beautiful_ui_host",
      }
    `)
  })
})
