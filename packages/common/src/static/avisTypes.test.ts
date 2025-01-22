import { test, expect } from 'vitest'
import { getAvisNom, getAvisStatut } from './avisTypes'

test('getAvisNom', () => {
  expect(getAvisNom('autreAvis')).toBe('Autre avis')
})

test('getAvisStatut', () => {
  expect(getAvisStatut('autreAvis', false)).toMatchInlineSnapshot(`
    [
      "Favorable",
      "Défavorable",
      "Favorable avec réserves",
      "Non renseigné",
    ]
  `)
  expect(getAvisStatut('autreAvis', true)).toMatchInlineSnapshot(`
    [
      "Favorable",
      "Défavorable",
      "Favorable avec réserves",
    ]
  `)
  expect(getAvisStatut(null, false)).toMatchInlineSnapshot(`
    [
      "Non renseigné",
    ]
  `)
})
