import { test, expect } from 'vitest'
import { getRestRoute } from './rest'

test('getRestRoute', () => {
  expect(getRestRoute('/rest/utilisateurs/:id/newsletter', { id: 'userId' })).toBe('/rest/utilisateurs/userId/newsletter')
  expect(getRestRoute('/rest/utilisateurs/:id/newsletter', { id: 'userId' }, { toto: ['plop', 'plip'] })).toBe('/rest/utilisateurs/userId/newsletter?toto%5B%5D=plop&toto%5B%5D=plip')
  expect(getRestRoute('/rest/utilisateurs/:id/newsletter', { id: 'userId' }, { toto: 'plop' })).toBe('/rest/utilisateurs/userId/newsletter?toto=plop')
})
