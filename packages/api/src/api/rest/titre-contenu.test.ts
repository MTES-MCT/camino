import { newEtapeId } from '../../database/models/_format/id-create.js'
import { contenuFormat, titreSectionsGet } from './titre-contenu.js'
import { describe, test, expect } from 'vitest'
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
                id: newEtapeId('etape-id'),
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
          arm: { mecanise: 'etape-id', franchissements: 'etape-id' },
        },
        typeId: 'arm',
        demarches: [
          {
            typeId: 'oct',
            etapes: [
              {
                id: newEtapeId('etape-id'),
                typeId: 'mfr',
                contenu: {
                  arm: {
                    mecanise: true,
                    franchissements: 2,
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
              "description": "",
              "id": "mecanise",
              "nom": "Prospection mécanisée",
              "type": "radio",
              "value": true,
            },
            {
              "description": "Nombre de franchissements de cours d'eau",
              "id": "franchissements",
              "nom": "Franchissements de cours d'eau",
              "optionnel": true,
              "type": "integer",
              "value": 2,
            },
          ],
          "id": "arm",
          "nom": "Caractéristiques ARM",
        },
      ]
    `)
  })
})
