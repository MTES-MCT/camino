import { isSubstanceFiscale, substancesFiscalesBySubstanceLegale } from './substancesFiscales'
import { test, expect } from 'vitest'

test('isSubstanceFiscale', () => {
  expect(isSubstanceFiscale('wolf')).toBe(true)
  expect(isSubstanceFiscale('plop')).toBe(false)
})

test('substancesFiscalesBySubstanceLegale', () => {
  expect(substancesFiscalesBySubstanceLegale('auru')).toMatchSnapshot()
  expect(substancesFiscalesBySubstanceLegale('meba')).toMatchSnapshot()
})
