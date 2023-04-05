import { isDemarcheStatutNonStatue, isDemarcheStatutNonValide } from './demarchesStatuts.js'
import { test, expect } from 'vitest'

test('isDemarcheStatutNonStatue', () => {
  expect(isDemarcheStatutNonStatue(null)).toBe(false)
  expect(isDemarcheStatutNonStatue(undefined)).toBe(false)
  expect(isDemarcheStatutNonStatue('acc')).toBe(false)
  expect(isDemarcheStatutNonStatue('cls')).toBe(false)
  expect(isDemarcheStatutNonStatue('ins')).toBe(true)
})

test('isDemarcheStatutNonValide', () => {
  expect(isDemarcheStatutNonValide(null)).toBe(false)
  expect(isDemarcheStatutNonValide(undefined)).toBe(false)
  expect(isDemarcheStatutNonValide('acc')).toBe(false)
  expect(isDemarcheStatutNonValide('ins')).toBe(false)
  expect(isDemarcheStatutNonValide('cls')).toBe(true)
})
