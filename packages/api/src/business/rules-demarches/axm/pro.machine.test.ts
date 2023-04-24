import { interpretMachine, orderAndInterpretMachine } from '../machine-test-helper.js'
import { AxmProMachine } from './pro.machine.js'
import { describe, expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'

import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'

const etapesProd = require('./pro.cas.json')

describe('vérifie l’arbre de prolongation d’AXM', () => {
  const axmProMachine = new AxmProMachine()
  test('après la recevabilité, on peut faire une saisine des services', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: toCaminoDate('2022-04-16') },
    ]
    const service = orderAndInterpretMachine(axmProMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: axmProMachine, date: toCaminoDate('2022-04-17') }, [
      'DEMANDER_INFORMATION_POUR_AVIS_DREAL',
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_SAISINE_COLLECTIVITES_LOCALES',
      'FAIRE_SAISINE_DES_SERVICES',
      'RENDRE_DECISION_IMPLICITE_REJET',
    ])
  })

  // pour regénérer le pro.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    interpretMachine(axmProMachine, demarche.etapes)
    expect(axmProMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
