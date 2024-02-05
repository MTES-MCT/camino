import { isGuyane, isMetropole, isOutreMer } from './pays.js'
import { test, expect } from 'vitest'

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
