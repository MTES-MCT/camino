import { test, expect } from 'vitest'
import { isEntrepriseId, sirenValidator, toEntrepriseDocumentId } from './entreprise'
import { toCaminoDate } from './date'

test('sirenValidator', () => {
  expect(sirenValidator.safeParse('123456789').success).toBe(true)
  expect(sirenValidator.safeParse('').success).toBe(false)
  expect(sirenValidator.safeParse('1234567@9').success).toBe(false)
  expect(sirenValidator.safeParse('absceuoaue').success).toBe(false)
  expect(sirenValidator.safeParse('1234567').success).toBe(false)
  expect(sirenValidator.safeParse('1234567890').success).toBe(false)
})

test('isEntrepriseId', () => {
  expect(isEntrepriseId('id')).toBe(true)
})

test('toEntrepriseDocumentId', () => {
  expect(toEntrepriseDocumentId(toCaminoDate('2023-01-01'), 'aac', 'hash')).toBe('2023-01-01-aac-hash')
})
