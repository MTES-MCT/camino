import { orderAndInterpretMachine } from '../machine-test-helper.js'
import { PxgOctMachine } from './oct.machine.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
// const etapesProd = require('./oct.cas.json')

describe('vérifie l’arbre d’octroi des PXG', () => {
  const pxgOctMachine = new PxgOctMachine()

  test('peut créer une "mfr"', () => {
    const etapes = [{ ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') }]
    const service = orderAndInterpretMachine(pxgOctMachine, etapes)
    expect(service).canOnlyTransitionTo(pxgOctMachine, ['DEPOSER_DEMANDE'])
  })

  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  // test.skip.each(etapesProd as any[])('cas réel N°$id', demarche => {
  //   // ici les étapes sont déjà ordonnées
  //   interpretMachine(pxgOctMachine, demarche.etapes)
  //   expect(pxgOctMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
  //     demarcheStatut: demarche.demarcheStatutId,
  //     publique: demarche.demarchePublique
  //   })
  // })
})
