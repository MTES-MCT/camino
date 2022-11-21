import { getDepartementsByIds, getSecteurMaritime } from './facades'
import { DEPARTEMENT_IDS } from './departement'
import { test, expect } from 'vitest'

test('getDepartementsByIds', () => {
  expect(getDepartementsByIds([17, 19])).toEqual([DEPARTEMENT_IDS.Finistère, DEPARTEMENT_IDS.Morbihan, DEPARTEMENT_IDS['Loire-Atlantique'], DEPARTEMENT_IDS.Vendée])
})
test('getSecteurMaritime', () => {
  expect(getSecteurMaritime(43)).toEqual('Riviera')
})
