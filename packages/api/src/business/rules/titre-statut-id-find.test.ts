import { titreInModificationEnInstance, titreStatutIdFind, TitreStatutIdFindDemarche } from './titre-statut-id-find.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'

describe("statut d'un titre", () => {
  const aujourdhui = toCaminoDate('2020-12-01')

  test("le statut d'un titre sans démarche est “ind”", () => {
    expect(titreStatutIdFind(aujourdhui, undefined)).toEqual('ind')
  })

  test("le statut d'un titre avec des démarches dont le statut est “ind” est également “ind”", () => {
    expect(titreStatutIdFind(aujourdhui, [{ statutId: 'ind', typeId: 'oct' }])).toEqual('ind')
  })

  test("le statut d'un titre dont la date de fin est dans le futur est “val”", () => {
    expect(
      titreStatutIdFind(aujourdhui, [
        {
          typeId: 'oct',
          statutId: 'acc',
          demarcheDateDebut: toCaminoDate('2014-04-01'),
          demarcheDateFin: toCaminoDate('3014-04-01'),
        },
      ])
    ).toEqual('val')
  })

  test("le statut d'un titre dont la date de fin est dans le passé est “ech”", () => {
    expect(
      titreStatutIdFind(aujourdhui, [
        {
          typeId: 'oct',
          statutId: 'acc',
          demarcheDateDebut: toCaminoDate('1014-04-01'),
          demarcheDateFin: toCaminoDate('2014-04-01'),
        },
      ])
    ).toEqual('ech')
  })

  test("le statut d'un titre dont l'unique démarche est un octroi en instruction est “dmi”", () => {
    expect(titreStatutIdFind(aujourdhui, [{ typeId: 'oct', statutId: 'ins' }])).toEqual('dmi')
  })

  test("le statut d'un titre dont l'unique démarche est un octroi déposé est “dmi”", () => {
    expect(titreStatutIdFind(aujourdhui, [{ typeId: 'oct', statutId: 'dep' }])).toEqual('dmi')
  })

  test("le statut d'un titre dont l'unique démarche est un octroi rejeté est “dmc”", () => {
    expect(titreStatutIdFind(aujourdhui, [{ typeId: 'oct', statutId: 'rej' }])).toEqual('dmc')
  })

  test("le statut d'un titre dont l'unique démarche est un octroi classé sans suite est “dmc”", () => {
    expect(titreStatutIdFind(aujourdhui, [{ typeId: 'oct', statutId: 'cls' }])).toEqual('dmc')
  })

  test("le statut d'un titre dont l'unique démarche est un octroi retiré est “dmc”", () => {
    expect(titreStatutIdFind(aujourdhui, [{ typeId: 'oct', statutId: 'des' }])).toEqual('dmc')
  })

  test("le statut d'un titre avec une démarche en instruction est en survie provisoire", () => {
    expect(
      titreStatutIdFind(aujourdhui, [
        { typeId: 'mut', statutId: 'ins', demarcheDateDebut: toCaminoDate('1014-04-01'), demarcheDateFin: null },
        { typeId: 'oct', statutId: 'acc', demarcheDateDebut: toCaminoDate('1014-04-01'), demarcheDateFin: toCaminoDate('2014-04-01') },
      ])
    ).toEqual('sup')
  })

  test("le statut d'un titre PER M ou W avec une prolongation déposée est survie provisoire", () => {
    expect(
      titreStatutIdFind(aujourdhui, [
        {
          typeId: 'pr1',
          statutId: 'eco',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: null,
        },
        {
          typeId: 'oct',
          statutId: 'acc',
          demarcheDateDebut: toCaminoDate('1014-04-01'),
          demarcheDateFin: toCaminoDate('2020-04-01'),
        },
      ])
    ).toEqual('sup')
  })

  test("le statut d'un titre PER M ou W avec une prolongation2 déposée est survie provisoire après la fin de la prolongation1 et est en modification en instance avant celle-ci", () => {
    const demarches: TitreStatutIdFindDemarche[] = [
      {
        typeId: 'pr2',
        statutId: 'eco',
        demarcheDateDebut: toCaminoDate('2020-06-01'),
        demarcheDateFin: null,
      },
      {
        typeId: 'pr1',
        statutId: 'acc',
        demarcheDateDebut: toCaminoDate('2020-01-01'),
        demarcheDateFin: toCaminoDate('2020-10-01'),
      },
      {
        typeId: 'oct',
        statutId: 'acc',
        demarcheDateDebut: toCaminoDate('1014-04-01'),
        demarcheDateFin: toCaminoDate('2020-04-01'),
      },
    ]
    expect(titreStatutIdFind(aujourdhui, demarches)).toEqual('sup')
    expect(titreStatutIdFind(toCaminoDate('2020-03-01'), demarches)).toEqual('mod')
  })

  test('un titre est en modification en instance si une prolongation est créée après une prolongation qui est toujours valide', () => {
    expect(
      titreInModificationEnInstance([
        { demarcheDateDebut: toCaminoDate('2020-06-01'), demarcheDateFin: null },
        { demarcheDateDebut: toCaminoDate('2020-01-01'), demarcheDateFin: toCaminoDate('2020-10-01') },
        { demarcheDateDebut: toCaminoDate('1014-04-01'), demarcheDateFin: toCaminoDate('2020-04-01') },
      ])
    ).toEqual(true)
  })
})
