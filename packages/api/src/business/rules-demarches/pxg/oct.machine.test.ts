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

  test('peut construire une demande complète', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      {
        ...ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: toCaminoDate('2022-04-16')
      },
      {
        ...ETES.receptionDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: toCaminoDate('2022-04-16')
      },
      {
        ...ETES.recevabiliteDeLaDemande.FAVORABLE,
        date: toCaminoDate('2022-04-17')
      },
      { ...ETES.saisineDesServices.FAIT, date: toCaminoDate('2022-04-18') },
      {
        ...ETES
          .avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi
          .FAVORABLE,
        date: toCaminoDate('2022-04-18')
      },
      {
        ...ETES.saisineDesCollectivitesLocales.FAIT,
        date: toCaminoDate('2022-04-19')
      },
      {
        ...ETES.saisineDeLautoriteEnvironnementale.FAIT,
        date: toCaminoDate('2022-04-20')
      },
      {
        ...ETES.avisDeLautoriteEnvironnementale.FAVORABLE,
        date: toCaminoDate('2022-04-21')
      },
      {
        ...ETES
          .avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement
          .FAVORABLE,
        date: toCaminoDate('2022-04-22')
      },
      {
        ...ETES.transmissionDuProjetDePrescriptionsAuDemandeur.FAIT,
        date: toCaminoDate('2022-04-23')
      },
      {
        ...ETES.avisDuDemandeurSurLesPrescriptionsProposees.FAVORABLE,
        date: toCaminoDate('2022-04-24')
      },
      {
        ...ETES.decisionDeLadministration.ACCEPTE,
        date: toCaminoDate('2022-04-25')
      },
      {
        ...ETES.notificationAuDemandeur.FAIT,
        date: toCaminoDate('2022-04-26')
      },
      {
        ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
        date: toCaminoDate('2022-04-26')
      }
    ]
    const service = orderAndInterpretMachine(pxgOctMachine, etapes)
    expect(service).canOnlyTransitionTo(pxgOctMachine, [])
  })
})
