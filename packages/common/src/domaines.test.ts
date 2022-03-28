import test from 'ava'
import { Domaines, DOMAINES_IDS } from './domaines'

test('domaine', t => {
  t.is(Domaines.c, Domaines[DOMAINES_IDS.CARRIERES])
})
