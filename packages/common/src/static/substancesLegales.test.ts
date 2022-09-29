import { isSubstanceLegale } from './substancesLegales'

test('isSubstanceLegale', () => {
  expect(isSubstanceLegale('aloh')).toBe(true)
  expect(isSubstanceLegale('plop')).toBe(false)
})
