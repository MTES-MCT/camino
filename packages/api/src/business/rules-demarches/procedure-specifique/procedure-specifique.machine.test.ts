import { orderAndInterpretMachine, setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { toCaminoDate } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { ProcedureSpecifiqueMachine } from './procedure-specifique.machine'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'

const psPccOctMachine = new ProcedureSpecifiqueMachine('pcc', 'oct')
const psCxmOctMachine = new ProcedureSpecifiqueMachine('cxm', 'oct')
const psPrmProMachine = new ProcedureSpecifiqueMachine('prm', 'pro')
const psArmProMachine = new ProcedureSpecifiqueMachine('arm', 'pro')

describe('vérifie l’arbre des procédures spécifique', () => {
  test('statut de la démarche simplifiee sans étape', () => {
    const service = orderAndInterpretMachine(psPccOctMachine, [])
    expect(service).canOnlyTransitionTo({ machine: psPccOctMachine, date: toCaminoDate('2024-10-10') }, ['FAIRE_DEMANDE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnConstruction)
  })
  test('demande irrecevable', () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psPccOctMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.DEFAVORABLE,
      ETES.demandeDeComplements.FAIT,
      ETES.receptionDeComplements.FAIT,
      ETES.declarationDIrrecevabilite.FAIT,
    ])
    expect(service).canOnlyTransitionTo({ machine: psPccOctMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Rejete)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })
  test('on peut notifier le demandeur apres une recevabilité favorable pour un PER ou une concession', () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.notificationAuDemandeur.FAIT,
    ])
    expect(service).canOnlyTransitionTo({ machine: psCxmOctMachine, date: dateFin }, ['NOTIFIER_DEMANDEUR'])
  })
  test('on ne peut pas notifier le demandeur apres une recevabilité favorable pour pcc', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(psPccOctMachine, '1999-04-14', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.recevabiliteDeLaDemande.FAVORABLE, ETES.notificationAuDemandeur.FAIT])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mno","etapeStatutId":"fai","date":"1999-04-18"}' after '["mfr_fai","mdp_fai","mcr_fav"]'. The event {"type":"NOTIFIER_DEMANDEUR","date":"1999-04-18","status":"fai"} should be one of '']`
    )
  })
  test("après la recevabilité favorable la démarche devient publique si il n'y a pas de mise en concurrence", () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psPrmProMachine, '1999-04-14', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.recevabiliteDeLaDemande.FAVORABLE])

    expect(service).canOnlyTransitionTo({ machine: psPrmProMachine, date: dateFin }, ['RENDRE_AVIS_CGE_IGEDD', 'NOTIFIER_DEMANDEUR'])
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })
  test('après la recevabilité favorable la démarche reste confidentielle si il y a une mise en concurrence', () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.recevabiliteDeLaDemande.FAVORABLE])

    expect(service).canOnlyTransitionTo({ machine: psCxmOctMachine, date: dateFin }, ['NOTIFIER_DEMANDEUR'])
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })
  test("ne peut pas rendre la décision de l'administration si la participation du public n'est pas terminée", () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.EN_COURS,
    ])

    expect(service).canOnlyTransitionTo({ machine: psArmProMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })
  test("réalise une demande de prolongation d'ARM complète", () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.decisionDeLadministration.ACCEPTE,
    ])

    expect(service).canOnlyTransitionTo({ machine: psArmProMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  // FIXMACHINE tester que la participation du public peut-être optionnelle
  // FIXMACHINE migrer l'enquête publique sur master
})
