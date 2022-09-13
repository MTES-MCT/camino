import { isEtapesOk, toMachineEtape, whoIsBlocking } from './machine-helper'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { ITitreEtape } from '../../types'
import { newDemarcheId } from '../../database/models/_format/id-create'

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
        titreDemarcheId: newDemarcheId('idDemarche')
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
        titreDemarcheId: newDemarcheId('idDemarche'),
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
      } as unknown as ITitreEtape)
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
      } as unknown as ITitreEtape)
    ).toThrowErrorMatchingInlineSnapshot(
      `"le status ffi est inconnu, {\\"id\\":\\"id\\",\\"typeId\\":\\"mfr\\",\\"statutId\\":\\"ffi\\",\\"date\\":\\"2022-01-01\\",\\"titreDemarcheId\\":\\"idDemarche\\"}"`
    )
  })
})

describe('whoIsBlocking', () => {
  test('on attend le PTMG pour la recevabilité d’une demande d’ARM', () => {
    expect(
      whoIsBlocking([
        { typeId: 'mfr', statutId: 'fai', date: '2021-02-01' },
        { typeId: 'mdp', statutId: 'fai', date: '2021-02-02' },
        { typeId: 'pfd', statutId: 'fai', date: '2021-02-03' }
      ])
    ).toStrictEqual([ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']])
  })

  test("on attend l'ONF pour la validation du paiement des frais de dossier", () => {
    expect(
      whoIsBlocking([
        { typeId: 'mfr', statutId: 'fai', date: '2021-02-01' },
        { typeId: 'mdp', statutId: 'fai', date: '2021-02-02' },
        { typeId: 'pfd', statutId: 'fai', date: '2021-02-03' },
        { typeId: 'mcp', statutId: 'com', date: '2021-02-04' }
      ])
    ).toStrictEqual([ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']])
  })

  test('on attend personne', () => {
    expect(
      whoIsBlocking([
        { typeId: 'mfr', statutId: 'fai', date: '2021-02-01' },
        { typeId: 'mdp', statutId: 'fai', date: '2021-02-02' },
        { typeId: 'pfd', statutId: 'fai', date: '2021-02-03' },
        { typeId: 'mcp', statutId: 'com', date: '2021-02-04' },
        { typeId: 'vfd', statutId: 'fai', date: '2021-02-05' },
        { typeId: 'mcr', statutId: 'fav', date: '2021-02-06' }
      ])
    ).toStrictEqual([])
  })
})
