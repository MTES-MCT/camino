import { test, expect } from 'vitest'
import { indexToLetter, toDegresMinutesSecondes } from './number'

test('indexToLetter', () => {
  expect(indexToLetter(0)).toBe('A')
  expect(indexToLetter(1)).toBe('B')
  expect(indexToLetter(25)).toBe('Z')
  expect(indexToLetter(26)).toBe('AA')
  expect(indexToLetter(28)).toBe('AC')
  expect(indexToLetter(52)).toBe('BA')
})

test('toDegresMinutesSecondes', () => {
  expect(toDegresMinutesSecondes(50.467995)).toStrictEqual({
    degres: 50,
    minutes: 28,
    secondes: 4.782,
  })

  expect(toDegresMinutesSecondes(11.719666)).toStrictEqual({
    degres: 11,
    minutes: 43,
    secondes: 10.798,
  })
  expect(toDegresMinutesSecondes(-6.113892)).toStrictEqual({
    degres: -6,
    minutes: 6,
    secondes: 50.011,
  })
})
