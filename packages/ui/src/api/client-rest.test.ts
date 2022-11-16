import { CaminoRestRoutes } from 'camino-common/src/rest'
import { expect, test } from 'vitest'
import { getUiRestRoute } from './client-rest'

test('getUiRestRoute', () => {
  expect(getUiRestRoute(CaminoRestRoutes.statistiquesDGTM)).toBe(
    '/apiUrl/statistiques/dgtm'
  )
})
