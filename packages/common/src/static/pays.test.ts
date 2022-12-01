import { isPaysId, PAYS_IDS } from './pays.js'
import { test, expect } from 'vitest'

test('isPaysId', () => {
  expect(isPaysId('FR')).toBe(true)
  expect(isPaysId('fr')).toBe(false)
  expect(isPaysId('toto')).toBe(false)

  Object.values(PAYS_IDS).forEach(paysId => {
    expect(isPaysId(paysId)).toBe(true)
    expect(isPaysId(paysId.toLowerCase())).toBe(false)
  })
})
