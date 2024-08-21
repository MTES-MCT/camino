import Decimal from 'decimal.js'
import { fromUniteFiscaleToUnite } from './unites'
import { test, expect } from 'vitest'

test('fromUniteFiscaleToUnite', () => {
  expect(fromUniteFiscaleToUnite('mtk', new Decimal(142_764_000))).toStrictEqual(new Decimal(142.764))
  expect(fromUniteFiscaleToUnite('gon', new Decimal(182)).toNumber()).toBeCloseTo(202.22)
  expect(fromUniteFiscaleToUnite('deg', new Decimal(182))).toStrictEqual(new Decimal(182))
})
