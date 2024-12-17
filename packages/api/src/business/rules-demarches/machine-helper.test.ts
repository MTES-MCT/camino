import { toCaminoDate } from 'camino-common/src/date'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { ArmOctMachine } from './arm/oct.machine'
import { describe, expect, test } from 'vitest'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { getPhase } from './machine-helper'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
const armOctMachine = new ArmOctMachine(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.Octroi)
describe('getPhase', () => {
  test('ne retourne pas de phase en démarche sans phase', () => {
    expect(getPhase({ demarcheStatut: DemarchesStatutsIds.Accepte, publique: true, demarcheTypeId: DEMARCHES_TYPES_IDS.DeclarationDOuvertureDeTravaux })).toStrictEqual(null)
    expect(getPhase({ demarcheStatut: DemarchesStatutsIds.Accepte, publique: true, demarcheTypeId: DEMARCHES_TYPES_IDS.Retrait, demarcheDateEffet: toCaminoDate('2024-01-01') })).toStrictEqual(null)
  })

  test("retourne null si il n'y a ni date début, ni date fin", () => {
    expect(
      getPhase({
        demarcheStatut: DemarchesStatutsIds.Accepte,
        publique: true,
        demarcheTypeId: DEMARCHES_TYPES_IDS.Octroi,
        demarcheDateDebut: { dateDebut: null, dateEtape: null },
        demarcheDateFin: { dateFin: null, duree: null },
      })
    ).toStrictEqual(null)
  })

  test('retourne les bonnes dates', () => {
    expect(
      getPhase({
        demarcheStatut: DemarchesStatutsIds.Accepte,
        publique: true,
        demarcheTypeId: DEMARCHES_TYPES_IDS.Octroi,
        demarcheDateDebut: { dateDebut: toCaminoDate('2024-01-01'), dateEtape: null },
        demarcheDateFin: { dateFin: toCaminoDate('2025-01-12'), duree: null },
      })
    ).toMatchInlineSnapshot(`
      {
        "debut": "2024-01-01",
        "fin": "2025-01-12",
      }
    `)
  })

  test('la date de fin est calculée à partir de la durée', () => {
    expect(
      getPhase({
        demarcheStatut: DemarchesStatutsIds.Accepte,
        publique: true,
        demarcheTypeId: DEMARCHES_TYPES_IDS.Octroi,
        demarcheDateDebut: { dateDebut: toCaminoDate('2024-01-01'), dateEtape: null },
        demarcheDateFin: { dateFin: null, duree: 12 },
      })
    ).toMatchInlineSnapshot(`
      {
        "debut": "2024-01-01",
        "fin": "2025-01-01",
      }
    `)
  })
})
describe('isEtapesOk', () => {
  // On n'est pas certain de notre base de données, si ça impacte les perf,
  test('refuse si les étapes ne sont pas temporellement dans le bon ordre', () => {
    expect(
      armOctMachine.isEtapesOk([
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-26'),
        },
        {
          etapeTypeId: 'men',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-10'),
        },
      ])
    ).toBe(false)
  })
})
describe('orderMachine', () => {
  test("peut ordonner la machine, même si il y'a deux étapes identiques à la même date", () => {
    expect(
      armOctMachine.orderMachine([
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-01'),
          contenu: { arm: { mecanise: true } },
        },
        {
          etapeTypeId: 'men',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-02'),
        },
        {
          etapeTypeId: 'dae',
          etapeStatutId: 'exe',
          date: toCaminoDate('2020-01-03'),
        },
        {
          etapeTypeId: 'pfd',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'mcp',
          etapeStatutId: 'com',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'mod',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'vfd',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'mcr',
          etapeStatutId: 'fav',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'asc',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'sca',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'aca',
          etapeStatutId: 'ajo',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'mna',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'sca',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'aca',
          etapeStatutId: 'fav',
          date: toCaminoDate('2020-01-11'),
        },
      ])
    ).toMatchInlineSnapshot(`
      [
        {
          "contenu": {
            "arm": {
              "mecanise": true,
            },
          },
          "date": "2020-01-01",
          "etapeStatutId": "fai",
          "etapeTypeId": "mfr",
        },
        {
          "date": "2020-01-02",
          "etapeStatutId": "fai",
          "etapeTypeId": "men",
        },
        {
          "date": "2020-01-03",
          "etapeStatutId": "exe",
          "etapeTypeId": "dae",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "fai",
          "etapeTypeId": "pfd",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "com",
          "etapeTypeId": "mcp",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "fai",
          "etapeTypeId": "mod",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "fai",
          "etapeTypeId": "vfd",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "fav",
          "etapeTypeId": "mcr",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "fai",
          "etapeTypeId": "asc",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "fai",
          "etapeTypeId": "sca",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "ajo",
          "etapeTypeId": "aca",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "fai",
          "etapeTypeId": "mna",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "fai",
          "etapeTypeId": "sca",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "fav",
          "etapeTypeId": "aca",
        },
      ]
    `)
  })
})

describe('demarcheStatut', () => {
  test('demarche publique et acceptée', () => {
    expect(
      armOctMachine.demarcheStatut([
        {
          date: toCaminoDate('2020-07-27'),
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          contenu: { arm: { mecanise: true, franchissements: 1 } },
        },
        {
          date: toCaminoDate('2021-07-27'),
          etapeTypeId: 'men',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2021-07-28'),
          etapeTypeId: 'dae',
          etapeStatutId: 'exe',
        },
        {
          date: toCaminoDate('2021-07-28'),
          etapeTypeId: 'pfd',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2021-07-28'),
          etapeTypeId: 'mcp',
          etapeStatutId: 'com',
        },
        {
          date: toCaminoDate('2021-07-29'),
          etapeTypeId: 'vfd',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2021-09-16'),
          etapeTypeId: 'mcr',
          etapeStatutId: 'fav',
        },
        {
          date: toCaminoDate('2021-12-13'),
          etapeTypeId: 'rde',
          etapeStatutId: 'fav',
          contenu: { arm: { franchissements: 1 } },
        },
        {
          date: toCaminoDate('2021-12-20'),
          etapeTypeId: 'asc',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2022-02-11'),
          etapeTypeId: 'sca',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2022-02-11'),
          etapeTypeId: 'aca',
          etapeStatutId: 'ajo',
        },
        {
          date: toCaminoDate('2022-02-23'),
          etapeTypeId: 'mna',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2022-03-16'),
          etapeTypeId: 'sca',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2022-03-16'),
          etapeTypeId: 'aca',
          etapeStatutId: 'fav',
        },
        {
          date: toCaminoDate('2022-03-31'),
          etapeTypeId: 'mnb',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2022-04-26'),
          etapeTypeId: 'pfc',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2022-04-26'),
          etapeTypeId: 'vfc',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2022-04-26'),
          etapeTypeId: 'sco',
          etapeStatutId: 'fai',
          dateFin: toCaminoDate('2023-01-01'),
          contenu: { arm: { mecanise: true } },
        },
      ])
    ).toStrictEqual({
      demarcheStatut: 'acc',
      publique: true,
      demarcheTypeId: DEMARCHES_TYPES_IDS.Octroi,
      demarcheDateDebut: { dateDebut: null, dateEtape: '2022-04-26' },
      demarcheDateFin: { dateFin: '2023-01-01', duree: null },
    })
  })
})
describe('whoIsBlocking', () => {
  test('on attend la DGTM pour la recevabilité d’une demande d’ARM', () => {
    expect(
      armOctMachine.whoIsBlocking([
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-01'),
        },
        {
          etapeTypeId: 'men',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-02'),
        },
        {
          etapeTypeId: 'pfd',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-03'),
        },
      ])
    ).toStrictEqual([ADMINISTRATION_IDS['DGTM - GUYANE']])
  })

  test('on attend la DGTM pour la validation du paiement des frais de dossier', () => {
    expect(
      armOctMachine.whoIsBlocking([
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-01'),
        },
        {
          etapeTypeId: 'men',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-02'),
        },
        {
          etapeTypeId: 'pfd',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-03'),
        },
        {
          etapeTypeId: 'mcp',
          etapeStatutId: 'com',
          date: toCaminoDate('2021-02-04'),
        },
      ])
    ).toStrictEqual([ADMINISTRATION_IDS['DGTM - GUYANE']])
  })

  test('on attend personne', () => {
    expect(
      armOctMachine.whoIsBlocking([
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-01'),
        },
        {
          etapeTypeId: 'men',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-02'),
        },
        {
          etapeTypeId: 'pfd',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-03'),
        },
        {
          etapeTypeId: 'mcp',
          etapeStatutId: 'com',
          date: toCaminoDate('2021-02-04'),
        },
        {
          etapeTypeId: 'vfd',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-05'),
        },
        {
          etapeTypeId: 'mcr',
          etapeStatutId: 'fav',
          date: toCaminoDate('2021-02-06'),
        },
      ])
    ).toStrictEqual([])
  })
})

describe('mainStep', () => {
  test("les étapes après une demande d'octroi d'arm", () => {
    expect(
      armOctMachine.possibleNextEtapes(
        [
          {
            etapeTypeId: 'mfr',
            etapeStatutId: 'fai',
            date: toCaminoDate('2021-02-01'),
          },
          {
            etapeTypeId: 'men',
            etapeStatutId: 'fai',
            date: toCaminoDate('2021-02-02'),
          },
        ],
        toCaminoDate('2021-02-03')
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "css",
          "mainStep": false,
          "type": "CLASSER_SANS_SUITE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "des",
          "mainStep": false,
          "type": "DESISTER_PAR_LE_DEMANDEUR",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mod",
          "mainStep": false,
          "type": "MODIFIER_DEMANDE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "pfd",
          "mainStep": true,
          "type": "PAYER_FRAIS_DE_DOSSIER",
        },
      ]
    `)
  })
  test('possibleNextEtapes après une recevabilité favorable on rendre un avis des services et commissions consultatives', () => {
    expect(
      armOctMachine.possibleNextEtapes(
        [
          { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: toCaminoDate('2021-02-01') },
          { etapeTypeId: 'men', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'pfd', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'mcp', etapeStatutId: 'com', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'vfd', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'mcr', etapeStatutId: 'fav', date: toCaminoDate('2021-02-02') },
        ],
        toCaminoDate('2021-02-03')
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "asc",
          "mainStep": true,
          "type": "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "css",
          "mainStep": false,
          "type": "CLASSER_SANS_SUITE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "des",
          "mainStep": false,
          "type": "DESISTER_PAR_LE_DEMANDEUR",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fav",
          "etapeTypeId": "exp",
          "mainStep": false,
          "type": "RECEVOIR_EXPERTISE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "def",
          "etapeTypeId": "exp",
          "mainStep": false,
          "type": "RECEVOIR_EXPERTISE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mod",
          "mainStep": false,
          "type": "MODIFIER_DEMANDE",
        },
      ]
    `)
  })
  test('après un avis des services et commissions consultatives on doit avoir la saisine de la commission des autorisations de recherches minières', () => {
    expect(
      armOctMachine.possibleNextEtapes(
        [
          { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: toCaminoDate('2021-02-01') },
          { etapeTypeId: 'men', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'pfd', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'mcp', etapeStatutId: 'com', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'vfd', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'mcr', etapeStatutId: 'fav', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'asc', etapeStatutId: 'fai', date: toCaminoDate('2020-02-02') },
        ],
        toCaminoDate('2021-02-03')
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "css",
          "mainStep": false,
          "type": "CLASSER_SANS_SUITE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "des",
          "mainStep": false,
          "type": "DESISTER_PAR_LE_DEMANDEUR",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fav",
          "etapeTypeId": "exp",
          "mainStep": false,
          "type": "RECEVOIR_EXPERTISE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "def",
          "etapeTypeId": "exp",
          "mainStep": false,
          "type": "RECEVOIR_EXPERTISE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mod",
          "mainStep": false,
          "type": "MODIFIER_DEMANDE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "sca",
          "mainStep": true,
          "type": "FAIRE_SAISINE_CARM",
        },
      ]
    `)
  })
  test('après la validation de frais de paiement on doit faire une recevabilité', () => {
    expect(
      armOctMachine.possibleNextEtapes(
        [
          { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: toCaminoDate('2021-02-01') },
          { etapeTypeId: 'men', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'pfd', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'mcp', etapeStatutId: 'com', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'vfd', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
        ],
        toCaminoDate('2021-02-03')
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "css",
          "mainStep": false,
          "type": "CLASSER_SANS_SUITE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "des",
          "mainStep": false,
          "type": "DESISTER_PAR_LE_DEMANDEUR",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mca",
          "mainStep": false,
          "type": "DEMANDER_COMPLEMENTS_MCR",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "def",
          "etapeTypeId": "mcr",
          "mainStep": false,
          "type": "DECLARER_DEMANDE_DEFAVORABLE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fav",
          "etapeTypeId": "mcr",
          "mainStep": true,
          "type": "DECLARER_DEMANDE_FAVORABLE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mim",
          "mainStep": false,
          "type": "DEMANDER_INFORMATION_MCR",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mod",
          "mainStep": false,
          "type": "MODIFIER_DEMANDE",
        },
      ]
    `)
  })
  test('après une recevabilité défavorable on doit avoir un avis des services et commissions consultatives', () => {
    expect(
      armOctMachine.possibleNextEtapes(
        [
          { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: toCaminoDate('2021-02-01') },
          { etapeTypeId: 'men', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'pfd', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'mcp', etapeStatutId: 'com', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'vfd', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'mcr', etapeStatutId: 'def', date: toCaminoDate('2021-02-02') },
        ],
        toCaminoDate('2021-02-03')
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "asc",
          "mainStep": true,
          "type": "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "css",
          "mainStep": false,
          "type": "CLASSER_SANS_SUITE",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "des",
          "mainStep": false,
          "type": "DESISTER_PAR_LE_DEMANDEUR",
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mod",
          "mainStep": false,
          "type": "MODIFIER_DEMANDE",
        },
      ]
    `)
  })
})
