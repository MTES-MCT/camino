import { test, expect } from 'vitest'
import { getRestRoute, isCaminoRestRoute } from './rest'
import { utilisateurIdValidator } from './roles'
import { etapeIdValidator } from './etape'

test('getRestRoute', () => {
  expect(getRestRoute('/etape/zip/:etapeId', { etapeId: etapeIdValidator.parse('etapeIdRemplace') })).toBe('/etape/zip/etapeIdRemplace')
  expect(getRestRoute('/rest/utilisateurs/:id/permission', { id: utilisateurIdValidator.parse('userId') }, { toto: ['plop', 'plip'] })).toBe(
    '/rest/utilisateurs/userId/permission?toto%5B%5D=plop&toto%5B%5D=plip'
  )
  expect(getRestRoute('/rest/utilisateurs/:id/permission', { id: utilisateurIdValidator.parse('userId') }, { toto: 'plop' })).toBe('/rest/utilisateurs/userId/permission?toto=plop')
})

test('isCaminoRestRoute', () => {
  expect(isCaminoRestRoute('/toto')).toBe(false)
  expect(isCaminoRestRoute('/rest/utilisateurs/:id/permission')).toBe(true)
})
