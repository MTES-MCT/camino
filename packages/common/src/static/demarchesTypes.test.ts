import { DemarchesTypesIds, isDemarcheTypeId } from './demarchesTypes'

test('isDemarcheTypeId', () => {
  expect(isDemarcheTypeId(null)).toBe(false)
  expect(isDemarcheTypeId(undefined)).toBe(false)
  for (const demarcheType of DemarchesTypesIds) {
    expect(isDemarcheTypeId(demarcheType)).toBe(true)
  }
})
