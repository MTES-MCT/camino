import { isGuyane, isMetropole, isOutreMer, isPaysId, PAYS_IDS } from './pays.js'
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

test('isOutreMer', () => {
  expect(isOutreMer('FR')).toBe(false)
  expect(isOutreMer(null)).toBe(false)
  expect(isOutreMer('GF')).toBe(true)
  expect(isOutreMer('XX')).toBe(true)
})

test('isGuyane', () => {
  expect(isGuyane('FR')).toBe(false)
  expect(isGuyane(null)).toBe(false)
  expect(isGuyane('GF')).toBe(true)
  expect(isGuyane('XX')).toBe(false)
})

test('isMetropole', () => {
  expect(isMetropole('FR')).toBe(true)
  expect(isMetropole(null)).toBe(false)
  expect(isMetropole('GF')).toBe(false)
  expect(isMetropole('XX')).toBe(false)
})
