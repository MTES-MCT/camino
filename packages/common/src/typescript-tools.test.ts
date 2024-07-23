import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty, memoize, onlyUnique, stringArrayEquals } from './typescript-tools'
import { Role } from './roles'
import { AdministrationId } from './static/administrations'
import { Departements } from './static/departement'
import { test, expect, describe } from 'vitest'

describe('isNotNullNorUndefined', () => {
  test('null or undefined', () => {
    expect(isNotNullNorUndefined(null)).toBe(false)
    expect(isNotNullNorUndefined(undefined)).toBe(false)
  })

  test('isNotNullNorUndefined', () => {
    const tested: { role: Role; administrationId: undefined | null | AdministrationId } | undefined | null = { role: 'admin', administrationId: null }
    expect(isNotNullNorUndefined(tested)).toBe(true)
  })
})

test('isNullOrUndefinedOrEmpty', () => {
  expect(isNullOrUndefinedOrEmpty(null)).toBe(true)
  expect(isNullOrUndefinedOrEmpty(undefined)).toBe(true)
  expect(isNullOrUndefinedOrEmpty([])).toBe(true)
  expect(isNullOrUndefinedOrEmpty([1])).toBe(false)
  expect(isNullOrUndefinedOrEmpty('  ')).toBe(true)
  expect(isNullOrUndefinedOrEmpty(' a ')).toBe(false)
})

test('isNotNullNorUndefinedNorEmpty', () => {
  expect(isNotNullNorUndefinedNorEmpty(null)).toBe(false)
  expect(isNotNullNorUndefinedNorEmpty(undefined)).toBe(false)
  expect(isNotNullNorUndefinedNorEmpty([])).toBe(false)
  expect(isNotNullNorUndefinedNorEmpty([1])).toBe(true)
  expect(isNotNullNorUndefinedNorEmpty('  ')).toBe(false)
  expect(isNotNullNorUndefinedNorEmpty(' a ')).toBe(true)
})

test('onlyUnique', () => {
  const departements = [Departements['01'], Departements['2A'], Departements['02'], Departements['01']]
  const actual = departements.filter(onlyUnique)
  expect(actual).toStrictEqual([Departements['01'], Departements['2A'], Departements['02']])
  const a = ['a', 1, 'a', 2, '1']
  const unique = a.filter(onlyUnique)
  expect(unique).toStrictEqual(['a', 1, 2, '1'])
})

test('memoize', async () => {
  let called = 0
  const toMemoize = () => {
    called++

    return Promise.resolve(12)
  }
  const memoized = memoize(toMemoize)
  expect(await memoized()).toBe(12)
  expect(await memoized()).toBe(12)
  expect(await memoized()).toBe(12)
  expect(await memoized()).toBe(12)
  expect(called).toBe(1)
})
test('stringArrayEquals', () => {
  expect(stringArrayEquals(['un'], ['un'])).toBe(true)
  expect(stringArrayEquals([], [])).toBe(true)
  expect(stringArrayEquals(['un'], ['deux'])).toBe(false)
  expect(stringArrayEquals(['un'], ['un', 'deux'])).toBe(false)
  expect(stringArrayEquals(['un', 'deux'], ['un'])).toBe(false)
  expect(stringArrayEquals([], ['un'])).toBe(false)
})
