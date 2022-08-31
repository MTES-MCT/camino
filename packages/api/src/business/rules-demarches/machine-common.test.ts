import { ITitreEtape } from '../../types'
import { toMachineEtapes } from './machine-common'

describe('toMachineEtapes', () => {
  test('transforme une étape de la bdd en étape de machine', () => {
    expect(
      toMachineEtapes([
        {
          id: 'id',
          typeId: 'mfr',
          statutId: 'fai',
          date: '2022-01-01',
          titreDemarcheId: 'idDemarche'
        }
      ])
    ).toEqual([
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
        date: '2022-01-01'
      }
    ])

    expect(
      toMachineEtapes([
        {
          id: 'id',
          typeId: 'mfr',
          statutId: 'fai',
          date: '2022-01-01',
          titreDemarcheId: 'idDemarche',
          contenu: { arm: { mecanise: true } }
        }
      ])
    ).toEqual([
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
        date: '2022-01-01',
        contenu: { arm: { mecanise: true } }
      }
    ])
  })

  test('emet une erreur si le type de l’étape est inconnu', () => {
    expect(() =>
      toMachineEtapes([
        {
          id: 'id',
          typeId: 'iii',
          statutId: 'fai',
          date: '2022-01-01',
          titreDemarcheId: 'idDemarche'
        } as unknown as ITitreEtape
      ])
    ).toThrowErrorMatchingInlineSnapshot(`"l'état iii est inconnu"`)
  })

  test('emet une erreur si le type de le statut est inconnu', () => {
    expect(() =>
      toMachineEtapes([
        {
          id: 'id',
          typeId: 'mfr',
          statutId: 'ffi',
          date: '2022-01-01',
          titreDemarcheId: 'idDemarche'
        } as unknown as ITitreEtape
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `"le status ffi est inconnu, {\\"id\\":\\"id\\",\\"typeId\\":\\"mfr\\",\\"statutId\\":\\"ffi\\",\\"date\\":\\"2022-01-01\\",\\"titreDemarcheId\\":\\"idDemarche\\"}"`
    )
  })
})
