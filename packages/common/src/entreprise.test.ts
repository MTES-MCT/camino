import { test, expect } from 'vitest'
import { sirenValidator } from './entreprise.js'

test('sirenValidator', () => {
  expect(sirenValidator.safeParse('123456789').success).toBe(true)
  expect(sirenValidator.safeParse('').success).toBe(false)
  expect(sirenValidator.safeParse('1234567@9').success).toBe(false)
  expect(sirenValidator.safeParse('absceuoaue').success).toBe(false)
  expect(sirenValidator.safeParse('1234567').success).toBe(false)
  expect(sirenValidator.safeParse('1234567890').success).toBe(false)
})
