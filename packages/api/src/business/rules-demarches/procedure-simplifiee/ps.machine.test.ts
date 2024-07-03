import { orderAndInterpretMachine } from '../machine-test-helper.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { ProcedureSimplifieeMachine } from './ps.machine.js'

describe('vérifie l’arbre des procédures simplifiées', () => {
  const psMachine = new ProcedureSimplifieeMachine()
  test('statut de la démarche sans étape', () => {
    const service = orderAndInterpretMachine(psMachine, [])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-14') }, ['FAIRE_DEMANDE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnConstruction)
  })
  test('peut créer une "mfr"', () => {
    const etapes = [{ ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') }]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-14') }, ['DEPOSER_DEMANDE', 'OUVRIR_PARTICIPATION_DU_PUBLIC', 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('peut déposer une demande', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-16') }, ['OUVRIR_PARTICIPATION_DU_PUBLIC', 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('ne peut pas faire deux dépôts de la demande', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    expect(() => orderAndInterpretMachine(psMachine, etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mdp","etapeStatutId":"fai","date":"2022-04-15"}' after '["mfr_fai","mdp_fai"]'. The event {"type":"DEPOSER_DEMANDE"} should be one of 'OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE']`
    )
  })

  test('peut faire une ouverture de la participation du public', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-16') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-18') }, ['CLOTURER_PARTICIPATION_DU_PUBLIC'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut faire une clotûre de la participation du public', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-04-17') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-18') }, ['RENDRE_DECISION_ADMINISTRATION_ACCEPTEE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("peut rendre une décision d'administration acceptée", () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-16') }, ['PUBLIER_DECISION_ACCEPTEE_AU_JORF', 'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut rendre une décision acceptée au recueil des actes administratifs', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-04-15') },
      { ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT, date: toCaminoDate('2022-04-16') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut faire la démarche valide la plus complète possible', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-04-17') },
      { ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-04-18') },
      { ...ETES.publicationDeDecisionAuJORF.ACCEPTE, date: toCaminoDate('2022-04-19') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-19') }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })
})
