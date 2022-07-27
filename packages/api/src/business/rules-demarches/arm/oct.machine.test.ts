import { Etat, Etape, armOctMachine, ETATS } from './oct.machine'
import { interpret } from 'xstate'
import {
  interpretMachine,
  orderAndInterpretMachine
} from '../machine-test-helper'
import { IContenu } from '../../../types'
import { StatutId, STATUTS } from 'camino-common/src/static/etapesStatuts'

const etapesProd = require('./oct.cas.json')

describe('vérifie l’arbre d’octroi d’ARM', () => {
  test('ne peut pas désister', () => {
    const service = interpret(armOctMachine)
    const interpreter = service.start()

    const state = interpreter.state

    // DESISTER_PAR_LE_DEMANDEUR est un événement potentiel mais pas faisable, dû à une condition
    expect(state.nextEvents).toContain('DESISTER_PAR_LE_DEMANDEUR')
    expect(state.can('DESISTER_PAR_LE_DEMANDEUR')).toBe(false)
  })

  test('quelles sont mes prochaines étapes sur un titre mécanisé', () => {
    const service = orderAndInterpretMachine([
      { typeId: 'pfd', statutId: 'fai', date: '2020-02-03' },
      { typeId: 'mdp', statutId: 'dep', date: '2020-02-02' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2020-01-01',
        contenu: { arm: { mecanise: true } }
      }
    ])

    expect(service).canOnlyTransitionTo([
      'ACCEPTER_RDE',
      'CLASSER_SANS_SUITE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'EXEMPTER_DAE',
      'DEMANDER_MODIFICATION_DE_LA_DEMANDE',
      'DEMANDER_COMPLEMENTS_DAE',
      'DEMANDER_COMPLEMENTS_RDE',
      'MODIFIER_DEMANDE',
      'REFUSER_RDE'
    ])
  })

  test('quelles sont mes prochaines étapes sur un titre mécanisé avec franchissements', () => {
    const service = orderAndInterpretMachine([
      { typeId: 'pfd', statutId: 'fai', date: '2020-02-03' },
      { typeId: 'mdp', statutId: 'dep', date: '2020-02-02' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2020-01-01',
        contenu: { arm: { mecanise: true, franchissements: 1 } }
      }
    ])

    expect(service).canOnlyTransitionTo([
      'ACCEPTER_RDE',
      'CLASSER_SANS_SUITE',
      'DEMANDER_COMPLEMENTS_DAE',
      'DEMANDER_COMPLEMENTS_RDE',
      'DEMANDER_MODIFICATION_DE_LA_DEMANDE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'EXEMPTER_DAE',
      'MODIFIER_DEMANDE',
      'REFUSER_RDE'
    ])
  })

  // TODO 2022-04-01: ce projet peut être intéressant pour les tests: https://xstate.js.org/docs/packages/xstate-graph/#quick-start
  // notamment car il permet de trouver tous les chemins possibles vers les états finaux
  test('quelles sont mes prochaines étapes non mécanisé', () => {
    const service = orderAndInterpretMachine([
      { typeId: 'pfd', statutId: 'fai', date: '2020-02-03' },
      { typeId: 'mdp', statutId: 'dep', date: '2020-02-02' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2020-01-01',
        contenu: { arm: { mecanise: false } }
      }
    ])

    expect(service).canOnlyTransitionTo([
      'ACCEPTER_COMPLETUDE',
      'CLASSER_SANS_SUITE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'REFUSER_COMPLETUDE',
      'MODIFIER_DEMANDE'
    ])
  })

  test('on peut faire une demande de compléments après une complétude incomplète', () => {
    const service = orderAndInterpretMachine([
      { typeId: 'mcp', statutId: 'inc', date: '2020-02-04' },
      { typeId: 'pfd', statutId: 'fai', date: '2020-02-03' },
      { typeId: 'mdp', statutId: 'dep', date: '2020-02-02' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2020-01-01',
        contenu: { arm: { mecanise: false } }
      }
    ])

    expect(service).canOnlyTransitionTo([
      'CLASSER_SANS_SUITE',
      'DEMANDER_COMPLEMENTS_COMPLETUDE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'MODIFIER_DEMANDE'
    ])
  })

  test.each([
    {
      typeId: ETATS.DemandeDeComplementsDecisionAutoriteEnvironnementale,
      statutId: STATUTS.FAIT,
      date: '2020-01-01'
    },
    {
      typeId: ETATS.DemandeDeComplementsRecepisseDeDeclarationLoiSurLEau,
      statutId: STATUTS.FAIT,
      date: '2020-01-01'
    }
  ])(
    'ne peut pas créer une étape "%s" si il n’existe pas d’autres étapes',
    (etape: Etape) => {
      expect(() =>
        orderAndInterpretMachine([etape])
      ).toThrowErrorMatchingSnapshot()
    }
  )

  test('peut créer une étape "mdp" juste après une "mfr"', () => {
    orderAndInterpretMachine([
      { typeId: 'mfr', statutId: 'fai', date: '2022-04-14' },
      { typeId: 'mdp', statutId: 'fai', date: '2022-04-15' }
    ])
  })

  test('ne peut pas créer une étape "mcp" sans "mdp"', () => {
    expect(() =>
      orderAndInterpretMachine([
        { typeId: 'mfr', statutId: 'fai', date: '2022-04-14' },
        { typeId: 'mcp', statutId: 'com', date: '2022-04-16' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas créer 2 "mfr"', () => {
    expect(() =>
      orderAndInterpretMachine([
        { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' },
        { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
        { typeId: 'mfr', statutId: 'fai', date: '2020-01-03' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas déplacer une étape "mdp" sans "mfr"', () => {
    expect(() =>
      orderAndInterpretMachine([
        { typeId: 'mdp', statutId: 'dep', date: '2020-02-02' },
        { typeId: 'mfr', statutId: 'fai', date: '2020-02-03' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test.each([
    {
      typeId: ETATS.RecepisseDeDeclarationLoiSurLEau,
      statutId: STATUTS.FAVORABLE,
      contenu: { arm: { franchissements: 1 } }
    },
    {
      typeId: ETATS.DecisionAutoriteEnvironnementale,
      statutId: STATUTS.EXEMPTE
    }
  ])(
    'peut créer une étape "%s" juste après une "mdp" et que le titre est mécanisé avec franchissement d’eau',
    ({
      typeId,
      statutId,
      contenu
    }: {
      typeId: Etat
      statutId: StatutId
      contenu?: IContenu
    }) => {
      orderAndInterpretMachine([
        {
          typeId: 'mfr',
          statutId: 'fai',
          date: '2020-01-01',
          contenu: { arm: { mecanise: true, franchissements: 1 } }
        },
        { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
        { typeId, statutId, contenu, date: '2020-01-03' }
      ])
    }
  )

  test('peut créer une étape "mcp" après une "mdp"', () => {
    orderAndInterpretMachine([
      { typeId: 'mcp', statutId: 'com', date: '2020-02-03' },
      { typeId: 'pfd', statutId: 'fai', date: '2020-02-03' },
      { typeId: 'mdp', statutId: 'dep', date: '2020-02-02' },
      { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' }
    ])
  })

  test('peut créer une "des" après "mdp"', () => {
    orderAndInterpretMachine([
      { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' },
      { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
      { typeId: 'des', statutId: 'fai', date: '2020-01-04' }
    ])
  })

  test('ne peut pas créer deux "des"', () => {
    expect(() =>
      orderAndInterpretMachine([
        { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' },
        { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
        { typeId: 'des', statutId: 'fai', date: '2020-01-03' },
        { typeId: 'des', statutId: 'fai', date: '2020-01-04' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })
  test('ne peut pas créer une "css" après une "des"', () => {
    expect(() =>
      orderAndInterpretMachine([
        { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' },
        { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
        { typeId: 'des', statutId: 'fai', date: '2020-01-04' },
        { typeId: 'css', statutId: 'fai', date: '2020-01-05' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })
  test('peut créer une "des" si le titre est en attente de "pfc"', () => {
    orderAndInterpretMachine([
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2020-01-01',
        contenu: { arm: { mecanise: true } }
      },
      { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
      { typeId: 'dae', statutId: 'exe', date: '2020-01-03' },
      { typeId: 'pfd', statutId: 'fai', date: '2020-01-04' },
      { typeId: 'mcp', statutId: 'com', date: '2020-01-05' },
      { typeId: 'mod', statutId: 'fai', date: '2020-01-06' },
      { typeId: 'vfd', statutId: 'fai', date: '2020-01-06' },
      { typeId: 'mcr', statutId: 'fav', date: '2020-01-07' },
      { typeId: 'eof', statutId: 'fai', date: '2020-01-08' },
      { typeId: 'aof', statutId: 'fav', date: '2020-01-09' },
      { typeId: 'sca', statutId: 'fai', date: '2020-01-10' },
      { typeId: 'aca', statutId: 'fav', date: '2020-01-11' },
      { typeId: 'mnb', statutId: 'fai', date: '2020-01-12' },
      { typeId: 'des', statutId: 'fai', date: '2020-01-13' }
    ])
  })

  test('ne peut pas créer une "mno" après la "aca" si le titre n’est pas mécanisé', () => {
    expect(() =>
      orderAndInterpretMachine([
        { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' },
        { typeId: 'mdp', statutId: 'dep', date: '2020-01-01' },
        { typeId: 'pfd', statutId: 'fai', date: '2020-01-01' },
        { typeId: 'mcp', statutId: 'com', date: '2020-01-01' },
        { typeId: 'vfd', statutId: 'fai', date: '2020-01-01' },
        { typeId: 'mcr', statutId: 'fav', date: '2020-01-01' },
        { typeId: 'eof', statutId: 'fai', date: '2020-01-01' },
        { typeId: 'aof', statutId: 'fav', date: '2020-01-01' },
        { typeId: 'sca', statutId: 'fai', date: '2020-01-02' },
        { typeId: 'aca', statutId: 'fav', date: '2020-01-03' },
        { typeId: 'mnb', statutId: 'fai', date: '2020-01-04' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('peut créer une "mnd" apres une "aca" défavorable', () => {
    orderAndInterpretMachine([
      { typeId: 'mnd', date: '2020-08-18', statutId: 'fai' },
      { typeId: 'aca', date: '2020-08-18', statutId: 'def' },
      { typeId: 'sca', date: '2020-08-07', statutId: 'fai' },
      { typeId: 'aof', date: '2020-06-19', statutId: 'def' },
      { typeId: 'eof', date: '2020-06-19', statutId: 'fai' },
      { typeId: 'mcr', date: '2020-06-15', statutId: 'fav' },
      { typeId: 'vfd', date: '2020-06-15', statutId: 'fai' },
      { typeId: 'mcp', date: '2020-05-29', statutId: 'com' },
      { typeId: 'mdp', date: '2020-05-04', statutId: 'fai' },
      { typeId: 'pfd', date: '2020-05-01', statutId: 'fai' },
      { typeId: 'mfr', date: '2020-04-29', statutId: 'fai' }
    ])
  })

  test('peut créer une "mod" si il n’y a pas de sca', () => {
    orderAndInterpretMachine([
      { typeId: 'mfr', date: '2019-12-12', statutId: 'fai' },
      { typeId: 'mdp', date: '2019-12-12', statutId: 'fai' },
      { typeId: 'pfd', date: '2019-12-12', statutId: 'fai' },
      { typeId: 'mcp', date: '2020-01-21', statutId: 'com' },
      { typeId: 'vfd', date: '2020-02-05', statutId: 'fai' },
      { typeId: 'mcr', date: '2020-02-05', statutId: 'fav' },
      { typeId: 'eof', date: '2020-02-05', statutId: 'fai' },
      { typeId: 'aof', date: '2020-02-05', statutId: 'fav' },
      { typeId: 'mod', date: '2020-06-17', statutId: 'fai' }
    ])
  })

  test('peut créer une "mcp" après une "pfd" et "mdp"', () => {
    orderAndInterpretMachine([
      { typeId: 'mfr', date: '2020-01-30', statutId: 'fai' },
      { typeId: 'mdp', date: '2020-02-23', statutId: 'fai' },
      { typeId: 'pfd', date: '2020-02-23', statutId: 'fai' },
      { typeId: 'mcp', date: '2020-02-28', statutId: 'com' }
    ])
  })

  test('peut créer une "sca" après une "aof" et "rde"', () => {
    orderAndInterpretMachine([
      { typeId: 'dae', date: '2020-06-22', statutId: 'exe' },
      {
        typeId: 'mfr',
        date: '2020-07-09',
        statutId: 'fai',
        contenu: { arm: { mecanise: true, franchissements: 3 } }
      },
      { typeId: 'pfd', date: '2020-07-10', statutId: 'fai' },
      { typeId: 'mdp', date: '2020-07-17', statutId: 'fai' },
      { typeId: 'mcp', date: '2020-07-17', statutId: 'com' },
      {
        typeId: 'rde',
        date: '2020-07-30',
        statutId: 'fav',
        contenu: { arm: { franchissements: 3 } }
      },
      { typeId: 'vfd', date: '2020-07-31', statutId: 'fai' },
      { typeId: 'mcr', date: '2020-07-31', statutId: 'fav' },
      { typeId: 'eof', date: '2020-08-10', statutId: 'fai' },
      { typeId: 'aof', date: '2020-08-10', statutId: 'fav' },
      { typeId: 'sca', date: '2020-09-04', statutId: 'fai' }
    ])
  })

  test('peut faire une "sco" après une "aca" favorable en mécanisé', () => {
    orderAndInterpretMachine([
      { typeId: 'sco', statutId: 'fai', date: '2020-09-28' },
      { typeId: 'vfc', statutId: 'fai', date: '2020-07-17' },
      { typeId: 'pfc', statutId: 'fai', date: '2020-07-16' },
      { typeId: 'mnb', statutId: 'fai', date: '2020-07-09' },
      { typeId: 'aca', statutId: 'fav', date: '2020-06-17' },
      { typeId: 'sca', statutId: 'fai', date: '2020-06-15' },
      {
        typeId: 'rde',
        statutId: 'fav',
        date: '2020-02-11',
        contenu: { arm: { franchissements: 3 } }
      },
      { typeId: 'aof', statutId: 'fav', date: '2020-02-08' },
      { typeId: 'eof', statutId: 'fai', date: '2020-02-07' },
      { typeId: 'mcr', statutId: 'fav', date: '2020-02-06' },
      { typeId: 'vfd', statutId: 'fai', date: '2020-02-05' },
      { typeId: 'mcp', statutId: 'com', date: '2020-01-23' },
      { typeId: 'dae', statutId: 'exe', date: '2020-01-14' },
      { typeId: 'pfd', statutId: 'fai', date: '2019-12-13' },
      { typeId: 'mdp', statutId: 'fai', date: '2019-12-11' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2019-12-10',
        contenu: { arm: { mecanise: true, franchissements: 3 } }
      }
    ])
  })

  test('les étapes sont vérifiées dans le bon ordre', () => {
    orderAndInterpretMachine([
      { typeId: 'aof', statutId: 'fav', date: '2021-06-08' },
      { typeId: 'eof', statutId: 'fai', date: '2021-06-02' },
      { typeId: 'mcp', statutId: 'com', date: '2021-05-20' },
      { typeId: 'mcr', statutId: 'fav', date: '2021-05-20' },
      { typeId: 'vfd', statutId: 'fai', date: '2021-05-20' },
      { typeId: 'pfd', statutId: 'fai', date: '2021-05-20' },
      { typeId: 'dae', statutId: 'exe', date: '2021-05-20' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-05-20' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2021-05-20',
        contenu: { arm: { mecanise: true, franchissements: 3 } }
      },
      {
        typeId: 'rde',
        statutId: 'fav',
        date: '2021-04-09',
        contenu: { arm: { franchissements: 3 } }
      }
    ])
  })

  test('des étapes qui se font la même journée', () => {
    orderAndInterpretMachine([
      { typeId: 'mcp', statutId: 'com', date: '2021-02-26' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-02-26' },
      { typeId: 'mfr', statutId: 'fai', date: '2021-02-26' },
      { typeId: 'pfd', statutId: 'fai', date: '2020-09-03' }
    ])
  })

  test('peut réaliser une saisine de la CARM après un récépissé de la déclaration sur l’eau défavorable', () => {
    orderAndInterpretMachine([
      { typeId: 'sca', statutId: 'fai', date: '2021-09-24' },
      { typeId: 'aof', statutId: 'def', date: '2021-09-23' },
      {
        typeId: 'rde',
        statutId: 'def',
        date: '2021-09-22',
        contenu: { arm: { franchissements: 3 } }
      },
      { typeId: 'edm', statutId: 'fav', date: '2021-04-30' },
      { typeId: 'eof', statutId: 'fai', date: '2021-03-17' },
      { typeId: 'mcb', statutId: 'fai', date: '2021-03-16' },
      { typeId: 'mcr', statutId: 'fav', date: '2021-03-11' },
      { typeId: 'vfd', statutId: 'fai', date: '2021-03-10' },
      { typeId: 'mcp', statutId: 'com', date: '2021-02-26' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-02-26' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2021-02-26',
        contenu: { arm: { mecanise: true, franchissements: 3 } }
      },
      { typeId: 'pfd', statutId: 'fai', date: '2020-09-03' },
      { typeId: 'dae', statutId: 'exe', date: '2020-07-28' }
    ])
  })

  test('peut réaliser une demande d’informations sur l’avis de l’ONF', () => {
    orderAndInterpretMachine([
      { typeId: 'aof', statutId: 'def', date: '2021-09-23' },
      { typeId: 'ria', statutId: 'fai', date: '2021-09-21' },
      { typeId: 'mia', statutId: 'fai', date: '2021-09-20' },
      { typeId: 'eof', statutId: 'fai', date: '2021-03-17' },
      { typeId: 'mcr', statutId: 'fav', date: '2021-03-10' },
      { typeId: 'vfd', statutId: 'fai', date: '2021-03-10' },
      { typeId: 'mcp', statutId: 'com', date: '2021-02-26' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-02-26' },
      { typeId: 'mfr', statutId: 'fai', date: '2021-02-26' },
      { typeId: 'pfd', statutId: 'fai', date: '2020-09-03' }
    ])
  })

  test('peut réaliser une demande de compléments après un avis de la CARM ajourné', () => {
    orderAndInterpretMachine([
      { typeId: 'sca', statutId: 'fai', date: '2021-09-30' },
      { typeId: 'rcs', statutId: 'fai', date: '2021-09-28' },
      { typeId: 'mcs', statutId: 'fai', date: '2021-09-27' },
      { typeId: 'mna', statutId: 'fai', date: '2021-09-26' },
      { typeId: 'aca', statutId: 'ajo', date: '2021-09-25' },
      { typeId: 'sca', statutId: 'fai', date: '2021-09-24' },
      { typeId: 'aof', statutId: 'fav', date: '2021-09-23' },
      { typeId: 'eof', statutId: 'fai', date: '2021-03-17' },
      { typeId: 'mcr', statutId: 'fav', date: '2021-03-10' },
      { typeId: 'vfd', statutId: 'fai', date: '2021-03-10' },
      { typeId: 'mcp', statutId: 'com', date: '2021-02-26' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-02-26' },
      { typeId: 'mfr', statutId: 'fai', date: '2021-02-26' },
      { typeId: 'pfd', statutId: 'fai', date: '2020-09-03' }
    ])
  })

  test('peut réaliser une demande d’ARM non mécanisée et un avenant', () => {
    orderAndInterpretMachine([
      { typeId: 'mnv', statutId: 'fai', date: '2021-09-29' },
      { typeId: 'aco', statutId: 'fai', date: '2021-09-28' },
      { typeId: 'mns', statutId: 'fai', date: '2021-09-27' },
      { typeId: 'sco', statutId: 'fai', date: '2021-09-26' },
      { typeId: 'aca', statutId: 'fav', date: '2021-09-25' },
      { typeId: 'sca', statutId: 'fai', date: '2021-09-24' },
      { typeId: 'aof', statutId: 'fav', date: '2021-09-23' },
      { typeId: 'eof', statutId: 'fai', date: '2021-03-17' },
      { typeId: 'mcr', statutId: 'fav', date: '2021-03-10' },
      { typeId: 'vfd', statutId: 'fai', date: '2021-03-10' },
      { typeId: 'mcp', statutId: 'com', date: '2021-02-26' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-02-26' },
      { typeId: 'mfr', statutId: 'fai', date: '2021-02-26' },
      { typeId: 'pfd', statutId: 'fai', date: '2020-09-03' }
    ])
  })

  test('peut réaliser une demande d’ARM mécanisée et un avenant', () => {
    orderAndInterpretMachine([
      { typeId: 'mnv', statutId: 'fai', date: '2021-10-02' },
      { typeId: 'aco', statutId: 'fai', date: '2021-10-01' },
      { typeId: 'sco', statutId: 'fai', date: '2021-09-29' },
      { typeId: 'vfc', statutId: 'fai', date: '2021-09-28' },
      { typeId: 'pfc', statutId: 'fai', date: '2021-09-27' },
      { typeId: 'mnb', statutId: 'fai', date: '2021-09-26' },
      { typeId: 'aca', statutId: 'fav', date: '2021-09-25' },
      { typeId: 'sca', statutId: 'fai', date: '2021-09-24' },
      { typeId: 'aof', statutId: 'fav', date: '2021-09-23' },
      { typeId: 'eof', statutId: 'fai', date: '2021-03-17' },
      { typeId: 'mcr', statutId: 'fav', date: '2021-03-11' },
      { typeId: 'vfd', statutId: 'fai', date: '2021-03-10' },
      { typeId: 'mcp', statutId: 'com', date: '2021-02-29' },
      { typeId: 'pfd', statutId: 'fai', date: '2021-02-28' },
      { typeId: 'dae', statutId: 'exe', date: '2021-02-27' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-02-26' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2021-02-25',
        contenu: { arm: { mecanise: true } }
      }
    ])
  })

  test("peut faire une demande de compléments pour la RDE si les franchissements d'eau ne sont pas spécifiés sur une ARM mécanisée", () => {
    orderAndInterpretMachine([
      {
        typeId: 'rcb',
        statutId: 'fai',
        date: '2020-10-08',
        contenu: {
          arm: {
            franchissements: 4
          }
        }
      },
      { typeId: 'mcb', statutId: 'fai', date: '2020-10-05' },
      { typeId: 'mcp', statutId: 'com', date: '2020-08-25' },
      { typeId: 'mdp', statutId: 'fai', date: '2020-08-25' },
      { typeId: 'pfd', statutId: 'fai', date: '2020-08-20' },
      { typeId: 'dae', statutId: 'exe', date: '2020-07-30' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2020-07-14',
        contenu: {
          arm: {
            mecanise: true
          }
        }
      }
    ])
  })

  test('ne peut pas faire de mfr non mécanisée après une dae', () => {
    expect(() =>
      orderAndInterpretMachine([
        { typeId: 'dae', statutId: 'exe', date: '2021-02-23' },
        {
          typeId: 'mfr',
          statutId: 'fai',
          date: '2021-02-25',
          contenu: { arm: { mecanise: false } }
        }
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas faire de mfr non mécanisée après une rde', () => {
    expect(() =>
      orderAndInterpretMachine([
        {
          typeId: 'rde',
          statutId: 'fav',
          date: '2021-02-23',
          contenu: { arm: { franchissements: 1 } }
        },
        {
          typeId: 'mfr',
          statutId: 'fai',
          date: '2021-02-25',
          contenu: { arm: { mecanise: false } }
        }
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('peut réaliser une validation des frais de dossier complémentaire après un désistement', () => {
    orderAndInterpretMachine([
      { typeId: 'vfc', statutId: 'fai', date: '2021-10-04' },
      { typeId: 'mnc', statutId: 'fai', date: '2021-10-02' },
      { typeId: 'css', statutId: 'fai', date: '2021-10-01' },
      { typeId: 'aof', statutId: 'fav', date: '2021-09-23' },
      { typeId: 'eof', statutId: 'fai', date: '2021-03-17' },
      { typeId: 'mcr', statutId: 'fav', date: '2021-03-11' },
      { typeId: 'vfd', statutId: 'fai', date: '2021-03-10' },
      { typeId: 'mcp', statutId: 'com', date: '2021-02-29' },
      { typeId: 'pfd', statutId: 'fai', date: '2021-02-28' },
      { typeId: 'dae', statutId: 'exe', date: '2021-02-27' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-02-26' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2021-02-25',
        contenu: { arm: { mecanise: true } }
      }
    ])

    orderAndInterpretMachine([
      { typeId: 'vfc', statutId: 'fai', date: '2021-10-05' },
      { typeId: 'vfd', statutId: 'fai', date: '2021-10-04' },
      { typeId: 'mnc', statutId: 'fai', date: '2021-10-02' },
      { typeId: 'css', statutId: 'fai', date: '2021-10-01' },
      { typeId: 'mcp', statutId: 'com', date: '2021-02-29' },
      { typeId: 'pfd', statutId: 'fai', date: '2021-02-28' },
      { typeId: 'dae', statutId: 'exe', date: '2021-02-27' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-02-26' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2021-02-25',
        contenu: { arm: { mecanise: true } }
      }
    ])
    orderAndInterpretMachine([
      { typeId: 'vfc', statutId: 'fai', date: '2021-10-04' },
      { typeId: 'des', statutId: 'fai', date: '2021-10-01' },
      { typeId: 'aof', statutId: 'fav', date: '2021-09-23' },
      { typeId: 'eof', statutId: 'fai', date: '2021-03-17' },
      { typeId: 'mcr', statutId: 'fav', date: '2021-03-11' },
      { typeId: 'vfd', statutId: 'fai', date: '2021-03-10' },
      { typeId: 'mcp', statutId: 'com', date: '2021-02-29' },
      { typeId: 'pfd', statutId: 'fai', date: '2021-02-28' },
      { typeId: 'dae', statutId: 'exe', date: '2021-02-27' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-02-26' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2021-02-25',
        contenu: { arm: { mecanise: true } }
      }
    ])

    orderAndInterpretMachine([
      { typeId: 'vfc', statutId: 'fai', date: '2021-10-05' },
      { typeId: 'vfd', statutId: 'fai', date: '2021-10-04' },
      { typeId: 'des', statutId: 'fai', date: '2021-10-01' },
      { typeId: 'mcp', statutId: 'com', date: '2021-02-29' },
      { typeId: 'pfd', statutId: 'fai', date: '2021-02-28' },
      { typeId: 'dae', statutId: 'exe', date: '2021-02-27' },
      { typeId: 'mdp', statutId: 'fai', date: '2021-02-26' },
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2021-02-25',
        contenu: { arm: { mecanise: true } }
      }
    ])
  })

  test('ne peut pas faire une "mfr" non mécanisée avec un franchissement d’eau', () => {
    expect(() =>
      orderAndInterpretMachine([
        {
          typeId: 'mfr',
          statutId: 'fai',
          date: '2019-12-10',
          contenu: { arm: { mecanise: false, franchissements: 3 } }
        }
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    interpretMachine(demarche.etapes as Etape[])
  })
})
