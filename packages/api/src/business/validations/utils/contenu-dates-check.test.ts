import { contenuDatesCheck } from './contenu-dates-check.js'
import { describe, test, expect } from 'vitest'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'

const sections: DeepReadonly<Section[]> = [
  {
    id: 'section',
    elements: [
      { id: 'date', type: 'date' },
      { id: 'mot', type: 'text' },
    ],
  },
]

describe("vérifie la validité des propriétés dont le type est date d'une étape", () => {
  test("la sections n'a pas d'éléments", () => {
    expect(
      contenuDatesCheck([{ id: 'section-sans-elements', elements: [] }], {
        section: { date: '2000-01-01', mot: 'coucou' },
      })
    ).toEqual(null)
  })

  test('les propriétés de type date ne contiennent pas de valeur négative', () => {
    expect(
      contenuDatesCheck(sections, {
        section: { date: '2000-01-01', mot: 'coucou' },
      })
    ).toEqual(null)
  })

  test("les dates n'ont pas de coordonnées de référence", () => {
    expect(
      contenuDatesCheck(sections, {
        section: { date: '2000-42-42', mot: 'coucou' },
      })
    ).toBe('le champ "date" n\'est pas une date valide')
  })
})
