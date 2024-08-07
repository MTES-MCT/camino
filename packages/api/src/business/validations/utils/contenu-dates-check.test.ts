import { contenuDatesCheck } from './contenu-dates-check'
import { describe, test, expect } from 'vitest'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { DeepReadonly } from 'camino-common/src/typescript-tools'
import { CaminoDate } from 'camino-common/src/date'

const sections: DeepReadonly<Section[]> = [
  {
    id: 'section',
    elements: [
      { id: 'date', type: 'date', optionnel: false },
      { id: 'mot', type: 'text', optionnel: false },
    ],
  },
]

describe("vérifie la validité des propriétés dont le type est date d'une étape", () => {
  test("la sections n'a pas d'éléments", () => {
    expect(
      contenuDatesCheck([{ id: 'section-sans-elements', elements: [] }], {
        section: { date: { value: '2000-01-01' as CaminoDate }, mot: { value: 'coucou' } },
      })
    ).toEqual(null)
  })

  test('les propriétés de type date ne contiennent pas de valeur négative', () => {
    expect(
      contenuDatesCheck(sections, {
        section: { date: { value: '2000-01-01' as CaminoDate }, mot: { value: 'coucou' } },
      })
    ).toEqual(null)
  })

  test("les dates n'ont pas de coordonnées de référence", () => {
    expect(
      contenuDatesCheck(sections, {
        section: { date: { value: '2000-42-42' as CaminoDate }, mot: { value: 'coucou' } },
      })
    ).toContain('le champ "date" est invalide')
  })

  test('les dates peuvent être obligatoires ou optionnelles', () => {
    expect(
      contenuDatesCheck(
        [
          {
            id: 'section',
            elements: [{ id: 'date', type: 'date', optionnel: false }],
          },
        ],
        {
          section: { date: { value: null } },
        }
      )
    ).toContain('le champ "date" est invalide')

    expect(
      contenuDatesCheck(
        [
          {
            id: 'section',
            elements: [{ id: 'date', type: 'date', optionnel: true }],
          },
        ],
        {
          section: { date: { value: null } },
        }
      )
    ).toBe(null)
  })
})
