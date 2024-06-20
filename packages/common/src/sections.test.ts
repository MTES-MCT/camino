import { test, expect } from 'vitest'
import { simpleContenuToFlattenedContenu } from './sections'
import { caminoDateValidator } from './date'

test('simpleContenuToFlattenedContenu', () => {
  expect(
    simpleContenuToFlattenedContenu(
      'arm',
      'oct',
      'mfr',
      { arm: { mecanise: true } },
      { arm: { mecanise: { actif: true, etape: { date: caminoDateValidator.parse('2023-02-02'), typeId: 'mfr', contenu: { arm: { mecanise: false } } } } } }
    )
  ).toMatchInlineSnapshot(`
      {
        "arm": {
          "franchissements": {
            "etapeHeritee": null,
            "heritee": false,
            "value": null,
          },
          "mecanise": {
            "etapeHeritee": {
              "date": "2023-02-02",
              "etapeTypeId": "mfr",
              "value": false,
            },
            "heritee": true,
            "value": false,
          },
        },
      }
    `)
  expect(
    simpleContenuToFlattenedContenu(
      'arm',
      'oct',
      'mfr',
      { arm: { mecanise: true } },
      { arm: { mecanise: { actif: false, etape: { date: caminoDateValidator.parse('2023-02-02'), typeId: 'mfr', contenu: { arm: { mecanise: false } } } } } }
    )
  ).toMatchInlineSnapshot(`
      {
        "arm": {
          "franchissements": {
            "etapeHeritee": null,
            "heritee": false,
            "value": null,
          },
          "mecanise": {
            "etapeHeritee": {
              "date": "2023-02-02",
              "etapeTypeId": "mfr",
              "value": false,
            },
            "heritee": false,
            "value": true,
          },
        },
      }
    `)
})
