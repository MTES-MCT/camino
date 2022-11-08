import { DomaineId, domainesIds } from './domaines'
import { TitresTypesIds, isTitreType, toTitreTypeId, getTitreTypeType, getDomaineId, getTitreTypeTypeByDomaineId } from './titresTypes'

test('isTitreType', () => {
  expect(isTitreType(null)).toBe(false)
  expect(isTitreType(undefined)).toBe(false)
  for (const titreTypeId of TitresTypesIds) {
    expect(isTitreType(titreTypeId)).toBe(true)
  }
})

test('toTitreTypeId', () => {
  expect(toTitreTypeId('ap', 'm')).toBe('apm')
  expect(() => toTitreTypeId('ap', 'r')).toThrowErrorMatchingInlineSnapshot(`"le titre type apr n'est pas reconnu par Camino"`)
})

test('getTitreTypeType', () => {
  expect(getTitreTypeType('apm')).toBe('ap')
})

test('getDomaineId', () => {
  expect(getDomaineId('apm')).toBe('m')
})

test.each<DomaineId>(domainesIds)('getTitreTypeTypeByDomaineId %p', domaineId => {
  expect(getTitreTypeTypeByDomaineId(domaineId)).toMatchSnapshot()
})
