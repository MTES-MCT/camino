import { TitresTypesIds, isTitreType } from './titresTypes'

test('isTitreType', () => {
  expect(isTitreType(null)).toBe(false)
  expect(isTitreType(undefined)).toBe(false)
  for (const titreTypeId of TitresTypesIds) {
    expect(isTitreType(titreTypeId)).toBe(true)
  }
})
