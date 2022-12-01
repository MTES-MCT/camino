import { fromUniteFiscaleToUnite } from './unites.js'
import { test, expect } from 'vitest'

test('fromUniteFiscaleToUnite', () => {
  expect(fromUniteFiscaleToUnite('mtk', 142_764_000)).toBe(142.764)
  expect(fromUniteFiscaleToUnite('gon', 182)).toBeCloseTo(202.22)
  expect(fromUniteFiscaleToUnite('deg', 182)).toBe(182)
})
