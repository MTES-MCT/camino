import { ITitreDemarche } from '../../types.js'
import { titreValideCheck } from './titre-valide-check.js'
import { describe, test, expect } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'

const titreDemarches: Pick<ITitreDemarche, 'typeId' | 'demarcheDateDebut' | 'demarcheDateFin'>[] = [
  { typeId: 'oct' },
  {
    demarcheDateDebut: toCaminoDate('2014-11-02'),
    demarcheDateFin: toCaminoDate('2019-11-02'),
    typeId: 'oct',
  },
]

describe("vérifie la validité d'un titre pendant une période en fonction des phases des démarches", () => {
  test('retourne vrai si le titre est valide pour la période qui commence avant la date de début et termine après la date de fin', () => {
    expect(titreValideCheck(titreDemarches, toCaminoDate('2005-01-01'), toCaminoDate('2025-01-01'))).toEqual(true)
  })

  test('retourne vrai si le titre est valide pour la période qui commence avant la date de début et termine avant la date de fin', () => {
    expect(titreValideCheck(titreDemarches, toCaminoDate('2005-01-01'), toCaminoDate('2015-01-01'))).toEqual(true)
  })

  test("retourne faux si le titre n'est pas valide pour la période qui commence avant la date de début et termine avant la date de début", () => {
    expect(titreValideCheck(titreDemarches, toCaminoDate('2000-01-01'), toCaminoDate('2005-01-01'))).toEqual(false)
  })

  test('retourne vrai si le titre est valide pour la période qui commence avant la date de fin et termine avant la date de fin', () => {
    expect(titreValideCheck(titreDemarches, toCaminoDate('2015-01-01'), toCaminoDate('2016-01-01'))).toEqual(true)
  })

  test('retourne vrai si le titre est valide pour la période qui commence avant la date de fin et termine après la date de fin', () => {
    expect(titreValideCheck(titreDemarches, toCaminoDate('2015-10-01'), toCaminoDate('2025-01-01'))).toEqual(true)
  })

  test("retourne faux si le titre n'est pas valide pour la période qui commence après la date de fin", () => {
    expect(titreValideCheck(titreDemarches, toCaminoDate('2025-01-01'), toCaminoDate('2030-01-01'))).toEqual(false)
  })

  test('retourne vrai si le titre est en modification en instance au moment de la date de début', () => {
    const newTitreDemarches: Pick<ITitreDemarche, 'typeId' | 'demarcheDateDebut' | 'demarcheDateFin'>[] = [
      { typeId: 'oct' },
      {
        demarcheDateDebut: toCaminoDate('2014-11-02'),
        typeId: 'oct',
      },
    ]
    expect(titreValideCheck(newTitreDemarches, toCaminoDate('2020-01-01'), toCaminoDate('2020-12-31'))).toEqual(true)
  })

  test("retourne faux si le titre n'est pas en modification en instance au moment de la date de début", () => {
    const newTitreDemarches: Pick<ITitreDemarche, 'typeId' | 'demarcheDateDebut' | 'demarcheDateFin'>[] = [
      {
        demarcheDateDebut: toCaminoDate('2014-11-02'),
        demarcheDateFin: toCaminoDate('2019-11-02'),
        typeId: 'oct',
      },
    ]
    expect(titreValideCheck(newTitreDemarches, toCaminoDate('2020-01-01'), toCaminoDate('2020-12-31'))).toEqual(false)
  })
})
