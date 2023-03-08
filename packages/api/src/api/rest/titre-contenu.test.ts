import { contenuFormat, titreSectionsGet } from './titre-contenu.js'
import { describe, test, expect } from 'vitest'
import { ETAPES_TYPES, EtapesTypes } from 'camino-common/src/static/etapesTypes.js'
describe('formatage du contenu', () => {
  test("formate le contenu d'un titre", () => {
    expect(
      contenuFormat({
        contenusTitreEtapesIds: {
          section: { prop1: 'etape-id', prop2: 'etape-id' },
        },
        demarches: [
          {
            etapes: [
              {
                id: 'etape-id',
                contenu: {
                  section: {
                    prop1: 'valeur 1',
                    prop2: 'valeur 2',
                  },
                },
              },
            ],
          },
        ],
      })
    ).toMatchObject({ section: { prop1: 'valeur 1', prop2: 'valeur 2' } })
  })

  test("retourne un contenu vide si le titre n'a pas de démarches ou d'étapes", () => {
    expect(
      contenuFormat({
        contenusTitreEtapesIds: {
          section: {
            prop: 'etape-id',
          },
        },
        demarches: [],
      })
    ).toMatchObject({})

    expect(
      contenuFormat({
        contenusTitreEtapesIds: {
          section: {
            prop: 'etape-id',
          },
        },
        demarches: [{ etapes: null }],
      })
    ).toMatchObject({})

    expect(
      contenuFormat({
        contenusTitreEtapesIds: {
          section: {
            prop: 'etape-id',
          },
        },
        demarches: [{ etapes: [] }],
      })
    ).toMatchObject({})
  })
})

describe('titreSectionsGet', () => {
  test("formate les sections d'un titre", () => {
    expect(
      titreSectionsGet({
        contenusTitreEtapesIds: {
          section: { prop1: 'etape-id', prop2: 'etape-id' },
        },
        demarches: [
          {
            etapes: [
              {
                id: 'etape-id',
                type: {
                  ...EtapesTypes[ETAPES_TYPES.demande],
                  ordre: 1,
                  sections: [
                    {
                      id: 'section',
                      elements: [
                        { id: 'prop1', nom: 'Prop 1', type: 'text' },
                        { id: 'prop2', nom: 'Prop 2', type: 'number' },
                      ],
                    },
                  ],
                },
                contenu: {
                  section: {
                    prop1: 'valeur 1',
                    prop2: 2,
                  },
                },
              },
            ],
          },
        ],
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "elements": [
            {
              "id": "prop1",
              "nom": "Prop 1",
              "type": "text",
              "value": "valeur 1",
            },
            {
              "id": "prop2",
              "nom": "Prop 2",
              "type": "number",
              "value": 2,
            },
          ],
          "id": "section",
        },
      ]
    `)
  })
})
