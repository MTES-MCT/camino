import { isSubstanceLegale } from './substancesLegales.js'
import { test, expect } from 'vitest'

test('isSubstanceLegale', () => {
  expect(isSubstanceLegale('aloh')).toBe(true)
  expect(isSubstanceLegale('plop')).toBe(false)
})
