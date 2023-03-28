import { ITitreDemarche, ITitrePhase } from '../../types.js'
import { titrePhasesFind } from './titre-phases-find.js'
import {
  titreDemarcheOctDpuAcc,
  titreDemarcheOctDpuInexistante,
  titreAxmDemarcheOctDexAcc,
  titrePrmDemarcheOctRpuAcc,
  titreDemarcheOctDpuDateDebut,
  titreDemarchesOctProlongation,
  titreDemarchesOctAnnulation,
  titreDemarchesOctAnnulationSansPoints,
} from './__mocks__/titre-phases-find-demarches.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { TitreDemarchePhaseFind } from './titre-demarche-date-fin-duree-find'
import titresProd from './titre-phases-find.cas.json'

export type TitrePhasesTest = [TitreTypeId, TitreDemarchePhaseFind[], ITitrePhase[], CaminoDate]

describe("phases d'une démarche", () => {
  const aujourdhui = toCaminoDate('2020-12-01')
  test("un titre qui a une démarche d'octroi avec une dpu a une phase", () => {
    expect(titrePhasesFind([titreDemarcheOctDpuAcc], aujourdhui, 'cxh')).toEqual([
      {
        dateDebut: '2200-01-01',
        dateFin: '2202-01-01',
        phaseStatutId: 'val',
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
      },
    ])
  })

  test("un titre qui a une démarche d'octroi sans dpu n'a pas de phase", () => {
    expect(titrePhasesFind([titreDemarcheOctDpuInexistante], aujourdhui, 'cxh')).toEqual([])
  })

  test("un titre AXM qui a une démarche d'octroi avec une dex a une phase", () => {
    expect(titrePhasesFind([titreAxmDemarcheOctDexAcc], aujourdhui, 'axm')).toEqual([
      {
        dateDebut: '2200-01-01',
        dateFin: '2202-01-01',
        phaseStatutId: 'val',
        titreDemarcheId: newDemarcheId('h-ax-courdemanges-1988-oct01'),
      },
    ])
  })

  test("un titre PRM qui a une démarche d'octroi avec une rpu a une phase", () => {
    expect(titrePhasesFind([titrePrmDemarcheOctRpuAcc], aujourdhui, 'prm')).toEqual([
      {
        dateDebut: '2200-01-01',
        dateFin: '2200-01-02',
        phaseStatutId: 'val',
        titreDemarcheId: newDemarcheId('m-pr-courdemanges-1988-oct01'),
      },
    ])
  })

  test("un titre qui a une démarche d'octroi avec une dpu dont la date de début est renseignée a une phase", () => {
    expect(titrePhasesFind([titreDemarcheOctDpuDateDebut], aujourdhui, 'cxh')).toEqual([
      {
        dateDebut: '2200-01-02',
        dateFin: '2202-01-02',
        phaseStatutId: 'val',
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
      },
    ])
  })

  test('un titre qui a une démarche de prolongation avec une dpu a une phase', () => {
    expect(titrePhasesFind(titreDemarchesOctProlongation, aujourdhui, 'cxh')).toEqual([
      {
        dateDebut: '2200-01-01',
        dateFin: '2500-01-01',
        phaseStatutId: 'val',
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
      },
      {
        dateDebut: '2500-01-01',
        dateFin: '3000-01-01',
        phaseStatutId: 'val',
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-pro01'),
      },
    ])
  })

  test("la phase d'un titre concernée par une démarche d'annulation a une date de fin qui est celle de cette démarche d'annulation", () => {
    expect(titrePhasesFind(titreDemarchesOctAnnulation, aujourdhui, 'cxh')).toEqual([
      {
        dateDebut: '2000-01-02',
        dateFin: '2019-01-02',
        phaseStatutId: 'ech',
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
      },
    ])
  })

  test("la phase d'un titre concernée par une démarche de renonciation partielle n'est pas affectée par la renonciation", () => {
    expect(titrePhasesFind(titreDemarchesOctAnnulationSansPoints, aujourdhui, 'cxh')).toEqual([
      {
        dateDebut: '2000-01-02',
        dateFin: '2020-01-02',
        phaseStatutId: 'ech',
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
      },
    ])
  })

  test('cas sans date de fin et avec plein de css', () => {
    const titreId = 'titreId'
    const demarcheId1 = newDemarcheId('demarcheId1')
    const demarcheId2 = newDemarcheId('demarcheId2')
    const demarcheId3 = newDemarcheId('demarcheId3')
    const demarcheId4 = newDemarcheId('demarcheId4')
    const demarcheId5 = newDemarcheId('demarcheId5')
    const demarcheId6 = newDemarcheId('demarcheId6')
    const demarcheId7 = newDemarcheId('demarcheId7')
    const demarcheId8 = newDemarcheId('demarcheId8')
    const demarcheId9 = newDemarcheId('demarcheId9')
    const demarcheId10 = newDemarcheId('demarcheId10')
    const demarcheId11 = newDemarcheId('demarcheId11')
    const demarches: ITitreDemarche[] = [
      {
        titreId,
        id: demarcheId1,
        ordre: 11,
        typeId: 'mut',
        statutId: 'cls',
        phase: null,
        etapes: [
          { titreDemarcheId: demarcheId1, id: '1', ordre: 2, date: toCaminoDate('2016-12-28'), typeId: 'mdp', statutId: 'fai' },
          { titreDemarcheId: demarcheId1, id: '2', ordre: 3, date: toCaminoDate('2017-04-07'), typeId: 'css', statutId: 'fai' },
          { titreDemarcheId: demarcheId1, id: '3', ordre: 1, date: toCaminoDate('2016-12-28'), duree: 1920, surface: 5.51, typeId: 'mfr', statutId: 'fai' },
        ],
      },
      {
        id: demarcheId2,
        titreId,
        ordre: 10,
        typeId: 'pro',
        statutId: 'cls',
        etapes: [
          { titreDemarcheId: demarcheId2, id: '4', ordre: 1, date: toCaminoDate('2016-12-28'), duree: 1920, surface: 5.51, typeId: 'mfr', statutId: 'fai' },
          { titreDemarcheId: demarcheId2, id: '5', ordre: 2, date: toCaminoDate('2016-12-28'), typeId: 'mdp', statutId: 'fai' },
          { titreDemarcheId: demarcheId2, id: '6', ordre: 3, date: toCaminoDate('2017-04-07'), typeId: 'css', statutId: 'fai' },
        ],
      },
      {
        titreId,
        id: demarcheId3,
        ordre: 9,
        typeId: 'dam',
        statutId: 'ins',
        phase: null,
        etapes: [
          { id: '7', titreDemarcheId: demarcheId3, ordre: 3, date: toCaminoDate('2014-12-23'), typeId: 'wpp', statutId: 'fai' },
          { id: '8', titreDemarcheId: demarcheId3, ordre: 1, date: toCaminoDate('2013-08-01'), typeId: 'wfd', statutId: 'fai' },
          { id: '9', titreDemarcheId: demarcheId3, ordre: 2, date: toCaminoDate('2014-08-25'), typeId: 'wre', statutId: 'fav' },
        ],
      },
      {
        titreId,
        id: demarcheId4,
        ordre: 8,
        typeId: 'mut',
        statutId: 'acc',
        etapes: [
          { id: '10', titreDemarcheId: demarcheId4, ordre: 1, date: toCaminoDate('2002-12-24'), typeId: 'dex', statutId: 'acc' },
          { titreDemarcheId: demarcheId4, id: '11', ordre: 2, date: toCaminoDate('2003-01-08'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId5,
        ordre: 7,
        typeId: 'mut',
        statutId: 'acc',
        etapes: [
          { id: '12', titreDemarcheId: demarcheId5, ordre: 1, date: toCaminoDate('2000-09-26'), typeId: 'dex', statutId: 'acc' },
          { id: '13', titreDemarcheId: demarcheId5, ordre: 2, date: toCaminoDate('2000-10-06'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId6,
        ordre: 6,
        typeId: 'mut',
        statutId: 'acc',
        etapes: [
          { id: 'id', titreDemarcheId: demarcheId6, ordre: 1, date: toCaminoDate('1975-11-24'), typeId: 'dex', statutId: 'acc' },
          { id: '15', titreDemarcheId: demarcheId6, ordre: 2, date: toCaminoDate('1975-11-27'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId7,
        ordre: 5,
        typeId: 'mut',

        statutId: 'acc',
        etapes: [
          { id: '16', titreDemarcheId: demarcheId7, ordre: 1, date: toCaminoDate('1970-11-16'), typeId: 'dex', statutId: 'acc' },
          { id: '17', titreDemarcheId: demarcheId7, ordre: 2, date: toCaminoDate('1970-11-19'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId8,
        ordre: 4,
        typeId: 'mut',
        statutId: 'acc',
        etapes: [
          { id: '18', titreDemarcheId: demarcheId8, ordre: 2, date: toCaminoDate('1949-08-31'), typeId: 'dpu', statutId: 'acc' },
          { id: '19', titreDemarcheId: demarcheId8, ordre: 1, date: toCaminoDate('1949-08-23'), typeId: 'dex', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId9,
        ordre: 3,
        typeId: 'exp',
        statutId: 'acc',
        etapes: [
          { id: '20', titreDemarcheId: demarcheId9, ordre: 1, date: toCaminoDate('1889-02-27'), typeId: 'dex', statutId: 'acc' },
          { id: '21', titreDemarcheId: demarcheId9, ordre: 2, date: toCaminoDate('1889-02-27'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId10,
        ordre: 2,
        typeId: 'exp',
        statutId: 'acc',
        etapes: [
          { id: '22', titreDemarcheId: demarcheId10, ordre: 2, date: toCaminoDate('1879-11-14'), typeId: 'dpu', statutId: 'acc' },
          { id: '23', titreDemarcheId: demarcheId10, ordre: 1, date: toCaminoDate('1879-07-26'), typeId: 'dex', statutId: 'acc' },
        ],
      },
      {
        titreId,
        id: demarcheId11,
        ordre: 1,
        typeId: 'oct',
        statutId: 'acc',
        etapes: [
          { id: '24', titreDemarcheId: demarcheId11, ordre: 1, date: toCaminoDate('1858-03-24'), typeId: 'dex', statutId: 'acc' },
          { id: '25', titreDemarcheId: demarcheId11, ordre: 2, date: toCaminoDate('1858-03-24'), typeId: 'dpu', statutId: 'acc' },
        ],
      },
    ]

    const tested = titrePhasesFind(demarches, aujourdhui, 'cxm')
    expect(tested).toStrictEqual([
      {
        dateDebut: '1858-03-24',
        dateFin: '2018-12-31',
        phaseStatutId: 'ech',
        titreDemarcheId: newDemarcheId('demarcheId11'),
      },
    ])
  })

  test("modification d'une mutation suite à renonciation totale en décision implicite", () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: 'titreId',
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: 'demarcheId1etapeId2',
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1970-09-17'),
          },
          {
            id: 'demarcheId1etapeId1',
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1970-09-09'),
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: 'titreId',
        typeId: 'mut',
        statutId: 'acc',
        ordre: 2,
        slug: 'm-cx-pontaubert-1970-mut01',
        etapes: [
          {
            id: 'demarcheId2EtapeId2',
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1994-10-18'),
            dateFin: toCaminoDate('2044-10-18'),
            duree: 600,
          },
          {
            id: 'demarcheId2EtapeId1',
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1994-10-13'),
            duree: 600,
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId3'),
        titreId: 'titreId',
        typeId: 'ren',
        statutId: 'acc',
        ordre: 3,
        etapes: [
          {
            id: 'demarcheId3etapeId1',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'mfr',
            statutId: 'fai',
            ordre: 1,
            date: toCaminoDate('2019-10-22'),
          },
          {
            id: 'demarcheId3etapeId2',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'mdp',
            statutId: 'fai',
            ordre: 2,
            date: toCaminoDate('2019-11-20'),
          },
          {
            id: 'demarcheId3etapeId5',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 5,
            date: toCaminoDate('2022-05-09'),
          },
          {
            id: 'demarcheId3etapeId6',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 6,
            date: toCaminoDate('2022-05-09'),
          },
          {
            id: 'demarcheId3etapeId3',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'apd',
            statutId: 'fav',
            ordre: 3,
            date: toCaminoDate('2020-05-11'),
          },
          {
            id: 'demarcheId3etapeId4',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'app',
            statutId: 'fav',
            ordre: 4,
            date: toCaminoDate('2020-06-30'),
            slug: 'm-cx-pontaubert-1970-ren01-app01',
          },
        ],
      },
    ]
    const aujourdhui = toCaminoDate('2022-05-09')
    const titreTypeId = 'cxm'

    const tested = titrePhasesFind(demarches, aujourdhui, titreTypeId)
    expect(tested).toStrictEqual([
      {
        dateDebut: '1970-09-17',
        dateFin: '1994-10-18',
        phaseStatutId: 'ech',
        titreDemarcheId: newDemarcheId('demarcheId1'),
      },
      {
        dateDebut: '1994-10-18',
        dateFin: '2022-05-09',
        phaseStatutId: 'val',
        titreDemarcheId: newDemarcheId('demarcheId2'),
      },
    ])
  })

  test("modification d'une mutation suite à renonciation totale", () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: 'titreId',
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: 'demarcheId1etapeId2',
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1970-09-17'),
          },
          {
            id: 'demarcheId1etapeId1',
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1970-09-09'),
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: 'titreId',
        typeId: 'mut',
        statutId: 'acc',
        ordre: 2,
        etapes: [
          {
            id: 'demarcheId2EtapeId2',
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1994-10-18'),
            dateFin: toCaminoDate('2044-10-18'),
            duree: 600,
          },
          {
            id: 'demarcheId2EtapeId1',
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1994-10-13'),
            duree: 600,
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId3'),
        titreId: 'titreId',
        typeId: 'ren',
        statutId: 'acc',
        ordre: 3,
        etapes: [
          {
            id: 'demarcheId3etapeId1',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'mfr',
            statutId: 'fai',
            ordre: 1,
            date: toCaminoDate('2019-10-22'),
          },
          {
            id: 'demarcheId3etapeId2',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'mdp',
            statutId: 'fai',
            ordre: 2,
            date: toCaminoDate('2019-11-20'),
          },
          {
            id: 'demarcheId3etapeId3',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'apd',
            statutId: 'fav',
            ordre: 3,
            date: toCaminoDate('2020-05-11'),
          },
          {
            id: 'demarcheId3etapeId5',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'dim',
            statutId: 'acc',
            ordre: 5,
            date: toCaminoDate('2022-05-09'),
          },
          {
            id: 'demarcheId3etapeId4',
            titreDemarcheId: newDemarcheId('demarcheId3'),
            typeId: 'app',
            statutId: 'fav',
            ordre: 4,
            date: toCaminoDate('2020-06-30'),
          },
        ],
      },
    ]
    const aujourdhui = toCaminoDate('2022-05-09')
    const titreTypeId = 'cxm'

    //  d'un côté on a une dim, de l'autre on a une dex suivie d'une dpu
    const tested = titrePhasesFind(demarches, aujourdhui, titreTypeId)
    expect(tested).toStrictEqual([
      {
        dateDebut: '1970-09-17',
        dateFin: '1994-10-18',
        phaseStatutId: 'ech',
        titreDemarcheId: newDemarcheId('demarcheId1'),
      },
      {
        dateDebut: '1994-10-18',
        dateFin: '2022-05-09',
        phaseStatutId: 'val',
        titreDemarcheId: newDemarcheId('demarcheId2'),
      },
    ])
  })

  test('la phase d’une démarche d’octroi sans durée est affectée par une extension de périmètre postérieure', () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: 'titreId',
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: 'demarcheId1etapeId2',
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1968-01-24'),
          },
          {
            id: 'demarcheId1etapeId1',
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1968-01-13'),
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: 'titreId',
        typeId: DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
        statutId: 'acc',
        ordre: 2,
        etapes: [
          {
            id: 'demarcheId2EtapeId2',
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1981-09-13'),
            dateFin: toCaminoDate('2031-09-13'),
          },
          {
            id: 'demarcheId2EtapeId1',
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1981-09-09'),
          },
        ],
      },
    ]
    const aujourdhui = toCaminoDate('2022-05-09')
    const titreTypeId = 'cxm'

    const tested = titrePhasesFind(demarches, aujourdhui, titreTypeId)
    expect(tested).toStrictEqual([
      {
        dateDebut: '1968-01-24',
        dateFin: '1981-09-13',
        phaseStatutId: 'ech',
        titreDemarcheId: newDemarcheId('demarcheId1'),
      },
      {
        dateDebut: '1981-09-13',
        dateFin: '2031-09-13',
        phaseStatutId: 'val',
        titreDemarcheId: newDemarcheId('demarcheId2'),
      },
    ])
  })

  test('un titre en modification en instance doit avoir une nouvelle phase sans date de fin', () => {
    const demarches: ITitreDemarche[] = [
      {
        id: newDemarcheId('demarcheId1'),
        titreId: 'titreId',
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: 'demarcheId1etapeId2',
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('2017-11-11'),
            duree: 60,
          },
          {
            id: 'demarcheId1etapeId1',
            titreDemarcheId: newDemarcheId('demarcheId1'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('2017-11-06'),
          },
        ],
      },
      {
        id: newDemarcheId('demarcheId2'),
        titreId: 'titreId',
        typeId: DEMARCHES_TYPES_IDS.Prolongation1,
        statutId: DemarchesStatutsIds.EnConstruction,
        ordre: 2,
        etapes: [
          {
            id: 'demarcheId2EtapeId2',
            titreDemarcheId: newDemarcheId('demarcheId2'),
            typeId: 'mfr',
            statutId: 'fai',
            ordre: 2,
            date: toCaminoDate('2022-07-08'),
            duree: 60,
          },
        ],
      },
    ]
    const aujourdhui = toCaminoDate('2022-11-29')
    const titreTypeId = 'prw'

    const tested = titrePhasesFind(demarches, aujourdhui, titreTypeId)
    expect(tested).toStrictEqual([
      {
        dateDebut: '2017-11-11',
        dateFin: '2022-11-11',
        phaseStatutId: 'ech',
        titreDemarcheId: newDemarcheId('demarcheId1'),
      },
      {
        dateDebut: '2022-11-11',
        dateFin: null,
        phaseStatutId: 'val',
        titreDemarcheId: newDemarcheId('demarcheId2'),
      },
    ])
  })

  test('cas réels', () => {
    const phasesReels = titresProd as TitrePhasesTest[]
    phasesReels.forEach(([titreTypeId, demarches, phases, date], index) => {
      expect(titrePhasesFind(demarches, date, titreTypeId), `test N*${index}`).toStrictEqual(phases)
    })
  })

  // test('cas réels2', () => {
  //   const phasesReels = titresProd as TitrePhasesTest[]

  //   phasesReels.forEach(([titreTypeId, demarches, phases, date], index) => {

  //     if (phases.length) {

  //       const firstPhase = phases[0]
  //       const demarche = demarches.find(({id}) => id === firstPhase.titreDemarcheId)!

  //       expect(isDemarcheTypeOctroi(demarche.typeId)).toBe(true)
  //     }

  //     // if (phases.length && index !== 3325) {

  //     //   const totalJours = daysBetween(phases[0].dateDebut, phases[phases.length -1].dateFin!)

  //     //   let total2 = 0
  //     //   phases.forEach((p, i) => {
  //     //     total2 += daysBetween(p.dateDebut, p.dateFin!)
  //     //   })

  //     //   expect(totalJours, `plop ${index} ${demarches[0].id}`).toStrictEqual(total2)
  //     // }
  //   })
  // })
})
