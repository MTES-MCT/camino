import { test, expect } from 'vitest'
import { etapeDocumentIdValidator } from './etape.js'


test('documentIdValidator', () => {
  expect(() => etapeDocumentIdValidator.parse('2021-01-01-kbi-ac123457')).not.toThrowError()
})
