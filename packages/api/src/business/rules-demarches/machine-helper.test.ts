import { toCaminoDate } from 'camino-common/src/date.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { ArmOctMachine } from './arm/oct.machine.js'
import { describe, expect, test } from 'vitest'
const armOctMachine = new ArmOctMachine()
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
          etapeTypeId: 'mdp',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-10'),
        },
      ])
    ).toBe(false)
  })
})
describe('orderMachine', () => {
  test.only("peut ordonner la machine, même si il y'a deux étapes identiques à la même date", () => {
    expect(
      armOctMachine.orderMachine([
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-01'),
          contenu: { arm: { mecanise: true } },
        },
        {
          etapeTypeId: 'mdp',
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
          etapeTypeId: 'eof',
          etapeStatutId: 'fai',
          date: toCaminoDate('2020-01-11'),
        },
        {
          etapeTypeId: 'aof',
          etapeStatutId: 'fav',
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
          "etapeTypeId": "mdp",
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
          "etapeTypeId": "eof",
        },
        {
          "date": "2020-01-11",
          "etapeStatutId": "fav",
          "etapeTypeId": "aof",
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
          etapeTypeId: 'mdp',
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
          date: toCaminoDate('2021-09-16'),
          etapeTypeId: 'eof',
          etapeStatutId: 'fai',
        },
        {
          date: toCaminoDate('2021-12-13'),
          etapeTypeId: 'rde',
          etapeStatutId: 'fav',
          contenu: { arm: { franchissements: 1 } },
        },
        {
          date: toCaminoDate('2021-12-20'),
          etapeTypeId: 'aof',
          etapeStatutId: 'def',
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
          contenu: { arm: { mecanise: true } },
        },
      ])
    ).toStrictEqual({ demarcheStatut: 'acc', publique: true })
  })
})
describe('whoIsBlocking', () => {
  test('on attend le PTMG pour la recevabilité d’une demande d’ARM', () => {
    expect(
      armOctMachine.whoIsBlocking([
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-01'),
        },
        {
          etapeTypeId: 'mdp',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-02'),
        },
        {
          etapeTypeId: 'pfd',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-03'),
        },
      ])
    ).toStrictEqual([ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']])
  })

  test("on attend l'ONF pour la validation du paiement des frais de dossier", () => {
    expect(
      armOctMachine.whoIsBlocking([
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          date: toCaminoDate('2021-02-01'),
        },
        {
          etapeTypeId: 'mdp',
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
    ).toStrictEqual([ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']])
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
          etapeTypeId: 'mdp',
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
            etapeTypeId: 'mdp',
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
          "etapeTypeId": "mod",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "des",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "css",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "pfd",
          "mainStep": true,
        },
      ]
    `)
  })
  test('possibleNextEtapes après une recevabilité favorable on doit faire une expertise de l’onf', () => {
    expect(
      armOctMachine.possibleNextEtapes(
        [
          { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: toCaminoDate('2021-02-01') },
          { etapeTypeId: 'mdp', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
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
          "etapeTypeId": "mio",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "eof",
          "mainStep": true,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "def",
          "etapeTypeId": "ede",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fav",
          "etapeTypeId": "ede",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "def",
          "etapeTypeId": "edm",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fav",
          "etapeTypeId": "edm",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mod",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "des",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "css",
          "mainStep": false,
        },
      ]
    `)
  })
  test('après une expertise de l’onf on doit avoir l’avis de l’onf', () => {
    expect(
      armOctMachine.possibleNextEtapes(
        [
          { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: toCaminoDate('2021-02-01') },
          { etapeTypeId: 'mdp', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'pfd', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'mcp', etapeStatutId: 'com', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'vfd', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'mcr', etapeStatutId: 'fav', date: toCaminoDate('2021-02-02') },
          { etapeTypeId: 'eof', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
        ],
        toCaminoDate('2021-02-03')
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mia",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "def",
          "etapeTypeId": "aof",
          "mainStep": true,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "dre",
          "etapeTypeId": "aof",
          "mainStep": true,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fav",
          "etapeTypeId": "aof",
          "mainStep": true,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fre",
          "etapeTypeId": "aof",
          "mainStep": true,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mod",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "des",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "css",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "def",
          "etapeTypeId": "ede",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fav",
          "etapeTypeId": "ede",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "def",
          "etapeTypeId": "edm",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fav",
          "etapeTypeId": "edm",
          "mainStep": false,
        },
      ]
    `)
  })
  test('après la validation de frais de paiement on doit faire une recevabilité', () => {
    expect(
      armOctMachine.possibleNextEtapes(
        [
          { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: toCaminoDate('2021-02-01') },
          { etapeTypeId: 'mdp', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
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
          "etapeTypeId": "mim",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mca",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fav",
          "etapeTypeId": "mcr",
          "mainStep": true,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "def",
          "etapeTypeId": "mcr",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mod",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "des",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "css",
          "mainStep": false,
        },
      ]
    `)
  })
  test('après une recevabilité défavorable on doit avoir un avis de l’onf', () => {
    expect(
      armOctMachine.possibleNextEtapes(
        [
          { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: toCaminoDate('2021-02-01') },
          { etapeTypeId: 'mdp', etapeStatutId: 'fai', date: toCaminoDate('2021-02-02') },
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
          "etapeStatutId": "def",
          "etapeTypeId": "aof",
          "mainStep": true,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "dre",
          "etapeTypeId": "aof",
          "mainStep": true,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fav",
          "etapeTypeId": "aof",
          "mainStep": true,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fre",
          "etapeTypeId": "aof",
          "mainStep": true,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "mod",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "des",
          "mainStep": false,
        },
        {
          "contenu": undefined,
          "etapeStatutId": "fai",
          "etapeTypeId": "css",
          "mainStep": false,
        },
      ]
    `)
  })
})
