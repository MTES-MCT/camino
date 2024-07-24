import { test, expect } from 'vitest'
import { idGenerate, newEtapeDocumentId, newTitreSlug } from './id-create'
import { toCaminoDate } from 'camino-common/src/date'

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
