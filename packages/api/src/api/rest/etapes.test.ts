import { etapesTypesPossibleACetteDateOuALaPlaceDeLEtape } from './etapes.js'
import { ArmOctMachine } from '../../business/rules-demarches/arm/oct.machine.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test, vi } from 'vitest'
import { onlyUnique } from 'camino-common/src/typescript-tools.js'
import { newEtapeId } from '../../database/models/_format/id-create.js'
import { TitreEtapeForMachine } from '../../business/rules-demarches/machine-common.js'

describe('etapesTypesPossibleACetteDateOuALaPlaceDeLEtape', function () {
  const etapes: TitreEtapeForMachine[] = [
    {
      id: newEtapeId('etapeId16'),
      typeId: 'sco',
      statutId: 'fai',
      ordre: 16,
      date: toCaminoDate('2020-08-17'),
      contenu: { arm: { mecanise: true } },
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId1'),
      typeId: 'mfr',
      statutId: 'fai',
      ordre: 1,
      date: toCaminoDate('2019-09-19'),
      contenu: { arm: { mecanise: true, franchissements: 19 } },
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId5'),
      typeId: 'mcp',
      statutId: 'com',
      ordre: 5,
      date: toCaminoDate('2019-11-27'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId10'),
      typeId: 'aof',
      statutId: 'fav',
      ordre: 10,
      date: toCaminoDate('2019-12-04'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId9'),
      typeId: 'eof',
      statutId: 'fai',
      ordre: 9,
      date: toCaminoDate('2019-12-04'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId14'),
      typeId: 'pfc',
      statutId: 'fai',
      ordre: 14,
      date: toCaminoDate('2020-05-22'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId8'),
      typeId: 'mcr',
      statutId: 'fav',
      ordre: 8,
      date: toCaminoDate('2019-12-04'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId4'),
      typeId: 'pfd',
      statutId: 'fai',
      ordre: 4,
      date: toCaminoDate('2019-11-20'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId15'),
      typeId: 'vfc',
      statutId: 'fai',
      ordre: 15,
      date: toCaminoDate('2020-05-22'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId13'),
      typeId: 'mnb',
      statutId: 'fai',
      ordre: 13,
      date: toCaminoDate('2020-05-18'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId12'),
      typeId: 'aca',
      statutId: 'fav',
      ordre: 12,
      date: toCaminoDate('2020-05-13'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId6'),
      typeId: 'rde',
      statutId: 'fav',
      ordre: 6,
      date: toCaminoDate('2019-12-04'),
      communes: [],
      surface: null,
      contenu: { arm: { franchissements: 19 } },
    },
    {
      id: newEtapeId('etapeId2'),
      typeId: 'mdp',
      statutId: 'fai',
      ordre: 2,
      date: toCaminoDate('2019-09-20'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId7'),
      typeId: 'vfd',
      statutId: 'fai',
      ordre: 7,
      date: toCaminoDate('2019-12-04'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId11'),
      typeId: 'sca',
      statutId: 'fai',
      ordre: 11,
      date: toCaminoDate('2020-05-04'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId3'),
      typeId: 'dae',
      statutId: 'exe',
      ordre: 3,
      date: toCaminoDate('2019-10-11'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId17'),
      typeId: 'aco',
      statutId: 'fai',
      ordre: 17,
      date: toCaminoDate('2022-05-05'),
      contenu: null,
      communes: [],
      surface: null,
    },
  ]

  const machine = new ArmOctMachine()
  test('modifie une étape existante', () => {
    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, 'etapeId3', toCaminoDate('2019-10-11'))
    expect(tested).toHaveLength(1)
    expect(tested[0].etapeTypeId).toStrictEqual('dae')
  })

  test('modifie une étape existante à la même date devrait permettre de recréer la même étape', () => {
    for (const etape of etapes ?? []) {
      const etapesTypesPossibles = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, etape.id, etape.date)
      if (etapesTypesPossibles.length === 0) {
        console.error(`pas d'étapes possibles à l'étape ${JSON.stringify(etape)}. Devrait contenir AU MOINS la même étape`)
      }
      expect(etapesTypesPossibles.length).toBeGreaterThan(0)
      expect(etapesTypesPossibles.map(({ etapeTypeId }) => etapeTypeId)).toContain(etape.typeId)
    }
  })

  test('ajoute une nouvelle étape à la fin', () => {
    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2022-05-06'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toHaveLength(1)
    expect(tested[0]).toBe('mnv')
  })

  test('ajoute une nouvelle étape en plein milieu', () => {
    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2019-12-04'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toStrictEqual(['mod'])
  })

  test('peut faire une dae, une rde et pfd AVANT la mfr', () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('idMfr'),
        ordre: 1,
        typeId: 'mfr',
        statutId: 'fai',
        date: toCaminoDate('2022-05-16'),
        contenu: { arm: { mecanise: true, franchissements: 2 } },
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idMdp'),
        ordre: 2,
        typeId: 'mdp',
        statutId: 'fai',
        date: toCaminoDate('2022-05-17'),
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2019-12-04'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toStrictEqual(['rde', 'pfd', 'dae'])
  })

  test('peut faire que une pfd AVANT la mfr non mecanisee', () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('idMfr'),
        ordre: 1,
        typeId: 'mfr',
        statutId: 'fai',
        date: toCaminoDate('2022-05-16'),
        contenu: { arm: { mecanise: false } },
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idMdp'),
        ordre: 2,
        typeId: 'mdp',
        statutId: 'fai',
        date: toCaminoDate('2022-05-17'),
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2019-12-04'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toStrictEqual(['pfd'])
  })

  test('peut faire refuser une rde après une demande mécanisée', () => {
    console.warn = vi.fn()
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('idMfr'),
        date: toCaminoDate('2021-11-02'),
        typeId: 'mfr',
        statutId: 'fai',
        contenu: {
          arm: {
            mecanise: true,
            franchissements: 9,
          },
        },
        ordre: 3,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idrcm'),
        date: toCaminoDate('2021-11-17'),
        typeId: 'rcm',
        statutId: 'fai',
        contenu: {
          arm: {
            mecanise: true,
            franchissements: 9,
          },
        },
        ordre: 7,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idMcp'),
        date: toCaminoDate('2021-11-05'),
        typeId: 'mcp',
        statutId: 'inc',
        ordre: 5,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idmcp'),
        date: toCaminoDate('2021-11-17'),
        typeId: 'mcp',
        statutId: 'com',
        ordre: 8,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('ideof'),
        date: toCaminoDate('2021-11-22'),
        typeId: 'eof',
        statutId: 'fai',
        ordre: 11,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('iddae'),
        date: toCaminoDate('2021-10-15'),
        typeId: 'dae',
        statutId: 'exe',

        ordre: 1,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idmcr'),
        date: toCaminoDate('2021-11-22'),
        typeId: 'mcr',
        statutId: 'fav',
        contenu: null,
        ordre: 10,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idmcb'),
        date: toCaminoDate('2021-12-09'),
        typeId: 'mcb',
        statutId: 'fai',

        ordre: 13,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idedm'),
        date: toCaminoDate('2021-11-30'),
        typeId: 'edm',
        statutId: 'fav',
        ordre: 12,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idvfd'),
        date: toCaminoDate('2021-11-19'),
        typeId: 'vfd',
        statutId: 'fai',
        ordre: 9,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idpfd'),
        date: toCaminoDate('2021-10-26'),
        typeId: 'pfd',
        statutId: 'fai',
        ordre: 2,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idmdp'),
        date: toCaminoDate('2021-11-02'),
        typeId: 'mdp',
        statutId: 'fai',
        ordre: 4,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('idmcm'),
        date: toCaminoDate('2021-11-05'),
        typeId: 'mcm',
        statutId: 'fai',
        ordre: 6,
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2022-07-01'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toStrictEqual(['rcb', 'rde', 'mcb', 'mod', 'des', 'css', 'aof', 'mia', 'ede'])
    vi.resetAllMocks()
  })
  test('peut faire une completude (mcp) le même jour que le dépôt (mdp) de la demande', () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('id3'),
        typeId: 'mfr',
        statutId: 'fai',
        date: toCaminoDate('2022-06-23'),
        contenu: {
          arm: {
            mecanise: true,
            franchissements: 4,
          },
        },
        ordre: 3,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('id1'),
        typeId: 'dae',
        statutId: 'exe',
        date: toCaminoDate('2021-06-22'),
        ordre: 1,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('id4'),

        typeId: 'mdp',
        statutId: 'fai',
        date: toCaminoDate('2022-07-01'),
        ordre: 4,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('id2'),

        typeId: 'pfd',
        statutId: 'fai',
        date: toCaminoDate('2021-07-05'),
        ordre: 2,
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2022-07-01'))
      .map(({ etapeTypeId }) => etapeTypeId)
      .filter(onlyUnique)
    expect(tested).toStrictEqual(['mcp', 'mod', 'des', 'css', 'rde', 'mcb'])
  })
})
