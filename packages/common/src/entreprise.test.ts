import { test, expect } from 'vitest'
import { documentIdValidator, sirenValidator } from './entreprise.js'

test('sirenValidator', () => {
  expect(sirenValidator.safeParse('123456789').success).toBe(true)
  expect(sirenValidator.safeParse('').success).toBe(false)
  expect(sirenValidator.safeParse('1234567@9').success).toBe(false)
  expect(sirenValidator.safeParse('absceuoaue').success).toBe(false)
  expect(sirenValidator.safeParse('1234567').success).toBe(false)
  expect(sirenValidator.safeParse('1234567890').success).toBe(false)
})

test('documentIdValidator', () => {
  expect(() => documentIdValidator.parse('2021-01-01-kbi-ac123457')).not.toThrowError()
})
