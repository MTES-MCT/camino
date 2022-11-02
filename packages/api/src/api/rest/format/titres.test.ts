import { titreTerritoiresFind } from './titres'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'

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
      Object {
        "communes": Array [
          "Flée (0.1)",
          "Montval-sur-loir (0.105)",
          "Tours (0.1)",
        ],
        "departements": Array [
          "Indre-et-Loire",
          "Sarthe",
        ],
        "regions": Array [
          "Centre-Val de Loire",
          "Pays de la Loire",
        ],
      }
    `)
  })
  test('titreTerritoiresFind uniquement des secteurs maritimes', () => {
    expect(titreTerritoiresFind(null, ['Baie de Seine']))
      .toMatchInlineSnapshot(`
      Object {
        "communes": Array [],
        "departements": Array [
          "Calvados",
          "Manche",
          "Seine-Maritime",
        ],
        "regions": Array [
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
      Object {
        "communes": Array [
          "Tours (0.1)",
        ],
        "departements": Array [
          "Calvados",
          "Indre-et-Loire",
          "Manche",
          "Seine-Maritime",
        ],
        "regions": Array [
          "Centre-Val de Loire",
          "Normandie",
        ],
      }
    `)
  })
})
