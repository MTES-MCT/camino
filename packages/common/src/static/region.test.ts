import { isRegionId } from './region'
import { test, expect } from 'vitest'

test('isRegionId', () => {
  expect(isRegionId('wolf')).toBe(false)
  expect(isRegionId('28')).toBe(true)
})
