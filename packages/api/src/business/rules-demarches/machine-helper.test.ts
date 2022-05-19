import { isEtapesOk, nextEtapes, toMachineEtape } from './machine-helper'

describe('nextEtapes', () => {
  test('retourne les prochaines étapes possibles', () => {
    expect(
      nextEtapes([
        { typeId: 'mfr', statutId: 'fai', date: '2020-02-02' },
        { typeId: 'mdp', statutId: 'dep', date: '2020-02-03' }
      ])
    ).toStrictEqual([
      { etat: 'mod' },
      { etat: 'des' },
      { etat: 'css' },
      { etat: 'pfd' }
    ])
  })

  test('peut faire une mfr après une dae', () => {
    expect(
      nextEtapes([{ typeId: 'dae', statutId: 'exe', date: '2020-02-02' }])
    ).toStrictEqual([
      { etat: 'mfr' },
      { etat: 'pfd' },
      { etat: 'rde', statut: 'def' },
      { etat: 'rde', statut: 'fav' }
    ])
  })
  test('retourne les premières étapes possibles', () => {
    expect(nextEtapes([])).toStrictEqual([
      { etat: 'rde', statut: 'def' },
      { etat: 'rde', statut: 'fav' },
      { etat: 'mfr' },
      { etat: 'pfd' },
      { etat: 'dae', statut: 'req' },
      { etat: 'dae', statut: 'exe' }
    ])
  })
})

describe('isEtapesOk', () => {
  // On n'est pas certain de notre base de données, si ça impacte les perf,
  test('refuse si les étapes ne sont pas temporellement dans le bon ordre', () => {
    expect(
      isEtapesOk([
        { typeId: 'mfr', statutId: 'fai', date: '2021-02-26' },
        { typeId: 'mdp', statutId: 'fai', date: '2021-02-10' }
      ])
    ).toBe(false)
  })
})

describe('toMachineEtape', () => {
  test('transforme une étape de la bdd en étape de machine', () => {
    expect(
      toMachineEtape({
        id: 'id',
        typeId: 'mfr',
        statutId: 'fai',
        date: '2022-01-01',
        titreDemarcheId: 'idDemarche'
      })
    ).toEqual({
      typeId: 'mfr',
      statutId: 'fai',
      date: '2022-01-01'
    })

    expect(
      toMachineEtape({
        id: 'id',
        typeId: 'mfr',
        statutId: 'fai',
        date: '2022-01-01',
        titreDemarcheId: 'idDemarche',
        contenu: { arm: { mecanise: true } }
      })
    ).toEqual({
      typeId: 'mfr',
      statutId: 'fai',
      date: '2022-01-01',
      contenu: { arm: { mecanise: true } }
    })
  })

  test('emet une erreur si le type de l’étape est inconnu', () => {
    expect(() =>
      toMachineEtape({
        id: 'id',
        typeId: 'iii',
        statutId: 'fai',
        date: '2022-01-01',
        titreDemarcheId: 'idDemarche'
      })
    ).toThrowErrorMatchingInlineSnapshot(`"l'état iii est inconnu"`)
  })

  test('emet une erreur si le type de le statut est inconnu', () => {
    expect(() =>
      toMachineEtape({
        id: 'id',
        typeId: 'mfr',
        statutId: 'ffi',
        date: '2022-01-01',
        titreDemarcheId: 'idDemarche'
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"le status ffi est inconnu, {\\"id\\":\\"id\\",\\"typeId\\":\\"mfr\\",\\"statutId\\":\\"ffi\\",\\"date\\":\\"2022-01-01\\",\\"titreDemarcheId\\":\\"idDemarche\\"}"`
    )
  })
})
