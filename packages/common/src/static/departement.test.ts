import { checkCodePostal, isDepartementId, toDepartementId, departementsMetropole } from './departement'
import { test, expect } from 'vitest'

test('isDepartementId', () => {
  expect(isDepartementId(null)).toBe(false)
  expect(isDepartementId(undefined)).toBe(false)
  expect(isDepartementId('973')).toBe(true)
})

test('toDepartementId', () => {
  expect(toDepartementId(checkCodePostal('97311'))).toBe('973')
  expect(toDepartementId(checkCodePostal('71056'))).toBe('71')
  expect(toDepartementId(checkCodePostal('06093'))).toBe('06')
})

test('departementsMetropole', () => {
  expect(departementsMetropole).not.toContain(['971', '972', '973', '974', '976'])
})
