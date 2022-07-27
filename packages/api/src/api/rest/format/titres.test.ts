import { titreTerritoiresFind } from './titres'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'

describe('titreTerritoiresFind', () => {
  test('titreTerritoiresFind', () => {
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
    ).toMatchSnapshot()
  })
})
