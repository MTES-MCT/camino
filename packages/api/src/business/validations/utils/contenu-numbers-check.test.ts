import { contenuNumbersCheck } from './contenu-numbers-check.js'
import { describe, test, expect } from 'vitest'

describe('vérifie la validité du contenu de type nombre', () => {
  test("la sections n'a pas d'éléments", () => {
    expect(contenuNumbersCheck([{ id: 'section-sans-elements', elements: [] }], { section: { number: { value: 123 } } })).toEqual(null)
  })

  test('un champ de section dont le type est un nombre et qui a une valeur positive est validée', () => {
    expect(contenuNumbersCheck([{ id: 'section', elements: [{ id: 'number', type: 'number', optionnel: false }] }], { section: { number: { value: 123 } } })).toBeNull()
  })

  test('un champ de section dont le type est un nombre et qui a une valeur négative retourne une erreur', () => {
    expect(
      contenuNumbersCheck([{ id: 'section', elements: [{ id: 'number', type: 'number', optionnel: false }] }], {
        section: {
          number: { value: -1 },
        },
      })
    ).toContain('le champ "number" est invalide')
  })
})
