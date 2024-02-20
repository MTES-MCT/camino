import { documentsRequiredAdd } from './documents'
import { getCurrent } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'

describe('documents', () => {
  test('retourne un tableau vide si il n’y a aucun doc à ajouter', () => {
    expect(documentsRequiredAdd(undefined, undefined, true)).toEqual([])
  })

  test.each`
    userIsAdmin
    ${true}
    ${false}
  `('ajoute un document obligatoire manquant', ({ userIsAdmin }) => {
    expect(documentsRequiredAdd(undefined, [{ optionnel: false, id: 'aaa' }], userIsAdmin)).toEqual([
      {
        date: getCurrent(),
        entreprisesLecture: userIsAdmin,
        fichier: null,
        fichierNouveau: null,
        fichierTypeId: null,
        id: 'aaa',
        publicLecture: false,
        suppression: false,
        typeId: 'aaa',
      },
    ])
  })

  test('supprime le document avec un type inexistant', () => {
    expect(documentsRequiredAdd([{ typeId: 'aaa', suppression: false }, { typeId: 'ddd' }], [{ optionnel: false, id: 'aaa' }], true)).toEqual([
      {
        typeId: 'aaa',
        suppression: false,
      },
    ])
  })
})
