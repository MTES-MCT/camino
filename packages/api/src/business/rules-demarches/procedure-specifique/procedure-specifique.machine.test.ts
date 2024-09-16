import { getEventsTree, orderAndInterpretMachine, setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { toCaminoDate } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { ProcedureSpecifiqueMachine } from './procedure-specifique.machine'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'

const psPccOctMachine = new ProcedureSpecifiqueMachine('pcc', 'oct')
const psCxmOctMachine = new ProcedureSpecifiqueMachine('cxm', 'oct')
const psPrmProMachine = new ProcedureSpecifiqueMachine('prm', 'pro')
const psArmProMachine = new ProcedureSpecifiqueMachine('arm', 'pro')
const psAxmProMachine = new ProcedureSpecifiqueMachine('axm', 'pro')

describe('vérifie l’arbre des procédures spécifique', () => {
  test('statut de la démarche simplifiee sans étape', () => {
    const service = orderAndInterpretMachine(psPccOctMachine, [])
    expect(service).canOnlyTransitionTo({ machine: psPccOctMachine, date: toCaminoDate('2024-10-10') }, ['FAIRE_DEMANDE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnConstruction)
  })
  test('demande irrecevable', () => {
    const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psPccOctMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.DEFAVORABLE,
      ETES.demandeDeComplements.FAIT,
      ETES.receptionDeComplements.FAIT,
      ETES.declarationDIrrecevabilite.FAIT,
    ])
    expect(service).canOnlyTransitionTo({ machine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Rejete)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })
  test('on peut notifier le demandeur apres une recevabilité favorable pour un PER ou une concession', () => {
    const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.notificationAuDemandeur.FAIT,
    ])
    expect(service).canOnlyTransitionTo({ machine, date: dateFin }, ['FAIRE_MISE_EN_CONCURRENCE', 'NOTIFIER_DEMANDEUR'])
  })

  // FIXMACHINE pour le moment on ne peut pas écrire ce test
  // test('on peut notifier le demandeur apres une recevabilité favorable pour un PER ou une concession qui n'est pas la première demande pour la mise en concurrence', () => {
  //    const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
  //      ETES.demande.FAIT,
  //      ETES.depotDeLaDemande.FAIT,
  //      ETES.recevabiliteDeLaDemande.FAVORABLE,
  //      ETES.notificationAuDemandeur.FAIT,
  //    ])
  //    expect(service).canOnlyTransitionTo({ machine, date: dateFin }, ['NOTIFIER_DEMANDEUR'])
  //  })
  test('on ne peut plus rien faire pendant que la mise en concurrence est en cours', () => {
    const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.EN_COURS,
    ])
    expect(service).canOnlyTransitionTo({ machine, date: dateFin }, [])
  })
  // test('on peut publier le résultat de la mise en concurrence, une fois celle-ci terminée', () => {
  //   const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
  //     ETES.demande.FAIT,
  //     ETES.depotDeLaDemande.FAIT,
  //     ETES.recevabiliteDeLaDemande.FAVORABLE,
  //     ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
  //   ])
  //   expect(service).canOnlyTransitionTo({ machine, date: dateFin }, ['RESULTAT_MISE_EN_CONCURRENCE'])
  // })
  test('on ne peut pas notifier le demandeur apres une recevabilité favorable pour pcc', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(psPccOctMachine, '1999-04-14', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.recevabiliteDeLaDemande.FAVORABLE, ETES.notificationAuDemandeur.FAIT])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mno","etapeStatutId":"fai","date":"1999-04-18"}' after '["mfr_fai","mdp_fai","mcr_fav"]'. The event {"type":"NOTIFIER_DEMANDEUR","date":"1999-04-18","status":"fai"} should be one of 'FAIRE_MISE_EN_CONCURRENCE']`
    )
  })
  test("après la recevabilité favorable la démarche reste confidentielle si il n'y a pas de mise en concurrence", () => {
    const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psPrmProMachine, '1999-04-14', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.recevabiliteDeLaDemande.FAVORABLE])

    expect(service).canOnlyTransitionTo({ machine, date: dateFin }, ['RENDRE_AVIS_CGE_IGEDD', 'NOTIFIER_DEMANDEUR'])
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })
  test('après la recevabilité favorable la démarche reste confidentielle si il y a une mise en concurrence', () => {
    const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.recevabiliteDeLaDemande.FAVORABLE])

    expect(service).canOnlyTransitionTo({ machine, date: dateFin }, ['NOTIFIER_DEMANDEUR', 'FAIRE_MISE_EN_CONCURRENCE'])
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })
  test("ne peut pas rendre la décision de l'administration si la participation du public n'est pas terminée", () => {
    const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.EN_COURS,
    ])

    expect(service).canOnlyTransitionTo({ machine, date: dateFin }, [])
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("réalise une demande de prolongation d'ARM complète", () => {
    const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.decisionDeLadministration.ACCEPTE,
      ETES.publicationDeDecisionAuJORF.FAIT,
      ETES.notificationAuDemandeur.FAIT,
    ])

    expect(service.getSnapshot().context.visibilite).toBe('publique')
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.AccepteEtPublie)
    expect(service).canOnlyTransitionTo({ machine, date: dateFin }, ['FAIRE_ABROGATION'])
  })
  test("réalise une demande de prolongation d'ARM rejetée", () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.decisionDeLadministration.REJETE,
    ])

    expect(service).canOnlyTransitionTo({ machine: psArmProMachine, date: dateFin }, ['NOTIFIER_DEMANDEUR'])
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })
  test("réalise une demande de prolongation d'ARM rejetée puis une notification au demandeur", () => {
    const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.decisionDeLadministration.REJETE,
      ETES.notificationAuDemandeur.FAIT,
    ])

    expect(service).canOnlyTransitionTo({ machine, date: dateFin }, [])
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Rejete)
  })

  test("réalise une demande de prolongation d'ARM rejetée suite à une décision implicite", () => {
    const { service, dateFin, machine } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.decisionDeLadministration.REJETE_DECISION_IMPLICITE,
    ])

    expect(service).canOnlyTransitionTo({ machine, date: dateFin }, [])
    expect(service.getSnapshot().context.visibilite).toBe('publique')
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Rejete)
  })

  test("réalise une demande de prolongation d'AXM complète", () => {
    const result = getEventsTree(psAxmProMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.decisionDeLadministration.ACCEPTE,
      ETES.publicationDeDecisionAuJORF.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.attestationDeConstitutionDeGarantiesFinancieres.FAIT,
    ])

    expect(result).toMatchInlineSnapshot(`
      [
        "RIEN                                                       (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                              (confidentielle, en instruction         ) -> [DEPOSER_DEMANDE]",
        "DEPOSER_DEMANDE                                            (confidentielle, en instruction         ) -> [FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE                               (confidentielle, en instruction         ) -> [OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES                                  (confidentielle, en instruction         ) -> [OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS                           (confidentielle, en instruction         ) -> [OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                                         (confidentielle, en instruction         ) -> [OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC                             (publique      , en instruction         ) -> [RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE                    (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF                          (publique      , accepté et publié      ) -> [FAIRE_ABROGATION,NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                         (publique      , accepté et publié      ) -> [FAIRE_ABROGATION,FAIRE_ATTESTATION_DE_CONSTITUTION_DE_GARANTIES_FINANCIERES]",
        "FAIRE_ATTESTATION_DE_CONSTITUTION_DE_GARANTIES_FINANCIERES (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
      ]
    `)
  })

  test("vérifie l'arbre pour la prolongation d'ARM", () => {
    const result = getEventsTree(psArmProMachine, '1999-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.decisionDeLadministration.ACCEPTE,
      ETES.publicationDeDecisionAuJORF.FAIT,
      ETES.abrogationDeLaDecision.FAIT,
      ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
    ])

    expect(result).toMatchInlineSnapshot(`
      [
        "RIEN                                                 (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                        (confidentielle, en instruction         ) -> [DEPOSER_DEMANDE]",
        "DEPOSER_DEMANDE                                      (confidentielle, en instruction         ) -> [FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE                         (confidentielle, en instruction         ) -> [OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES                            (confidentielle, en instruction         ) -> [OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS                     (confidentielle, en instruction         ) -> [OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                                   (confidentielle, en instruction         ) -> [OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC                       (publique      , en instruction         ) -> [RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE              (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF                    (publique      , accepté et publié      ) -> [FAIRE_ABROGATION,NOTIFIER_DEMANDEUR]",
        "FAIRE_ABROGATION                                     (publique      , accepté et publié      ) -> [NOTIFIER_DEMANDEUR,PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS (publique      , rejeté après abrogation) -> [NOTIFIER_DEMANDEUR]",
      ]
    `)
  })

  // FIXMACHINE tester que la participation du public peut-être optionnelle
  // FIXMACHINE migrer l'enquête publique sur master
})
