import { titreDemarcheSortAsc } from './titre-elements-sort-asc.js'
import {
  titreDemarchesNoEtapesSortedAsc,
  titreDemarchesNoEtapesSortedDesc,
  titreDemarchesNoEtapesSortedAscResult,
  titreDemarchesNoEtapesSortedDescResult,
  titreDemarchesSortedAsc,
  titreDemarchesSortedDesc,
  titreDemarchesSortedAscResult,
  titreDemarchesSortedDescEqual,
  titreDemarchesSortedDescEqualResult,
} from './__mocks__/titre-demarches-asc-sort-demarches.js'
import { describe, test, expect } from 'vitest'

describe('trie les démarches', () => {
  test('des démarches sans étapes organisées par ordre décroissant sont triées par ordre croissant', () => {
    expect(titreDemarcheSortAsc(titreDemarchesNoEtapesSortedDesc)).toMatchObject(titreDemarchesNoEtapesSortedDescResult)
  })

  test('des démarches sans étapes orgqnisées par ordre croissant sont triées par ordre croissant', () => {
    expect(titreDemarcheSortAsc(titreDemarchesNoEtapesSortedAsc)).toMatchObject(titreDemarchesNoEtapesSortedAscResult)
  })

  test('des démarches organisées par ordre décroissant sont triées par ordre croissant', () => {
    expect(titreDemarcheSortAsc(titreDemarchesSortedDesc)).toMatchObject(titreDemarchesSortedAscResult)
  })

  test('des démarches organisées par ordre croissant restent triées par ordre croissant', () => {
    expect(titreDemarcheSortAsc(titreDemarchesSortedAsc)).toMatchObject(titreDemarchesSortedAscResult)
  })

  test('des démarches dont les dates sont les mêmes restent triées dans le même ordre', () => {
    expect(titreDemarcheSortAsc(titreDemarchesSortedDescEqual)).toMatchObject(titreDemarchesSortedDescEqualResult)
  })
})
