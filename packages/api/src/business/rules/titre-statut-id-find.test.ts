import { titreInSurvieProvisoire, titreStatutIdFind, TitreStatutIdFindDemarche } from './titre-statut-id-find.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'

const titreDemarcheId = newDemarcheId('unused')
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
          phase: { titreDemarcheId, dateDebut: toCaminoDate('2014-04-01'), dateFin: toCaminoDate('3014-04-01'), phaseStatutId: 'val' },
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
          phase: { titreDemarcheId, dateDebut: toCaminoDate('1014-04-01'), dateFin: toCaminoDate('2014-04-01'), phaseStatutId: 'val' },
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

  test("le statut d'un titre avec une démarche en instruction est “mod”", () => {
    expect(
      titreStatutIdFind(aujourdhui, [
        { typeId: 'mut', statutId: 'ins', phase: { titreDemarcheId, dateDebut: toCaminoDate('1014-04-01'), dateFin: null, phaseStatutId: 'val' } },
        { typeId: 'oct', statutId: 'acc', phase: { titreDemarcheId, dateDebut: toCaminoDate('1014-04-01'), dateFin: toCaminoDate('2014-04-01'), phaseStatutId: 'val' } },
      ])
    ).toEqual('mod')
  })

  test("le statut d'un titre PER M ou W avec une prolongation déposée est “mod”", () => {
    expect(
      titreStatutIdFind(aujourdhui, [
        {
          typeId: 'pr1',
          statutId: 'eco',
          phase: {
            titreDemarcheId: newDemarcheId('m-pr-saint-pierre-2014-pro01'),
            dateDebut: toCaminoDate('2020-01-01'),
            dateFin: null,
            phaseStatutId: 'val',
          },
        },
        {
          typeId: 'oct',
          statutId: 'acc',
          phase: {
            titreDemarcheId: newDemarcheId('m-pr-saint-pierre-2014-oct01'),
            dateDebut: toCaminoDate('1014-04-01'),
            dateFin: toCaminoDate('2020-04-01'),
            phaseStatutId: 'ech',
          },
        },
      ])
    ).toEqual('mod')
  })

  test("le statut d'un titre PER M ou W avec une prolongation2 déposée est “mod”", () => {
    const demarches: TitreStatutIdFindDemarche[] = [
      {
        typeId: 'pr2',
        statutId: 'eco',
        phase: { titreDemarcheId: newDemarcheId('unused'), dateDebut: toCaminoDate('2020-06-01'), dateFin: null, phaseStatutId: 'val' },
      },
      {
        typeId: 'pr1',
        statutId: 'acc',
        phase: { titreDemarcheId: newDemarcheId('unused2'), dateDebut: toCaminoDate('2020-01-01'), dateFin: toCaminoDate('2020-10-01'), phaseStatutId: 'val' },
      },
      {
        typeId: 'oct',
        statutId: 'acc',
        phase: { titreDemarcheId: newDemarcheId('unused3'), dateDebut: toCaminoDate('1014-04-01'), dateFin: toCaminoDate('2020-04-01'), phaseStatutId: 'val' },
      },
    ]
    expect(titreStatutIdFind(aujourdhui, demarches)).toEqual('mod')
    expect(titreStatutIdFind(toCaminoDate('2020-03-01'), demarches)).toEqual('val')
  })

  test('un titre est en modification en instance si une prolongation est créée après une prolongation qui est toujours valide', () => {
    expect(
      titreInSurvieProvisoire([
        { phase: { titreDemarcheId, phaseStatutId: 'val', dateDebut: toCaminoDate('2020-06-01'), dateFin: null } },
        { phase: { titreDemarcheId, phaseStatutId: 'val', dateDebut: toCaminoDate('2020-01-01'), dateFin: toCaminoDate('2020-10-01') } },
        { phase: { titreDemarcheId, phaseStatutId: 'val', dateDebut: toCaminoDate('1014-04-01'), dateFin: toCaminoDate('2020-04-01') } },
      ])
    ).toEqual(true)
  })
})
