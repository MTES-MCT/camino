import { ITitre, ITitreEtape } from '../../types'

import { etapesTypesPossibleACetteDateOuALaPlaceDeLEtape, titreDemarcheUpdatedEtatValidate } from './titre-demarche-etat-validate'
import { newDemarcheId, newEtapeId } from '../../database/models/_format/id-create'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { describe, test, expect, vi } from 'vitest'
import { caminoDateValidator, toCaminoDate } from 'camino-common/src/date'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON, etapeIdValidator } from 'camino-common/src/etape'
import { ArmOctMachine } from '../rules-demarches/arm/oct.machine'
import { TitreEtapeForMachine } from '../rules-demarches/machine-common'
import { communeIdValidator } from 'camino-common/src/static/communes'
import { km2Validator } from 'camino-common/src/number'

console.warn = vi.fn()
describe('teste titreDemarcheUpdatedEtatValidate', () => {
  test('ajoute une étape à une démarche vide', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'arm',
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { typeId: 'mfr', date: caminoDateValidator.parse('2030-01-01'), isBrouillon: ETAPE_IS_BROUILLON, statutId: 'fai', contenu: {}, communes: [], surface: null },
      newDemarcheId(),
      null
    )

    expect(valid.valid).toBe(true)
  })

  test('ajoute une étape à une démarche qui contient déjà une étape', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'arm',
        demarches: [{ typeId: 'pro' }, { typeId: 'oct' }],
      } as ITitre,
      { typeId: 'mdp', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2022-05-04'), communes: null, contenu: null, surface: null },
      newDemarcheId(),

      [{ id: newEtapeId('1'), typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2022-05-03'), communes: null, contenu: null, ordre: 1, surface: null }]
    )

    expect(valid.valid).toBe(true)
  })

  test('prend en compte les données des étapes pour la machine', () => {
    const demande: Pick<ITitreEtape, 'id' | 'statutId' | 'ordre' | 'typeId' | 'date' | 'contenu' | 'surface' | 'communes' | 'isBrouillon'> = {
      id: etapeIdValidator.parse('idMfr'),
      typeId: 'mfr',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      date: toCaminoDate('2020-10-22'),
      communes: [{ id: communeIdValidator.parse('97333') }],
      ordre: 1,
      contenu: null,
      surface: km2Validator.parse(51),
    }
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'prm',
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      demande,
      newDemarcheId(),
      [
        demande,
        { id: etapeIdValidator.parse('idMdp'), typeId: 'mdp', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2020-12-17'), ordre: 2 },
        { id: etapeIdValidator.parse('idSpp'), typeId: 'spp', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2021-01-18'), ordre: 3 },
        { id: etapeIdValidator.parse('idMcr'), typeId: 'mcr', statutId: 'fav', isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2022-11-17'), ordre: 4 },
        { id: etapeIdValidator.parse('idAnf'), typeId: 'anf', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2022-11-17'), ordre: 5 },
        { id: etapeIdValidator.parse('idAsc'), typeId: 'asc', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2022-11-17'), ordre: 6 },
        { id: etapeIdValidator.parse('idScl'), typeId: 'scl', statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2022-11-17'), ordre: 7 },
        { id: etapeIdValidator.parse('idApo'), typeId: 'apo', statutId: 'fav', isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2023-02-08'), ordre: 8 },
      ]
    )

    expect(valid).toMatchInlineSnapshot(`
        {
          "errors": null,
          "valid": true,
        }
      `)
  })

  test('modifie une étape à une démarche', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'arm',
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      {
        id: newEtapeId('1'),
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-05-04'),
        communes: null,
        contenu: null,
        surface: null,
      },
      newDemarcheId(),

      [
        { id: newEtapeId('1'), typeId: 'mfr', date: toCaminoDate('2022-05-03'), statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON, communes: null, contenu: null, ordre: 1, surface: null },
        { id: newEtapeId('2'), typeId: 'mdp', date: toCaminoDate('2022-05-04'), statutId: 'fai', isBrouillon: ETAPE_IS_NOT_BROUILLON, communes: null, contenu: null, ordre: 2, surface: null },
      ]
    )

    expect(valid.valid).toBe(true)
  })

  test('l’ajout d’une étape d’une démarche historique est valide', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'arm',
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { typeId: 'mfr', isBrouillon: ETAPE_IS_BROUILLON, date: caminoDateValidator.parse('2000-02-02'), statutId: 'fai' },
      newDemarcheId(),

      [{ id: '1', typeId: 'mfr', date: '2000-01-01' }] as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes' | 'isBrouillon'>[],
      false
    )

    expect(valid.valid).toBe(true)
  })

  test('l’ajout d’une étape à une démarche sans étape est valide', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'arm',
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { typeId: 'mfr', isBrouillon: ETAPE_IS_BROUILLON, date: caminoDateValidator.parse('2000-01-01'), statutId: 'fai' },
      newDemarcheId(),
      []
    )

    expect(valid.valid).toBe(true)
  })

  test("retourne une erreur si la démarche en cours de modification n'existe pas", () => {
    expect(
      titreDemarcheUpdatedEtatValidate(
        'oct',
        {
          typeId: 'arm',
          demarches: [{ typeId: 'pro' }],
        } as ITitre,
        { id: '1', typeId: 'mfr' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes' | 'isBrouillon'>,
        newDemarcheId(),

        []
      )
    ).toMatchInlineSnapshot(`
      {
        "errors": [
          "les étapes de la démarche machine ne sont pas valides",
        ],
        "valid": false,
      }
    `)

    expect(
      titreDemarcheUpdatedEtatValidate(
        'oct',
        {
          typeId: 'arm',
        } as ITitre,
        { id: '1', typeId: 'mfr' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes' | 'isBrouillon'>,
        newDemarcheId(),

        []
      )
    ).toMatchInlineSnapshot(`
      {
        "errors": [
          "les étapes de la démarche machine ne sont pas valides",
        ],
        "valid": false,
      }
    `)
  })

  test('supprime une étape', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'arm',
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { id: etapeIdValidator.parse('1'), typeId: 'mfr', date: caminoDateValidator.parse('2023-01-01'), statutId: 'fai', isBrouillon: ETAPE_IS_BROUILLON },
      newDemarcheId(),
      [{ id: etapeIdValidator.parse('1'), typeId: 'mfr', date: caminoDateValidator.parse('2023-01-01'), statutId: 'fai', isBrouillon: ETAPE_IS_BROUILLON, ordre: 1 }],
      true
    )

    expect(valid.valid).toBe(true)
  })

  test('ajoute une étape à une démarche sans machine', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'arm',
        demarches: [
          {
            typeId: 'oct',
          },
        ],
      } as ITitre,
      { typeId: 'mfr', date: '1030-01-01', statutId: 'fai' } as Pick<
        Required<ITitreEtape>,
        'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes' | 'isBrouillon'
      >,
      newDemarcheId()
    )

    expect(valid.valid).toBe(true)
  })

  test('ajoute une demande en construction à une démarche vide', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'axm',
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_BROUILLON, date: '2030-01-01' } as Pick<
        Required<ITitreEtape>,
        'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes' | 'isBrouillon'
      >,
      newDemarcheId()
    )

    expect(valid.valid).toBe(true)
  })

  test('ajoute une demande en construction à une démarche qui contient déjà une étape', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'axm',
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_BROUILLON, date: caminoDateValidator.parse('2024-01-01') },
      newDemarcheId(),

      [{ id: etapeIdValidator.parse('1'), date: caminoDateValidator.parse('2020-01-01'), typeId: 'dae', statutId: 'exe', isBrouillon: ETAPE_IS_NOT_BROUILLON, ordre: 1 }]
    )

    expect(valid.valid).toBe(true)
  })

  test('modifie une demande en construction à une démarche', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      'oct',
      {
        typeId: 'axm',
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { id: etapeIdValidator.parse('1'), typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_BROUILLON, date: caminoDateValidator.parse('2024-01-01') },
      newDemarcheId(),

      [
        { id: etapeIdValidator.parse('1'), typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_BROUILLON, date: caminoDateValidator.parse('2024-01-01'), ordre: 2 },
        { id: etapeIdValidator.parse('2'), typeId: 'dae', date: caminoDateValidator.parse('2020-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON, statutId: 'exe', ordre: 1 },
      ]
    )

    expect(valid.valid).toBe(true)
  })

  test('ne peut pas ajouter une 2ème demande en construction à une démarche', () => {
    expect(
      titreDemarcheUpdatedEtatValidate(
        'oct',
        {
          typeId: 'axm',
          demarches: [{ typeId: 'oct' }],
        } as ITitre,
        { typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_BROUILLON, date: caminoDateValidator.parse('2024-01-02') },
        newDemarcheId(),

        [{ id: etapeIdValidator.parse('1'), typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_BROUILLON, date: caminoDateValidator.parse('2024-01-01'), ordre: 1 }]
      )
    ).toMatchInlineSnapshot(`
      {
        "errors": [
          "les étapes de la démarche machine ne sont pas valides",
        ],
        "valid": false,
      }
    `)
  })

  test('ne peut pas ajouter une étape de type inconnu sur une machine', () => {
    expect(
      titreDemarcheUpdatedEtatValidate(
        'oct',
        {
          typeId: 'axm',
          demarches: [{ typeId: 'oct' }],
        } as ITitre,
        {
          typeId: 'aaa' as EtapeTypeId,
          date: toCaminoDate('2022-01-01'),
          statutId: 'fai',
          isBrouillon: ETAPE_IS_NOT_BROUILLON,
          communes: null,
          contenu: null,
          surface: null,
        },
        newDemarcheId(),

        [
          {
            id: newEtapeId('1'),
            typeId: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
            statutId: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
            isBrouillon: ETAPE_IS_BROUILLON,
            date: toCaminoDate('2021-01-01'),
            communes: null,
            contenu: null,
            ordre: 1,
            surface: null,
          },
          {
            id: newEtapeId('2'),
            typeId: EtapesTypesEtapesStatuts.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.REQUIS.etapeTypeId,
            statutId: EtapesTypesEtapesStatuts.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.REQUIS.etapeStatutId,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            date: toCaminoDate('2021-01-02'),
            communes: null,
            contenu: null,
            ordre: 1,
            surface: null,
          },
        ]
      )
    ).toMatchInlineSnapshot(`
      {
        "errors": [
          "les étapes de la démarche machine ne sont pas valides",
        ],
        "valid": false,
      }
    `)
  })
})

describe('etapesTypesPossibleACetteDateOuALaPlaceDeLEtape', function () {
  const etapes: TitreEtapeForMachine[] = [
    {
      id: newEtapeId('etapeId16'),
      typeId: 'sco',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 5,
      date: toCaminoDate('2019-11-27'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId10'),
      typeId: 'asc',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      ordre: 10,
      date: toCaminoDate('2019-12-04'),
      contenu: null,
      communes: [],
      surface: null,
    },
    {
      id: newEtapeId('etapeId14'),
      typeId: 'pfc',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
    expect(Object.keys(tested)).toHaveLength(1)
    expect(tested.dae).toMatchInlineSnapshot(`
      {
        "etapeStatutIds": [
          "exe",
        ],
        "mainStep": true,
      }
    `)
  })

  test('modifie une étape existante à la même date devrait permettre de recréer la même étape', () => {
    for (const etape of etapes ?? []) {
      const etapesTypesPossibles = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, etape.id, etape.date)
      if (Object.keys(etapesTypesPossibles).length === 0) {
        console.error(`pas d'étapes possibles à l'étape ${JSON.stringify(etape)}. Devrait contenir AU MOINS la même étape`)
      }
      expect(Object.keys(etapesTypesPossibles).length).toBeGreaterThan(0)
      expect(etapesTypesPossibles[etape.typeId]).toHaveProperty('etapeStatutIds')
    }
  })

  test('ajoute une nouvelle étape à la fin', () => {
    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2022-05-06'))
    expect(Object.keys(tested)).toHaveLength(1)
    expect(tested.mnv).toMatchInlineSnapshot(`
      {
        "etapeStatutIds": [
          "fai",
        ],
        "mainStep": false,
      }
    `)
  })

  test('ajoute une nouvelle étape en plein milieu', () => {
    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2019-12-04'))
    expect(Object.keys(tested).toSorted()).toStrictEqual(['ede', 'edm', 'mod'])
  })

  test('peut faire une dae, une rde et pfd AVANT la mfr', () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('idMfr'),
        ordre: 1,
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-05-17'),
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2019-12-04'))
    expect(Object.keys(tested).toSorted()).toStrictEqual(['dae', 'pfd', 'rde'])
  })

  test('peut faire que une pfd AVANT la mfr non mecanisee', () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('idMfr'),
        ordre: 1,
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2022-05-17'),
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2019-12-04'))
    expect(Object.keys(tested)).toStrictEqual(['pfd'])
  })

  test('peut faire refuser une rde après une demande mécanisée', () => {
    console.warn = vi.fn()
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('idMfr'),
        date: toCaminoDate('2021-11-02'),
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 8,
        contenu: null,
        communes: [],
        surface: null,
      },
      {
        id: newEtapeId('iddae'),
        date: toCaminoDate('2021-10-15'),
        typeId: 'dae',
        statutId: 'exe',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,

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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,

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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        ordre: 6,
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2022-07-01'))
    expect(Object.keys(tested).toSorted()).toStrictEqual(['asc', 'css', 'des', 'ede', 'mcb', 'mod', 'rcb', 'rde'])
    vi.resetAllMocks()
  })
  test('peut faire une completude (mcp) le même jour que le dépôt (mdp) de la demande', () => {
    const etapes: TitreEtapeForMachine[] = [
      {
        id: newEtapeId('id3'),
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        date: toCaminoDate('2021-07-05'),
        ordre: 2,
        contenu: null,
        communes: [],
        surface: null,
      },
    ]

    const tested = etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(machine, etapes, null, toCaminoDate('2022-07-01'))
    expect(Object.keys(tested).toSorted()).toStrictEqual(['css', 'des', 'mcb', 'mcp', 'mod', 'rde'])
  })
})
