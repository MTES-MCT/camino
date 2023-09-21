import { isNotNullNorUndefined, memoize, onlyUnique } from './typescript-tools.js'
import { Role } from './roles.js'
import { AdministrationId } from './static/administrations.js'
import { Departements } from './static/departement.js'
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
