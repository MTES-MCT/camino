import { toCaminoDate } from 'camino-common/src/date.js'
import { TitreEtapeForMachine, toMachineEtapes } from './machine-common.js'
import { describe, expect, test, vi } from 'vitest'
import { ETAPE_IS_NOT_BROUILLON, ETAPE_IS_BROUILLON } from 'camino-common/src/etape.js'

console.error = vi.fn()
describe('toMachineEtapes', () => {
  test('transforme une étape de la bdd en étape de machine', () => {
    expect(
      toMachineEtapes([
        {
          typeId: 'mfr',
          statutId: 'fai',
          date: toCaminoDate('2022-01-01'),
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
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

  test('filtre les étapes en brouillon', () => {
    expect(
      toMachineEtapes([
        {
          typeId: 'mfr',
          statutId: 'fai',
          isBrouillon: ETAPE_IS_BROUILLON,
          date: toCaminoDate('2022-01-01'),
          contenu: { arm: { mecanise: true } },
          communes: [],
          ordre: 0,
          surface: null,
        },
      ])
    ).toEqual([])
  })

  test('emet une erreur si le type de l’étape est inconnu', () => {
    expect(() =>
      toMachineEtapes([
        {
          id: 'id',
          typeId: 'iii',
          statutId: 'fai',
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          date: '2022-01-01',
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
        } as unknown as TitreEtapeForMachine,
      ])
    ).toThrowErrorMatchingInlineSnapshot(`[Error: l'état iii est inconnu]`)
  })

  test('emet une erreur si le type de le statut est inconnu', () => {
    expect(() =>
      toMachineEtapes([
        {
          id: 'id',
          typeId: 'mfr',
          statutId: 'ffi',
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          date: '2022-01-01',
        } as unknown as TitreEtapeForMachine,
      ])
    ).toThrowErrorMatchingInlineSnapshot(`[Error: le status ffi est inconnu, {"id":"id","typeId":"mfr","statutId":"ffi","isBrouillon":false,"date":"2022-01-01"}]`)
  })
})
