import { tokenInitialize } from './fetch.js'
import { expect, test, vi } from 'vitest'
import { dateAddDays, toCaminoDate } from 'camino-common/src/date.js'

test('tokenInitialize', async () => {
  const fetchMocked = vi
    .fn()
    .mockImplementation(() => Promise.resolve({ access_token: 'token' }))
  const today = toCaminoDate('2023-01-12')
  const later = dateAddDays(today, 3)
  expect(await tokenInitialize(fetchMocked, today)).toEqual('token')
  expect(fetchMocked).toHaveBeenCalledOnce()

  vi.clearAllMocks()
  expect(await tokenInitialize(fetchMocked, today)).toEqual('token')
  expect(fetchMocked).not.toHaveBeenCalledOnce()

  expect(await tokenInitialize(fetchMocked, later)).toEqual('token')
  expect(fetchMocked).toHaveBeenCalledOnce()
})
