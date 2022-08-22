import { isSubstanceFiscale, substancesFiscalesBySubstanceLegale } from './substancesFiscales'

test('isSubstanceFiscale', () => {
  expect(isSubstanceFiscale('wolf')).toBe(true)
  expect(isSubstanceFiscale('plop')).toBe(false)
})

test('substancesFiscalesBySubstanceLegale', () => {
  expect(substancesFiscalesBySubstanceLegale('auru')).toMatchSnapshot()
  expect(substancesFiscalesBySubstanceLegale('meba')).toMatchSnapshot()
})
