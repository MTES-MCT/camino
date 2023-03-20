import { expect, test } from 'vitest'
import { isGeoSystemeId } from './geoSystemes'

test('isGeoSystemeId', () => {
  expect(isGeoSystemeId('12')).toBe(false)
  expect(isGeoSystemeId('4326')).toBe(true)
})
