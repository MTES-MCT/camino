import { test, expect } from 'vitest'
import { idGenerate, newDemarcheSlug, newEtapeDocumentId, newTitreSlug } from './id-create'
import { toCaminoDate } from 'camino-common/src/date'
import { titreIdValidator } from 'camino-common/src/validators/titres'

test('idGenerate', () => {
  expect(idGenerate()).toHaveLength(24)
  expect(idGenerate(24)).toHaveLength(24)
  expect(idGenerate(12)).toHaveLength(12)
})
test('newDocumentId', () => {
  expect(newEtapeDocumentId(toCaminoDate('2023-01-01'), 'aac')).toHaveLength(23)
})
test('newTitreSlug', () => {
  expect(newTitreSlug('apc', 'nom')).toHaveLength(13)
})
test('newDemarcheSlug', () => {
  expect(newDemarcheSlug(titreIdValidator.parse('titreId'), 'oct')).toBe('titreId-oct99')
})
