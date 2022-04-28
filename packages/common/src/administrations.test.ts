import test from 'ava'
import { sortedAdministrationTypes } from './administrations'

test('sortedAdministrationTypes', t => {
  t.snapshot(sortedAdministrationTypes)
})
