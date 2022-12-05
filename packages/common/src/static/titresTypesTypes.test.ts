import { isTitreTypeType } from './titresTypesTypes.js'
import { test, expect } from 'vitest'

test('isTitreTypeType', () => {
  expect(isTitreTypeType('px')).toBe(true)
  expect(isTitreTypeType('')).toBe(false)
  expect(isTitreTypeType('notATitreTypeType')).toBe(false)
  expect(isTitreTypeType(null)).toBe(false)
  expect(isTitreTypeType(undefined)).toBe(false)
})
