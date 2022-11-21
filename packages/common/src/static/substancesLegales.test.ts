import { isSubstanceLegale } from './substancesLegales'
import { test, expect } from 'vitest'

test('isSubstanceLegale', () => {
  expect(isSubstanceLegale('aloh')).toBe(true)
  expect(isSubstanceLegale('plop')).toBe(false)
})
