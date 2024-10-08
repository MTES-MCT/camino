import { isNumberElement } from '../../sections'
import { getSections, getSectionsWithValue, sectionValidator } from './sections'
import { test, expect, describe } from 'vitest'
const activitesSectionsProd = require('./activites.sections.json') // eslint-disable-line

test('isNumberElement', () => {
  expect(
    isNumberElement({
      id: 'xxx',
      type: 'integer',
      value: 2,
      optionnel: false,
    })
  ).toBe(true)
})

test('getSections erreurs', () => {
  expect(() => getSections(undefined, undefined, undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: il manque des éléments pour trouver les sections titreTypeId: 'undefined', demarcheId: undefined, etapeTypeId: undefined]`
  )
})

test('getSections pas de surcharge mais pas de sections', () => {
  expect(getSections('apm', 'amo', 'asc')).toMatchInlineSnapshot('[]')
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
              { id: 'element1', type: 'checkboxes', options: [{ id: 'option1', nom: 'nomOption1' }], optionnel: false },
              {
                id: 'element2',
                type: 'checkboxes',
                options: [
                  { id: '1', nom: 'one' },
                  { id: '2', nom: 'two' },
                ],
                optionnel: false,
              },
              { id: 'element3', type: 'checkboxes', options: [{ id: '1', nom: 'one' }], optionnel: false },
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
              "optionnel": false,
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
              "optionnel": false,
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
              "optionnel": false,
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
    const withHeritage = getSectionsWithValue(
      [
        {
          id: 'substancesFiscales',
          elements: [
            { id: 'auru', type: 'number', uniteId: 'mgr', optionnel: false },
            { id: 'arge', type: 'integer', optionnel: false },
            { id: 'arse', type: 'integer', optionnel: false },
          ],
        },
      ],
      { substancesFiscales: { auru: { value: 12.3 }, arge: { value: null } } }
    )
    const withoutHeritage = getSectionsWithValue(
      [
        {
          id: 'substancesFiscales',
          elements: [
            { id: 'auru', type: 'number', uniteId: 'mgr', optionnel: false },
            { id: 'arge', type: 'integer', optionnel: false },
            { id: 'arse', type: 'integer', optionnel: false },
          ],
        },
      ],
      { substancesFiscales: { auru: 12.3, arge: null } }
    )
    expect(withoutHeritage).toMatchInlineSnapshot(`
      [
        {
          "elements": [
            {
              "id": "auru",
              "optionnel": false,
              "type": "number",
              "uniteId": "mgr",
              "value": 12300,
            },
            {
              "id": "arge",
              "optionnel": false,
              "type": "integer",
              "value": null,
            },
            {
              "id": "arse",
              "optionnel": false,
              "type": "integer",
              "value": null,
            },
          ],
          "id": "substancesFiscales",
        },
      ]
    `)
    expect(withHeritage).toStrictEqual(withoutHeritage)
  })

  test('les options des liste déroulantes sont calculées si elles sont basées sur des métas', () => {
    expect(
      getSectionsWithValue(
        [
          {
            id: 'section',
            elements: [
              { id: 'unites', type: 'select', valeursMetasNom: 'unites', optionnel: false },
              { id: 'devises', type: 'select', valeursMetasNom: 'devises', optionnel: false },
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
              "optionnel": false,
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
                  "id": "m3h",
                  "nom": "mètre cube par heure",
                  "referenceUniteId": null,
                  "referenceUniteRatio": null,
                  "symbole": "m³/h",
                },
                {
                  "id": "m3a",
                  "nom": "mètre cube par an",
                  "referenceUniteId": null,
                  "referenceUniteRatio": null,
                  "symbole": "m³/an",
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
                  "referenceUniteId": "mkg",
                  "referenceUniteRatio": 100,
                  "symbole": "x 100 kg",
                  "uniteFiscaliteId": "100kg",
                },
                {
                  "id": "mkg",
                  "nom": "kilogramme",
                  "referenceUniteId": null,
                  "referenceUniteRatio": null,
                  "symbole": "kg",
                  "uniteFiscaliteId": "kg",
                },
                {
                  "id": "mtc",
                  "nom": "centaine de tonnes",
                  "referenceUniteId": "mkg",
                  "referenceUniteRatio": 100000,
                  "symbole": "x 100 t",
                  "uniteFiscaliteId": "100t",
                },
                {
                  "id": "mtk",
                  "nom": "millier de tonnes",
                  "referenceUniteId": "mkg",
                  "referenceUniteRatio": 1000000,
                  "symbole": "x 1000 t",
                  "uniteFiscaliteId": "kt",
                },
                {
                  "id": "mtt",
                  "nom": "tonne",
                  "referenceUniteId": "mkg",
                  "referenceUniteRatio": 1000,
                  "symbole": "t",
                  "uniteFiscaliteId": "t",
                },
                {
                  "id": "txa",
                  "nom": "tonnes par an",
                  "referenceUniteId": null,
                  "referenceUniteRatio": null,
                  "symbole": "t/an",
                },
                {
                  "id": "vmd",
                  "nom": "100 000 mètres cubes",
                  "referenceUniteId": "m3x",
                  "referenceUniteRatio": 100000,
                  "symbole": "x 100 000 m³",
                  "uniteFiscaliteId": "100km3",
                },
                {
                  "id": "kwa",
                  "nom": "kilowatt",
                  "referenceUniteId": null,
                  "referenceUniteRatio": null,
                  "symbole": "kW",
                },
              ],
              "type": "select",
              "valeursMetasNom": "unites",
              "value": "mtk",
            },
            {
              "id": "devises",
              "optionnel": false,
              "options": [
                {
                  "id": "EUR",
                  "nom": "Euros",
                },
                {
                  "id": "FRF",
                  "nom": "Francs",
                },
                {
                  "id": "XPF",
                  "nom": "Francs Pacifique",
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

// pour regénérer le fichier: `npm run test:generate-sections-data -w packages/api`
test.each(activitesSectionsProd as any[])("cas réel des sections d'activité N°$id", sections => {
  sectionValidator.parse(sections)
})
