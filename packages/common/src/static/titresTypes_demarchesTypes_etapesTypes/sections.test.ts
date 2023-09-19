import { getSections, getSectionsWithValue, sectionValidator } from './sections.js'
import { test, expect, describe } from 'vitest'

test('getSections erreurs', () => {
  expect(() => getSections(undefined, undefined, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"il manque des éléments pour trouver les sections titreTypeId: \'undefined\', demarcheId: undefined, etapeTypeId: undefined"'
  )
})

test('getSections pas de surcharge mais pas de sections', () => {
  expect(getSections('apm', 'amo', 'abs')).toMatchInlineSnapshot('[]')
})

test('getSections surcharge', () => {
  expect(getSections('arm', 'oct', 'rde')).toMatchInlineSnapshot(`
    [
      {
        "elements": [
          {
            "description": "Nombre de franchissements de cours d'eau",
            "id": "franchissements",
            "nom": "Franchissements de cours d'eau",
            "optionnel": true,
            "type": "integer",
          },
        ],
        "id": "arm",
        "nom": "Caractéristiques ARM",
      },
      {
        "elements": [
          {
            "description": "Numéro de dossier DEAL Service eau",
            "id": "numero-dossier-deal-eau",
            "nom": "Numéro de dossier",
            "optionnel": true,
            "type": "text",
          },
          {
            "description": "Numéro de récépissé émis par la DEAL Service eau",
            "id": "numero-recepisse",
            "nom": "Numéro de récépissé",
            "optionnel": true,
            "type": "text",
          },
        ],
        "id": "deal",
        "nom": "DEAL",
      },
    ]
  `)
})

test('sectionValidator prod', () => {
  expect(
    sectionValidator.parse({
      id: 'travaux',
      nom: 'Statut des travaux',
      elements: [
        {
          id: '4',
          nom: 'Avril',
          type: 'checkboxes',
          options: [
            {
              id: 'nonDebutes',
              nom: 'non débutés',
            },
            {
              id: 'exploitationEnCours',
              nom: 'exploitation en cours',
            },
            {
              id: 'arretTemporaire',
              nom: 'arrêt temporaire',
            },
            {
              id: 'rehabilitation',
              nom: 'réhabilitation',
            },
            {
              id: 'arretDefinitif',
              nom: 'arrêt définitif (après réhabilitation)',
            },
          ],
        },
        {
          id: '5',
          nom: 'Mai',
          type: 'checkboxes',
          options: [
            {
              id: 'nonDebutes',
              nom: 'non débutés',
            },
            {
              id: 'exploitationEnCours',
              nom: 'exploitation en cours',
            },
            {
              id: 'arretTemporaire',
              nom: 'arrêt temporaire',
            },
            {
              id: 'rehabilitation',
              nom: 'réhabilitation',
            },
            {
              id: 'arretDefinitif',
              nom: 'arrêt définitif (après réhabilitation)',
            },
          ],
        },
        {
          id: '6',
          nom: 'Juin',
          type: 'checkboxes',
          options: [
            {
              id: 'nonDebutes',
              nom: 'non débutés',
            },
            {
              id: 'exploitationEnCours',
              nom: 'exploitation en cours',
            },
            {
              id: 'arretTemporaire',
              nom: 'arrêt temporaire',
            },
            {
              id: 'rehabilitation',
              nom: 'réhabilitation',
            },
            {
              id: 'arretDefinitif',
              nom: 'arrêt définitif (après réhabilitation)',
            },
          ],
        },
      ],
    })
  )
})

describe('getSectionsWithValue', () => {
  test('les éléments checkboxes sont initialisés avec un tableau vide', () => {
    expect(
      getSectionsWithValue(
        [
          {
            id: 'section',
            elements: [
              { id: 'element1', type: 'checkboxes', options: [{ id: 'option1', nom: 'nomOption1' }] },
              {
                id: 'element2',
                type: 'checkboxes',
                options: [
                  { id: '1', nom: 'one' },
                  { id: '2', nom: 'two' },
                ],
              },
              { id: 'element3', type: 'checkboxes', options: [{ id: '1', nom: 'one' }] },
            ],
          },
        ],
        { section: { element1: null, element2: ['1'] } }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "elements": [
            {
              "id": "element1",
              "options": [
                {
                  "id": "option1",
                  "nom": "nomOption1",
                },
              ],
              "type": "checkboxes",
              "value": [],
            },
            {
              "id": "element2",
              "options": [
                {
                  "id": "1",
                  "nom": "one",
                },
                {
                  "id": "2",
                  "nom": "two",
                },
              ],
              "type": "checkboxes",
              "value": [
                "1",
              ],
            },
            {
              "id": "element3",
              "options": [
                {
                  "id": "1",
                  "nom": "one",
                },
              ],
              "type": "checkboxes",
              "value": [],
            },
          ],
          "id": "section",
        },
      ]
    `)
  })

  test('les substances fiscales sont converties dans leur unité d’affichage', () => {
    expect(
      getSectionsWithValue(
        [
          {
            id: 'substancesFiscales',
            elements: [
              { id: 'auru', type: 'number', uniteId: 'mgr' },
              { id: 'arge', type: 'integer' },
              { id: 'arse', type: 'integer' },
            ],
          },
        ],
        { substancesFiscales: { auru: 12.3, arge: null } }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "elements": [
            {
              "id": "auru",
              "type": "number",
              "uniteId": "mgr",
              "value": 12300,
            },
            {
              "id": "arge",
              "type": "integer",
              "value": null,
            },
            {
              "id": "arse",
              "type": "integer",
              "value": null,
            },
          ],
          "id": "substancesFiscales",
        },
      ]
    `)
  })

  test('les options des liste déroulantes sont calculées si elles sont basées sur des métas', () => {
    expect(
      getSectionsWithValue(
        [
          {
            id: 'section',
            elements: [
              { id: 'unites', type: 'select', valeursMetasNom: 'unites' },
              { id: 'devises', type: 'select', valeursMetasNom: 'devises' },
            ],
          },
        ],
        { section: { unites: 'mtk', devises: null } }
      )
    ).toMatchInlineSnapshot(`
    [
      {
        "elements": [
          {
            "id": "unites",
            "options": [
              {
                "id": "deg",
                "nom": "degré",
                "referenceUniteId": null,
                "referenceUniteRatio": null,
                "symbole": "º",
              },
              {
                "id": "gon",
                "nom": "grade",
                "referenceUniteId": "deg",
                "referenceUniteRatio": 0.9,
                "symbole": "gon",
              },
              {
                "id": "km3",
                "nom": "kilomètre cube",
                "referenceUniteId": "m3x",
                "referenceUniteRatio": 1000000000,
                "symbole": "km³",
              },
              {
                "id": "m3a",
                "nom": "mètre cube par an",
                "referenceUniteId": null,
                "referenceUniteRatio": null,
                "symbole": "m³ / an",
              },
              {
                "id": "m3x",
                "nom": "mètre cube",
                "referenceUniteId": null,
                "referenceUniteRatio": null,
                "symbole": "m³",
              },
              {
                "id": "met",
                "nom": "mètre",
                "referenceUniteId": null,
                "referenceUniteRatio": null,
                "symbole": "m",
              },
              {
                "id": "mgr",
                "nom": "gramme",
                "referenceUniteId": "mkg",
                "referenceUniteRatio": 0.001,
                "symbole": "g",
              },
              {
                "id": "mkc",
                "nom": "quintal",
                "openfiscaId": "100kg",
                "referenceUniteId": "mkg",
                "referenceUniteRatio": 100,
                "symbole": "x 100 kg",
              },
              {
                "id": "mkg",
                "nom": "kilogramme",
                "openfiscaId": "kg",
                "referenceUniteId": null,
                "referenceUniteRatio": null,
                "symbole": "kg",
              },
              {
                "id": "mtc",
                "nom": "centaine de tonnes",
                "openfiscaId": "100t",
                "referenceUniteId": "mkg",
                "referenceUniteRatio": 100000,
                "symbole": "x 100 t",
              },
              {
                "id": "mtk",
                "nom": "millier de tonnes",
                "openfiscaId": "kt",
                "referenceUniteId": "mkg",
                "referenceUniteRatio": 1000000,
                "symbole": "x 1000 t",
              },
              {
                "id": "mtt",
                "nom": "tonne",
                "openfiscaId": "t",
                "referenceUniteId": "mkg",
                "referenceUniteRatio": 1000,
                "symbole": "t",
              },
              {
                "id": "txa",
                "nom": "tonnes par an",
                "referenceUniteId": null,
                "referenceUniteRatio": null,
                "symbole": "t / an",
              },
              {
                "id": "vmd",
                "nom": "100 000 mètres cubes",
                "openfiscaId": "100km3",
                "referenceUniteId": "m3x",
                "referenceUniteRatio": 100000,
                "symbole": "x 100 000 m³",
              },
            ],
            "type": "select",
            "valeursMetasNom": "unites",
            "value": "mtk",
          },
          {
            "id": "devises",
            "options": [
              {
                "id": "EUR",
                "nom": "Euros",
                "ordre": 1,
              },
              {
                "id": "XPF",
                "nom": "Francs Pacifique",
                "ordre": 2,
              },
              {
                "id": "FRF",
                "nom": "Francs",
                "ordre": 3,
              },
            ],
            "type": "select",
            "valeursMetasNom": "devises",
            "value": null,
          },
        ],
        "id": "section",
      },
    ]
  `)
  })
})
