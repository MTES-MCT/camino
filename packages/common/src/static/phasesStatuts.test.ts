import { test, expect } from 'vitest'
import { isDemarchePhaseValide } from './phasesStatuts'
import { toCaminoDate } from '../date'

test('isDemarchePhaseValide', () => {
  expect(isDemarchePhaseValide(toCaminoDate('2022-01-01'), null)).toBe(false)
  expect(isDemarchePhaseValide(toCaminoDate('2022-01-01'), { demarcheDateDebut: toCaminoDate('2021-01-01') })).toBe(true)
  expect(isDemarchePhaseValide(toCaminoDate('2022-01-01'), { demarcheDateDebut: toCaminoDate('2021-01-01'), demarcheDateFin: toCaminoDate('2021-12-31') })).toBe(false)
})
