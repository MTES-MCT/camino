import { contenuDatesCheck } from './contenu-dates-check.js'
import { describe, test, expect } from 'vitest'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { CaminoDate } from 'camino-common/src/date.js'

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
})
