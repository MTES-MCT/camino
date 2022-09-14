import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { ArmOctMachine } from './arm/oct.machine'

const machine = new ArmOctMachine()
describe('isEtapesOk', () => {
  // On n'est pas certain de notre base de données, si ça impacte les perf,
  test('refuse si les étapes ne sont pas temporellement dans le bon ordre', () => {
    expect(
      machine.isEtapesOk([
        { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: '2021-02-26' },
        { etapeTypeId: 'mdp', etapeStatutId: 'fai', date: '2021-02-10' }
      ])
    ).toBe(false)
  })
})

describe('whoIsBlocking', () => {
  test('on attend le PTMG pour la recevabilité d’une demande d’ARM', () => {
    expect(
      machine.whoIsBlocking([
        { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: '2021-02-01' },
        { etapeTypeId: 'mdp', etapeStatutId: 'fai', date: '2021-02-02' },
        { etapeTypeId: 'pfd', etapeStatutId: 'fai', date: '2021-02-03' }
      ])
    ).toStrictEqual([ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']])
  })

  test("on attend l'ONF pour la validation du paiement des frais de dossier", () => {
    expect(
      machine.whoIsBlocking([
        { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: '2021-02-01' },
        { etapeTypeId: 'mdp', etapeStatutId: 'fai', date: '2021-02-02' },
        { etapeTypeId: 'pfd', etapeStatutId: 'fai', date: '2021-02-03' },
        { etapeTypeId: 'mcp', etapeStatutId: 'com', date: '2021-02-04' }
      ])
    ).toStrictEqual([ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']])
  })

  test('on attend personne', () => {
    expect(
      machine.whoIsBlocking([
        { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: '2021-02-01' },
        { etapeTypeId: 'mdp', etapeStatutId: 'fai', date: '2021-02-02' },
        { etapeTypeId: 'pfd', etapeStatutId: 'fai', date: '2021-02-03' },
        { etapeTypeId: 'mcp', etapeStatutId: 'com', date: '2021-02-04' },
        { etapeTypeId: 'vfd', etapeStatutId: 'fai', date: '2021-02-05' },
        { etapeTypeId: 'mcr', etapeStatutId: 'fav', date: '2021-02-06' }
      ])
    ).toStrictEqual([])
  })
})
