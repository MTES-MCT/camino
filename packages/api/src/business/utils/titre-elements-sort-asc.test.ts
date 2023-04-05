import { titreDemarcheSortAsc, TitreDemarcheSortAscMinimalDemarche } from './titre-elements-sort-asc.js'
import { describe, test, expect } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'

describe('trie les démarches', () => {
  test('des démarches sans étapes organisées par ordre décroissant sont triées par ordre croissant', () => {
    const demarcheMut: TitreDemarcheSortAscMinimalDemarche = { typeId: 'mut', etapes: [] }
    const demarcheOct: TitreDemarcheSortAscMinimalDemarche = {
      typeId: 'mut',
      etapes: [
        {
          ordre: 1,
          date: toCaminoDate('1988-03-06'),
        },
      ],
    }
    expect(titreDemarcheSortAsc([demarcheMut, demarcheMut, demarcheOct])).toMatchObject([demarcheOct, demarcheMut, demarcheMut])
  })

  test('des démarches sans étapes organisées par ordre croissant sont triées par ordre croissant', () => {
    const oct: TitreDemarcheSortAscMinimalDemarche = {
      typeId: 'oct',
      etapes: [
        {
          ordre: 1,
          date: toCaminoDate('1988-03-06'),
        },
      ],
    }
    const mut1: TitreDemarcheSortAscMinimalDemarche = { typeId: 'mut', etapes: [] }
    const mut2: TitreDemarcheSortAscMinimalDemarche = { typeId: 'mut', etapes: [] }
    expect(titreDemarcheSortAsc([oct, mut1, mut2])).toMatchObject([oct, mut1, mut2])
  })

  test('des démarches organisées par ordre décroissant sont triées par ordre croissant', () => {
    const mut: TitreDemarcheSortAscMinimalDemarche = {
      typeId: 'mut',
      etapes: [
        {
          ordre: 1,
          date: toCaminoDate('1994-09-28'),
        },
        {
          ordre: 2,
          date: toCaminoDate('1994-09-29'),
        },
      ],
    }
    const oct: TitreDemarcheSortAscMinimalDemarche = {
      typeId: 'oct',
      etapes: [
        {
          ordre: 1,
          date: toCaminoDate('1988-03-06'),
        },
        {
          ordre: 2,
          date: toCaminoDate('1988-03-11'),
        },
      ],
    }
    expect(titreDemarcheSortAsc([mut, oct])).toMatchObject([oct, mut])
  })

  test('des démarches organisées par ordre croissant restent triées par ordre croissant', () => {
    const octroi: TitreDemarcheSortAscMinimalDemarche = {
      typeId: 'oct',
      etapes: [
        { ordre: 1, date: toCaminoDate('1988-03-06') },
        { ordre: 2, date: toCaminoDate('1988-03-11') },
      ],
    }
    const mutation: TitreDemarcheSortAscMinimalDemarche = {
      typeId: 'mut',
      etapes: [
        { ordre: 1, date: toCaminoDate('1994-09-28') },
        { ordre: 2, date: toCaminoDate('1994-09-29') },
      ],
    }
    expect(titreDemarcheSortAsc([octroi, mutation])).toMatchObject([octroi, mutation])
  })

  test('des démarches dont les dates sont les mêmes restent triées dans le même ordre', () => {
    const mutation: TitreDemarcheSortAscMinimalDemarche = {
      typeId: 'mut',
      etapes: [
        { ordre: 1, date: toCaminoDate('1988-03-06') },
        { ordre: 2, date: toCaminoDate('1994-09-29') },
      ],
    }
    const octroi: TitreDemarcheSortAscMinimalDemarche = {
      typeId: 'oct',
      etapes: [
        { ordre: 1, date: toCaminoDate('1988-03-06') },
        { ordre: 2, date: toCaminoDate('1988-03-11') },
      ],
    }
    expect(titreDemarcheSortAsc([mutation, octroi])).toMatchObject([mutation, octroi])
  })
})
