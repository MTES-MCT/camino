import { test, expect } from 'vitest'
import { indexToLetter, toDegresMinutes } from './number'
import Decimal from 'decimal.js'

test('indexToLetter', () => {
  expect(indexToLetter(0)).toBe('A')
  expect(indexToLetter(1)).toBe('B')
  expect(indexToLetter(25)).toBe('Z')
  expect(indexToLetter(26)).toBe('AA')
  expect(indexToLetter(28)).toBe('AC')
  expect(indexToLetter(52)).toBe('BA')
})

test('toDegresMinutes', () => {
  expect(toDegresMinutes(43.60426)).toStrictEqual({
    degres: 43,
    minutes: 36.2556,
  })
  expect(toDegresMinutes(50.467995)).toStrictEqual({
    degres: 50,
    minutes: 28.0797,
  })

  expect(toDegresMinutes(11.719666)).toStrictEqual({
    degres: 11,
    minutes: 43.18,
  })
  expect(toDegresMinutes(-6.113892)).toStrictEqual({
    degres: -6,
    minutes: 6.8335,
  })
})


test('decimal round', () => {

  Decimal.ROUND_HALF_UP
  expect(new Decimal(12.34).toDecimalPlaces(1)).toStrictEqual(new Decimal(12.3))
  expect(new Decimal(12.35).toDecimalPlaces(1)).toStrictEqual(new Decimal(12.4))
})
