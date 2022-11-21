import { titreTerritoiresFind } from './titres'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'
import { describe, expect, test } from 'vitest'
describe('titreTerritoiresFind', () => {
  test('titreTerritoiresFind uniquement des communes', () => {
    expect(
      titreTerritoiresFind([
        { nom: 'Flée', surface: 100000, departementId: DEPARTEMENT_IDS.Sarthe },
        {
          nom: 'Montval-sur-loir',
          surface: 105020,
          departementId: DEPARTEMENT_IDS.Sarthe
        },

        {
          nom: 'Tours',
          surface: 99999,
          departementId: DEPARTEMENT_IDS['Indre-et-Loire']
        }
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
    expect(titreTerritoiresFind(null, ['Baie de Seine']))
      .toMatchInlineSnapshot(`
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
            nom: 'Tours',
            surface: 99999,
            departementId: DEPARTEMENT_IDS['Indre-et-Loire']
          }
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
