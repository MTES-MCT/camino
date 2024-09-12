import { DomaineId, domainesIds } from './domaines'
import { TitresTypesIds, isTitreType, toTitreTypeId, getTitreTypeType, getDomaineId, getTitreTypeTypeByDomaineId } from './titresTypes'
import { test, expect } from 'vitest'

test('isTitreType', () => {
  expect(isTitreType(null)).toBe(false)
  expect(isTitreType(undefined)).toBe(false)
  for (const titreTypeId of TitresTypesIds) {
    expect(isTitreType(titreTypeId)).toBe(true)
  }
})

test('toTitreTypeId', () => {
  expect(toTitreTypeId('ap', 'm')).toBe('apm')
  expect(() => toTitreTypeId('ap', 'r')).toThrowErrorMatchingInlineSnapshot(`[Error: le titre type apr n'est pas reconnu par Camino]`)
})

test('getTitreTypeType', () => {
  expect(getTitreTypeType('apm')).toBe('ap')
  // @ts-ignore
  expect(() => getTitreTypeType('xxx')).toThrow(`le titreType xxx n'a pas de titreTypeType connu, cas impossible`)
})

test('getDomaineId', () => {
  expect(getDomaineId('apm')).toBe('m')
  // @ts-ignore
  expect(() => getDomaineId('xxx')).toThrow(`le titreType xxx n'a pas de domaineId connu, cas impossible`)
})

test.each<DomaineId>(domainesIds)('getTitreTypeTypeByDomaineId %p', domaineId => {
  expect(getTitreTypeTypeByDomaineId(domaineId)).toMatchSnapshot()
})
