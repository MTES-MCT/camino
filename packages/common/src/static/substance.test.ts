import { isSubstanceFiscale } from './substance'

test('isSubstanceFiscale', () => {
  expect(isSubstanceFiscale('wolf')).toBe(true)
  expect(isSubstanceFiscale('plop')).toBe(false)
})
