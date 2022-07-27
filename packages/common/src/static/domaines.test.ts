import { Domaines, DOMAINES_IDS } from './domaines'

test('domaine', () => {
  expect(Domaines.c).toBe(Domaines[DOMAINES_IDS.CARRIERES])
})
