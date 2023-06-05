import { toCommuneId } from 'camino-common/src/static/communes.js'
import { titreTerritoiresFind } from './titres.js'
import { describe, expect, test } from 'vitest'
describe('titreTerritoiresFind', () => {
  test('titreTerritoiresFind uniquement des communes', () => {
    expect(
      titreTerritoiresFind([
        { id: toCommuneId('72500'), nom: 'Flée', surface: 100000 },
        {
          id: toCommuneId('72200'),
          nom: 'Montval-sur-loir',
          surface: 105020,
        },

        {
          id: toCommuneId('37000'),
          nom: 'Tours',
          surface: 99999,
        },
      ])
    ).toMatchInlineSnapshot(`
      {
        "communes": [
          "Flée (0.1)",
          "Montval-sur-loir (0.105)",
          "Tours (0.1)",
        ],
        "departements": [
          "Indre-et-Loire",
          "Sarthe",
        ],
        "regions": [
          "Centre-Val de Loire",
          "Pays de la Loire",
        ],
      }
    `)
  })
  test('titreTerritoiresFind uniquement des secteurs maritimes', () => {
    expect(titreTerritoiresFind(null, ['Baie de Seine'])).toMatchInlineSnapshot(`
        {
          "communes": [],
          "departements": [
            "Calvados",
            "Manche",
            "Seine-Maritime",
          ],
          "regions": [
            "Normandie",
          ],
        }
      `)
  })
  test('titreTerritoiresFind uniquement', () => {
    expect(
      titreTerritoiresFind(
        [
          {
            id: toCommuneId('37000'),
            nom: 'Tours',
            surface: 99999,
          },
        ],

        ['Baie de Seine']
      )
    ).toMatchInlineSnapshot(`
      {
        "communes": [
          "Tours (0.1)",
        ],
        "departements": [
          "Calvados",
          "Indre-et-Loire",
          "Manche",
          "Seine-Maritime",
        ],
        "regions": [
          "Centre-Val de Loire",
          "Normandie",
        ],
      }
    `)
  })
})
