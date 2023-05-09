import { test, expect } from 'vitest'
import { CaminoRestRoutes, getRestRoute } from './rest'

test('getRestRoute', () => {
  expect(getRestRoute(CaminoRestRoutes.newsletter, { id: 'userId' })).toBe('/rest/utilisateurs/userId/newsletter')
})
