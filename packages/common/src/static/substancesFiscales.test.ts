import { isSubstanceFiscale } from './substancesFiscales'

test('isSubstanceFiscale', () => {
  expect(isSubstanceFiscale('wolf')).toBe(true)
  expect(isSubstanceFiscale('plop')).toBe(false)
})
