import { newEtapeId } from '../../database/models/_format/id-create.js'
import { titreSectionsGet } from './titre-contenu.js'
import { describe, test, expect } from 'vitest'

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
