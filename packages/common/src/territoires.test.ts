import { toCommuneId } from 'camino-common/src/static/communes.js'
import { describe, expect, test } from 'vitest'
import { territoiresFind, territoiresIdFind } from './territoires'
describe('territoiresFind', () => {
  test('territoiresFind uniquement des communes', () => {
    expect(
      territoiresFind(
        {
          [toCommuneId('72500')]: 'Flée',
          [toCommuneId('72200')]: 'Montval-sur-loir',
          [toCommuneId('37000')]: 'Tours',
        },
        [
          { id: toCommuneId('72500'), surface: 100000 },
          {
            id: toCommuneId('72200'),
            surface: 105020,
          },

          {
            id: toCommuneId('37000'),
            surface: 99999,
          },
        ]
      )
    ).toMatchInlineSnapshot(`
      {
        "communes": [
          {
            "nom": "Flée",
            "surface": 0.1,
          },
          {
            "nom": "Montval-sur-loir",
            "surface": 0.105,
          },
          {
            "nom": "Tours",
            "surface": 0.1,
          },
        ],
        "departements": [
          "Indre-et-Loire",
          "Sarthe",
        ],
        "facades": [],
        "regions": [
          "Centre-Val de Loire",
          "Pays de la Loire",
        ],
      }
    `)
  })
  test('territoiresFind uniquement des secteurs maritimes', () => {
    expect(territoiresFind({}, null, ['Baie de Seine'])).toMatchInlineSnapshot(`
      {
        "communes": [],
        "departements": [
          "Calvados",
          "Manche",
          "Seine-Maritime",
        ],
        "facades": [
          {
            "facade": "Manche Est - Mer du Nord",
            "secteurs": [
              "Baie de Seine",
            ],
          },
        ],
        "regions": [
          "Normandie",
        ],
      }
    `)
  })
  test('territoiresFind uniquement', () => {
    expect(
      territoiresFind(
        {
          [toCommuneId('37000')]: 'Tours',
        },
        [
          {
            id: toCommuneId('37000'),
            surface: 99999,
          },
        ],

        ['Baie de Seine']
      )
    ).toMatchInlineSnapshot(`
      {
        "communes": [
          {
            "nom": "Tours",
            "surface": 0.1,
          },
        ],
        "departements": [
          "Calvados",
          "Indre-et-Loire",
          "Manche",
          "Seine-Maritime",
        ],
        "facades": [
          {
            "facade": "Manche Est - Mer du Nord",
            "secteurs": [
              "Baie de Seine",
            ],
          },
        ],
        "regions": [
          "Centre-Val de Loire",
          "Normandie",
        ],
      }
    `)
  })
  test('territoiresFind ne retourne pas les surfaces si elles ne sont pas présentes', () => {
    expect(
      territoiresFind(
        {
          [toCommuneId('37000')]: 'Tours',
        },
        [
          {
            id: toCommuneId('37000'),
          },
        ]
      )
    ).toMatchInlineSnapshot(`
      {
        "communes": [
          {
            "nom": "Tours",
            "surface": null,
          },
        ],
        "departements": [
          "Indre-et-Loire",
        ],
        "facades": [],
        "regions": [
          "Centre-Val de Loire",
        ],
      }
    `)
  })
})

describe('territoiresIdFind', () => {
  test('territoiresIdFind communes et secteurs maritimes', () => {
    expect(
      territoiresIdFind(
        [
          { id: toCommuneId('72500') },
          {
            id: toCommuneId('72200'),
          },

          {
            id: toCommuneId('37000'),
          },
        ],
        ['Baie de Seine']
      )
    ).toMatchInlineSnapshot(`
      {
        "departements": [
          "76",
          "14",
          "50",
          "72",
          "37",
        ],
        "facades": [
          "Manche Est - Mer du Nord",
        ],
        "pays": [
          "FR",
        ],
        "regions": [
          "28",
          "52",
          "24",
        ],
      }
    `)
  })
  test('territoiresIdFind uniquement des communes', () => {
    expect(
      territoiresIdFind(
        [
          { id: toCommuneId('72500') },
          {
            id: toCommuneId('72200'),
          },

          {
            id: toCommuneId('37000'),
          },
        ],
        []
      )
    ).toMatchInlineSnapshot(`
      {
        "departements": [
          "72",
          "37",
        ],
        "facades": [],
        "pays": [
          "FR",
        ],
        "regions": [
          "52",
          "24",
        ],
      }
    `)
  })
  test('territoiresFind uniquement des secteurs maritimes', () => {
    expect(territoiresIdFind([], ['Baie de Seine'])).toMatchInlineSnapshot(`
      {
        "departements": [
          "76",
          "14",
          "50",
        ],
        "facades": [
          "Manche Est - Mer du Nord",
        ],
        "pays": [
          "FR",
        ],
        "regions": [
          "28",
        ],
      }
    `)
  })
})
