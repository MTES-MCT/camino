import { toCaminoDate } from 'camino-common/src/date.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { ArmOctMachine } from './arm/oct.machine.js'
import { describe, expect, test } from 'vitest'
const machine = new ArmOctMachine()
describe('isEtapesOk', () => {
  // On n'est pas certain de notre base de données, si ça impacte les perf,
  test('refuse si les étapes ne sont pas temporellement dans le bon ordre', () => {
    expect(
      machine.isEtapesOk([
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

describe('demarcheStatut', () => {
  test('demarche publique et acceptée', () => {
    expect(
      machine.demarcheStatut([
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
      machine.whoIsBlocking([
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
      machine.whoIsBlocking([
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
      machine.whoIsBlocking([
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
