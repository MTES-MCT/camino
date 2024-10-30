import { test, expect } from 'vitest'
import { getRestRoute, isCaminoRestRoute } from './rest'
import { utilisateurIdValidator } from './roles'

test('getRestRoute', () => {
  expect(getRestRoute('/rest/utilisateurs/:id/newsletter', { id: utilisateurIdValidator.parse('userId') })).toBe('/rest/utilisateurs/userId/newsletter')
  expect(getRestRoute('/rest/utilisateurs/:id/newsletter', { id: utilisateurIdValidator.parse('userId') }, { toto: ['plop', 'plip'] })).toBe(
    '/rest/utilisateurs/userId/newsletter?toto%5B%5D=plop&toto%5B%5D=plip'
  )
  expect(getRestRoute('/rest/utilisateurs/:id/newsletter', { id: utilisateurIdValidator.parse('userId') }, { toto: 'plop' })).toBe('/rest/utilisateurs/userId/newsletter?toto=plop')
})

test('isCaminoRestRoute', () => {
  expect(isCaminoRestRoute('/toto')).toBe(false)
  expect(isCaminoRestRoute('/rest/utilisateurs/:id/newsletter')).toBe(true)
})
