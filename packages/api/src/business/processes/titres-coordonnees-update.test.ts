import { isTitreCoordonneesToUpdate } from './titres-coordonnees-update.js'
import { describe, expect, test } from 'vitest'

describe('coordoonnées des titres', () => {
  test.each([{ x: 1, y: 1 }, { x: 1 }, { y: 1 }, undefined])("met à jour les coordonnees d'un titre", coordonnees => {
    expect(isTitreCoordonneesToUpdate(coordonnees, { x: 1, y: 0.5 })).toBe(true)
  })

  test.each([null, { x: null, y: 1 }])("enlève les coordonnees d'un titre sans points", newCoordonnees => {
    expect(isTitreCoordonneesToUpdate({ x: 1, y: 1 }, newCoordonnees)).toBe(true)
  })

  test("met à jour les coordonnees d'un titre", async () => {
    expect(isTitreCoordonneesToUpdate(null, { x: null, y: 1 })).toBe(true)
  })

  test('ne met à jour aucun titre', async () => {
    expect(isTitreCoordonneesToUpdate({ x: 1, y: 0.5 }, { x: 1, y: 0.5 })).toBe(false)
  })
})
