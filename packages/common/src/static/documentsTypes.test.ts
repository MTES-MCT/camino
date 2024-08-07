import { isDocumentTypeId } from './documentsTypes'
import { test, expect } from 'vitest'

test('isDocumentTypeId', () => {
  expect(isDocumentTypeId('sch')).toBe(true)
  expect(isDocumentTypeId('')).toBe(false)
  expect(isDocumentTypeId('notADocumentType')).toBe(false)
  expect(isDocumentTypeId(null)).toBe(false)
  expect(isDocumentTypeId(undefined)).toBe(false)
  expect(isDocumentTypeId('aut')).toBe(false)
})
