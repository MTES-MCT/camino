import {
  Etat,
  Etape,
  eventFrom,
  machine,
  Event,
  EVENTS,
  Status,
  ETATS
} from './oct.machine'
import { interpret } from 'xstate'

interface CustomMatchers<R = unknown> {
  canOnlyTransitionTo(_events: Event[]): R
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Expect extends CustomMatchers {}

    interface Matchers<R> extends CustomMatchers<R> {}

    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}
expect.extend({
  canOnlyTransitionTo(service, events: Event[]) {
    events.sort()
    const passEvents = EVENTS.filter(event => {
      return service.state.can(event)
    })
    passEvents.sort()
    if (
      passEvents.length !== events.length ||
      passEvents.some((entry, index) => entry !== events[index])
    ) {
      return {
        pass: false,
        message: () =>
          `Expected possible transitions to be ['${events.join(
            "','"
          )}'] but were ['${passEvents.join("','")}']`
      }
    }

    return {
      pass: true,
      message: () => 'OK'
    }
  }
})

const arrayMove = <T>(arr: T[], fromIndex: number, toIndex: number) => {
  const element = arr[fromIndex]
  arr.splice(fromIndex, 1)
  arr.splice(toIndex, 0, element)
}

const computeMachine = (etapes: readonly Etape[]) => {
  const service = interpret(machine)

  service.start()

  const sortedEtapes = etapes
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
  // on trie manuellement certaines étapes (pfd, rde, dae) et on les place APRÈS notre mdp
  let mdpIndex = sortedEtapes.findIndex(
    etape => etape.typeId === ETATS.DepotDeLaDemande
  )
  if (mdpIndex > 0) {
    ;[
      ETATS.PaiementDesFraisDeDossier,
      ETATS.DecisionAutoriteEnvironnementale,
      ETATS.RecepisseDeDeclarationLoiSurLEau
    ].forEach(etapeTypeId => {
      const index = sortedEtapes.findIndex(e => e.typeId === etapeTypeId)
      if (index !== -1 && index < mdpIndex) {
        arrayMove(sortedEtapes, index, mdpIndex)
        mdpIndex--
      }
    })
  }
  for (let i = 0; i < sortedEtapes.length; i++) {
    const etapeAFaire = sortedEtapes[i]
    const event = eventFrom(etapeAFaire)
    // si plusieurs étapes sont à la même date, des fois ça coince, on réagence
    if (etapeAFaire.date === sortedEtapes[i + 1]?.date) {
      if (!service.state.can(event)) {
        const savePoint = service.getSnapshot()
        const newEtapes = [...sortedEtapes]
        arrayMove(newEtapes, i, i + 1)
        console.log(
          'on permute',
          sortedEtapes[i],
          ' et ',
          sortedEtapes[i + 1],
          ' plop ',
          newEtapes
        )
        let permutationOk = true
        for (let sub = i; sub < newEtapes.length; sub++) {
          const subEvent = eventFrom(newEtapes[sub])
          console.log('on test si on peut aller vers ', subEvent)
          if (!service.state.can(subEvent)) {
            permutationOk = false
            sub = newEtapes.length
          } else {
            service.send(subEvent)
          }
        }
        if (permutationOk) {
          sortedEtapes.splice(0, sortedEtapes.length, ...newEtapes)
        } else {
          console.log('on roooollllbaaaaaack')
          service.start(savePoint)
        }
        //  permutation ok: sortedEtapes = newEtapes
      }
      // limitation : on ne regarde pas les étapes d'après, qui peuvent être blocantes en fonction des étapes que l'on a réordonnées
    }
    if (!service.state.can(event)) {
      throw new Error(
        `Error: cannot execute step: '${JSON.stringify(
          etapeAFaire
        )}' after '${JSON.stringify(
          sortedEtapes
            .slice(0, i)
            .map(etape => etape.typeId + '_' + etape.statutId)
        )}'. The event ${JSON.stringify(
          event
        )} should be one of '${service.state.nextEvents.filter(nextEvent => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return EVENTS.includes(nextEvent) && service.state.can(nextEvent)
        })}'`
      )
    }
    service.send(event)
  }

  service.stop()

  return service
}
describe('machine', () => {
  test('ne peux pas désister', () => {
    const service = interpret(machine)
    const interpreter = service.start()

    const state = interpreter.state

    // DESISTER_PAR_LE_DEMANDEUR est un événement potentiel mais pas faisable, dû à une condition
    expect(state.nextEvents).toContain('DESISTER_PAR_LE_DEMANDEUR')
    expect(state.can('DESISTER_PAR_LE_DEMANDEUR')).toBe(false)
  })

  test('quelles sont mes prochaines étapes sur un titre mécanisé', () => {
    const service = computeMachine([
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
      'CLASSER_SANS_SUITE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'EXEMPTER_DAE',
      'DEMANDER_MODIFICATION_DE_LA_DEMANDE',
      'DEMANDER_COMPLEMENTS_DAE',
      'MODIFIER_DEMANDE'
    ])
  })

  test('quelles sont mes prochaines étapes sur un titre mécanisé avec franchissements', () => {
    const service = computeMachine([
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
      // TODO 2022-04-14: refuser RDE revient à demander une modification de la demande non ?
      'REFUSER_RDE'
    ])
  })

  // TODO 2022-04-01: ce projet peut être intéressant pour les tests: https://xstate.js.org/docs/packages/xstate-graph/#quick-start
  // notamment car il permet de trouver tous les chemins possibles vers les états finaux
  test('quelles sont mes prochaines étapes non mécanisé', () => {
    const service = computeMachine([
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
    const service = computeMachine([
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
      'DESISTER_PAR_LE_DEMANDEUR',
      'DEMANDER_COMPLEMENTS_COMPLETUDE',
      'MODIFIER_DEMANDE'
    ])
  })
})

// tests récupérés depuis oct.test.ts
describe('vérifie l’arbre d’octroi d’ARM', () => {
  // TODO 2022-04-14  Ce n'est pas vrai ça non ?, la mfr est forcément la première étape
  // TODO 2022-04-19 LAURE -> C'était vrai, à voir si c'est toujours vrai
  test.skip.each(['mfr', 'pfd', 'dae', 'rde'])(
    'peut créer une étape "%s" si il n’existe pas d’autres étapes',
    _typeId => {
      // expect(octEtatsValidate([{ typeId }])).toHaveLength(0)
    }
  )

  test.each([
    { typeId: 'mcd', statutId: 'fai' },
    { typeId: 'mcb', statutId: 'fai' }
  ])(
    'ne peut pas créer une étape "%s" si il n’existe pas d’autres étapes',
    (etape: Etape) => {
      expect(() => computeMachine([etape])).toThrowErrorMatchingSnapshot()
    }
  )

  test('peut créer une étape "mdp" juste après une "mfr"', () => {
    computeMachine([
      { typeId: 'mfr', statutId: 'fai', date: '2022-04-14' },
      { typeId: 'mdp', statutId: 'fai', date: '2022-04-15' }
    ])
  })

  test('ne peut pas créer une étape "mcp" sans "mdp"', () => {
    expect(() =>
      computeMachine([
        { typeId: 'mfr', statutId: 'fai', date: '2022-04-14' },
        { typeId: 'mcp', statutId: 'com', date: '2022-04-16' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas créer 2 "mfr"', () => {
    expect(() =>
      computeMachine([
        { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' },
        { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
        { typeId: 'mfr', statutId: 'fai', date: '2020-01-03' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas déplacer une étape "mdp" sans "mfr"', () => {
    expect(() =>
      computeMachine([
        { typeId: 'mdp', statutId: 'dep', date: '2020-02-02' },
        { typeId: 'mfr', statutId: 'fai', date: '2020-02-03' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test.each([
    { typeId: 'rde', statutId: 'fav' },
    { typeId: 'dae', statutId: 'exe' }
  ])(
    'peut créer une étape "%s" juste après une "mdp" et que le titre est mécanisé avec franchissement d’eau',
    ({ typeId, statutId }: { typeId: Etat; statutId: Status }) => {
      computeMachine([
        {
          typeId: 'mfr',
          statutId: 'fai',
          date: '2020-01-01',
          contenu: { arm: { mecanise: true, franchissements: 1 } }
        },
        { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
        { typeId, statutId, date: '2020-01-03' }
      ])
    }
  )

  test.skip('peut créer une étape "mcp" après une "mdp"', () => {
    // TODO 2022-04-14 il faut payer les frais de dossier normalement !
    // TODO 2022-04-19 LAURE -> C'était vrai, à voir si c'est toujours vrai
    computeMachine([
      { typeId: 'mcp', statutId: 'com', date: '2020-02-03' },
      { typeId: 'mdp', statutId: 'dep', date: '2020-02-02' },
      { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' }
    ])
  })

  test('peut créer une "des" après "mdp"', () => {
    computeMachine([
      { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' },
      { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
      { typeId: 'des', statutId: 'fai', date: '2020-01-04' }
    ])
  })

  test('ne peut pas créer deux "des"', () => {
    expect(() =>
      computeMachine([
        { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' },
        { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
        { typeId: 'des', statutId: 'fai', date: '2020-01-03' },
        { typeId: 'des', statutId: 'fai', date: '2020-01-04' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })
  test('ne peut pas créer une "css" après une "des"', () => {
    expect(() =>
      computeMachine([
        { typeId: 'mfr', statutId: 'fai', date: '2020-01-01' },
        { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
        { typeId: 'des', statutId: 'fai', date: '2020-01-04' },
        { typeId: 'css', statutId: 'fai', date: '2020-01-05' }
      ])
    ).toThrowErrorMatchingSnapshot()
  })
  test('peut créer une "des" si le titre est en attente de "pfc"', () => {
    computeMachine([
      {
        typeId: 'mfr',
        statutId: 'fai',
        date: '2020-01-01',
        contenu: { arm: { mecanise: true } }
      },
      { typeId: 'mdp', statutId: 'dep', date: '2020-01-02' },
      { typeId: 'dae', statutId: 'exe', date: '2020-01-03' },
      // TODO 2022-04-14: obligé de payer les frais de dossier avant mcp
      // TODO 2022-04-19 LAURE -> C'est possible de pas avoir de PFD du tout?
      //  Réponse : c'est obligatoire et c'est obligé après un dépôt de la demande
      { typeId: 'pfd', statutId: 'fai', date: '2020-01-04' },
      { typeId: 'mcp', statutId: 'com', date: '2020-01-05' },
      // TODO 2022-04-14 modification globale de la demande non implémentée encore
      // { typeId: 'mod', date: '2020-01-06' },
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
      computeMachine([
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

  test.only('peut créer une "mnd" apres une "aca" défavorable', () => {
    computeMachine([
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
    computeMachine([
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
    computeMachine([
      { typeId: 'mfr', date: '2020-01-30', statutId: 'fai' },
      { typeId: 'mdp', date: '2020-02-23', statutId: 'fai' },
      { typeId: 'pfd', date: '2020-02-23', statutId: 'fai' },
      { typeId: 'mcp', date: '2020-02-28', statutId: 'com' }
    ])
  })

  test('peut créer une "sca" après une "aof" et "rde"', () => {
    computeMachine([
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
      //  TODO 2022-04-19: fix this shit, RDE au 30
      { typeId: 'rde', date: '2020-07-16', statutId: 'fav' },
      { typeId: 'vfd', date: '2020-07-31', statutId: 'fai' },
      { typeId: 'mcr', date: '2020-07-31', statutId: 'fav' },
      { typeId: 'eof', date: '2020-08-10', statutId: 'fai' },
      { typeId: 'aof', date: '2020-08-10', statutId: 'fav' },
      { typeId: 'sca', date: '2020-09-04', statutId: 'fai' }
    ])
  })

  test('peut créer une "mnb" après une "aca" favorable', () => {
    computeMachine([
      { typeId: 'sco', statutId: 'fai', date: '2020-09-28' },
      { typeId: 'vfc', statutId: 'fai', date: '2020-07-17' },
      { typeId: 'pfc', statutId: 'fai', date: '2020-07-16' },
      { typeId: 'mnb', statutId: 'fai', date: '2020-07-09' },
      { typeId: 'aca', statutId: 'fav', date: '2020-06-17' },
      { typeId: 'sca', statutId: 'fai', date: '2020-06-15' },
      // TODO 2022-04-15: la rde doit être faite avant la mcp
      //  TODO 2022-04-19: C'est à nous de le fixer
      // { typeId: 'rde', statutId: 'fav', date: '2020-02-11' },
      { typeId: 'aof', statutId: 'fav', date: '2020-02-08' },
      { typeId: 'eof', statutId: 'fai', date: '2020-02-07' },
      { typeId: 'mcr', statutId: 'fav', date: '2020-02-06' },
      { typeId: 'vfd', statutId: 'fai', date: '2020-02-05' },
      { typeId: 'mcp', statutId: 'com', date: '2020-01-23' },
      { typeId: 'rde', statutId: 'fav', date: '2020-01-20' },
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

  test.skip('les étapes sont vérifiées dans le bon ordre', () => {
    computeMachine([
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
      { typeId: 'rde', statutId: 'fav', date: '2021-04-09' }
    ])
  })

  test.skip('peut réaliser une saisine de la CARM après un récépissé de la déclaration sur l’eau défavorable', () => {
    expect(
      computeMachine([
        { typeId: 'sca', statutId: 'fai', date: '2021-09-24' },
        { typeId: 'aof', statutId: 'def', date: '2021-09-23' },
        { typeId: 'rde', statutId: 'def', date: '2021-09-22' },
        { typeId: 'edm', statutId: 'fav', date: '2021-04-30' },
        { typeId: 'eof', statutId: 'fai', date: '2021-03-17' },
        { typeId: 'mcb', statutId: 'fai', date: '2021-03-16' },
        { typeId: 'mcr', statutId: 'fav', date: '2021-03-10' },
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
    )
  })
})
