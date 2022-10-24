import { getDepartementsByIds, getSecteurMaritime } from './facades'
import { DEPARTEMENT_IDS } from './departement'

test('getDepartementsByIds', () => {
  expect(getDepartementsByIds([17, 19])).toEqual([DEPARTEMENT_IDS.Vendée])
})
test('getSecteurMaritime', () => {
  expect(getSecteurMaritime(43)).toEqual('Riviera')
})
