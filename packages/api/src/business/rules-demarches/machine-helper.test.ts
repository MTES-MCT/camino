import { nextEtapes, toMachineEtape } from './machine-helper'

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
  test('retourne les premières étapes possibles', () => {
      
    // TODO 2022-05-05 on ne veut pas autoriser les étapes étranges, comme la dae, rde et pfd
    expect(nextEtapes([])).toStrictEqual([{ etat: 'mfr' }])
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
