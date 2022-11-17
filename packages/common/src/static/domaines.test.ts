import { Domaines, DOMAINES_IDS, isDomaineId } from './domaines'
import { test, expect } from 'vitest'

test('domaine', () => {
  expect(Domaines.c).toBe(Domaines[DOMAINES_IDS.CARRIERES])
})

test('isDomaineId', () => {
  expect(isDomaineId('m')).toBe(true)
  expect(isDomaineId('')).toBe(false)
  expect(isDomaineId('notADomaine')).toBe(false)
  expect(isDomaineId(null)).toBe(false)
  expect(isDomaineId(undefined)).toBe(false)
})
