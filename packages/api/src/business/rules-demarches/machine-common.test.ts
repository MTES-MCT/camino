import { toCaminoDate } from 'camino-common/src/date.js'
import { TitreEtapeForMachine, toMachineEtapes } from './machine-common.js'
import { describe, expect, test, vi } from 'vitest'
import { newEtapeId } from '../../database/models/_format/id-create.js'

console.error = vi.fn()
describe('toMachineEtapes', () => {
  test('transforme une étape de la bdd en étape de machine', () => {
    expect(
      toMachineEtapes([
        {
          typeId: 'mfr',
          statutId: 'fai',
          date: toCaminoDate('2022-01-01'),
          communes: [],
          ordre: 0,
          surface: null,
          contenu: null,
        },
      ])
    ).toEqual([
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
        date: '2022-01-01',
      },
    ])

    expect(
      toMachineEtapes([
        {
          typeId: 'mfr',
          statutId: 'fai',
          date: toCaminoDate('2022-01-01'),
          contenu: { arm: { mecanise: true } },
          communes: [],
          ordre: 0,
          surface: null,
        },
      ])
    ).toEqual([
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
        date: '2022-01-01',
        contenu: { arm: { mecanise: true } },
      },
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
        } as unknown as TitreEtapeForMachine,
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
        } as unknown as TitreEtapeForMachine,
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `"le status ffi est inconnu, {\\"id\\":\\"id\\",\\"typeId\\":\\"mfr\\",\\"statutId\\":\\"ffi\\",\\"date\\":\\"2022-01-01\\"}"`
    )
  })
})
