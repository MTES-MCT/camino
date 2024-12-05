import { isNumberElement } from '../../sections'
import { getElementWithValue, getSections, getSectionsWithValue, sectionValidator } from './sections'
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
    "[Error: il manque des éléments pour trouver les sections titreTypeId: 'undefined', demarcheId: undefined, etapeTypeId: undefined]"
  )
})

test('getSections pas de surcharge mais pas de sections', () => {
  expect(getSections('apm', 'amo', 'asc')).toMatchInlineSnapshot('[]')
})

test('getSections retourne le numéro de RAA pour les publications de décision au RAA', () => {
  expect(getSections('pxg', 'oct', 'rpu')).toMatchInlineSnapshot(`
    [
      {
        "elements": [
          {
            "description": "(m³/h)",
            "id": "debit",
            "nom": "Débit volumique maximal de pompage",
            "optionnel": true,
            "type": "number",
            "uniteId": "m3h",
          },
          {
            "description": "(m³/an)",
            "id": "volume",
            "nom": "Volume annuel maximum de pompage",
            "optionnel": true,
            "type": "number",
            "uniteId": "m3a",
          },
          {
            "description": "kW",
            "id": "puissancePrimaire",
            "nom": "Puissance primaire",
            "optionnel": true,
            "type": "number",
            "uniteId": "kwa",
          },
          {
            "description": "m NGF",
            "id": "profondeurToitNappe",
            "nom": "Profondeur du toit de la nappe exploitée",
            "optionnel": true,
            "type": "number",
            "uniteId": "met",
          },
          {
            "description": "m NGF",
            "id": "profondeurBaseNappe",
            "nom": "Profondeur de la base de la nappe exploitée",
            "optionnel": true,
            "type": "number",
            "uniteId": "met",
          },
          {
            "id": "horizonsGeologiquesExploites",
            "nom": "Horizons géologiques exploités",
            "optionnel": true,
            "options": [
              {
                "id": "Le Lutétien",
                "nom": "Le Lutétien",
              },
              {
                "id": "L'Yprésien",
                "nom": "L'Yprésien",
              },
              {
                "id": "La Craie du Campanien",
                "nom": "La Craie du Campanien",
              },
              {
                "id": "L'Albien / Néocomien",
                "nom": "L'Albien / Néocomien",
              },
              {
                "id": "Le Dogger",
                "nom": "Le Dogger",
              },
            ],
            "type": "checkboxes",
          },
        ],
        "id": "pxg",
        "nom": "Propriétés du permis d'exploitation",
      },
      {
        "elements": [
          {
            "id": "numeroRAA",
            "nom": "Numéro de RAA ",
            "optionnel": true,
            "type": "text",
          },
        ],
        "id": "praa",
        "nom": "Propriétés de la publication",
      },
    ]
  `)
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

describe('getElementWithValue', () => {
  const sectionWithValue = getSectionsWithValue(
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
  test('peut récupérer un élement avec sa value', () => {
    expect(getElementWithValue(sectionWithValue, 'section', 'element2')).toMatchInlineSnapshot(`
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
      }
    `)
  })

  test('ne récupére rien si inexistant', () => {
    expect(getElementWithValue(sectionWithValue, 'section', 'elementInexistant')).toStrictEqual(null)
  })
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

  test("les substances fiscales sont converties dans leur unité d'affichage", () => {
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

  test('les options des liste déroulantes sont récupérables', () => {
    expect(
      getSectionsWithValue(
        [
          {
            id: 'section',
            elements: [
              {
                id: 'test',
                type: 'select',
                options: [
                  { id: 'id1', nom: 'nom1' },
                  { id: 'id2', nom: 'nom2' },
                ],
                optionnel: false,
              },
            ],
          },
        ],
        { section: { test: 'id1' } }
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "elements": [
            {
              "id": "test",
              "optionnel": false,
              "options": [
                {
                  "id": "id1",
                  "nom": "nom1",
                },
                {
                  "id": "id2",
                  "nom": "nom2",
                },
              ],
              "type": "select",
              "value": "id1",
            },
          ],
          "id": "section",
        },
      ]
    `)
  })
})

// pour regénérer le fichier: `npm run test:generate-sections-data -w packages/api`
test.each(activitesSectionsProd as any[])("cas réel des sections d'activité N°%#", sections => {
  sectionValidator.parse(sections)
})
