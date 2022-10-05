import { isRegionId } from './region'

test('isRegionId', () => {
  expect(isRegionId('wolf')).toBe(false)
  expect(isRegionId('28')).toBe(true)
})
