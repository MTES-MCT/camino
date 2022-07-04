import { isDepartementId } from './departement'

test('isDepartementId', () => {
  expect(isDepartementId(null)).toBe(false)
  expect(isDepartementId(undefined)).toBe(false)
  expect(isDepartementId('973')).toBe(true)
})
