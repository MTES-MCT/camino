import { isSubstancesFiscales } from './activitesTypes'
import { test, expect } from 'vitest'

test('isSubstancesFiscales', () => {
  expect(isSubstancesFiscales({ elements: [], id: 'id', nom: 'nom' })).toBe(false)
})
