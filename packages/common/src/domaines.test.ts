import test from 'ava'
import { Domaines, DOMAINES_IDS } from './domaines'

test('domaine', t => {
  const domaine = DOMAINES_IDS[0]
  t.is(Domaines.c, Domaines[domaine])
})
