import { interpretMachine, setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { AxmProMachine } from './pro.machine'
import { describe, expect, test } from 'vitest'

import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'

const etapesProd = require('./2000-01-01-pro.cas.json') // eslint-disable-line

describe('vérifie l’arbre de prolongation d’AXM', () => {
  const axmProMachine = new AxmProMachine()
  test('après la recevabilité, on peut faire une saisine des services', () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(axmProMachine, '2022-04-14', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.recevabiliteDeLaDemande.FAVORABLE])
    expect(service).canOnlyTransitionTo({ machine: axmProMachine, date: dateFin }, [
      'DEMANDER_INFORMATION_POUR_AVIS_DREAL',
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'RENDRE_AVIS_DE_COLLECTIVITES',
      'RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES',
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
