import { orderAndInterpretMachine } from '../machine-test-helper.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { ProcedureHistoriqueMachine, ProcedureSimplifieeMachine } from './ps.machine.js'

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
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-14') }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DEPOSER_DEMANDE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('peut déposer une demande', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-16') }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('ne peut pas faire deux dépôts de la demande', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    expect(() => orderAndInterpretMachine(psMachine, etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mdp","etapeStatutId":"fai","date":"2022-04-15"}' after '["mfr_fai","mdp_fai"]'. The event {"type":"DEPOSER_DEMANDE"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE']`
    )
  })

  test('peut faire une ouverture de la participation du public', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-16') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-18') }, [
      'CLASSER_SANS_SUITE',
      'CLOTURER_PARTICIPATION_DU_PUBLIC',
      'DESISTER_PAR_LE_DEMANDEUR',
      'DEMANDER_INFORMATION',
    ])
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
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-18') }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DESISTER_PAR_LE_DEMANDEUR',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
    ])
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

  test('peut classer la demande sans suite', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.classementSansSuite.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.ClasseSansSuite)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test('peut classer la demande sans suite après une ouverture de la participation du publique', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-04-16') },
      { ...ETES.classementSansSuite.FAIT, date: toCaminoDate('2022-04-17') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.ClasseSansSuite)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut faire un désistement par le demandeur', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.desistementDuDemandeur.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Desiste)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test('peut faire un desistement par le demandeur après une ouverture de la participation du publique', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-04-16') },
      { ...ETES.desistementDuDemandeur.FAIT, date: toCaminoDate('2022-04-17') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Desiste)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("peut faire une demande d'information", () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.demandeDinformations.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [
      'CLASSER_SANS_SUITE',
      'DEPOSER_DEMANDE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RECEVOIR_INFORMATION',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
    ])
  })
  test("peut faire deux demandes d'information consécutives", () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.demandeDinformations.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.receptionDinformation.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-17') },
      { ...ETES.demandeDinformations.FAIT, date: toCaminoDate('2022-04-18') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-04-19') },
      { ...ETES.receptionDinformation.FAIT, date: toCaminoDate('2022-04-20') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-21') }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DESISTER_PAR_LE_DEMANDEUR',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
    ])
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

describe('vérifie l’arbre des procédures historiques', () => {
  const psMachine = new ProcedureHistoriqueMachine()
  test('statut de la démarche sans étape', () => {
    const service = orderAndInterpretMachine(psMachine, [])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-14') }, ['FAIRE_DEMANDE', 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnConstruction)
  })
  test('peut créer une "mfr"', () => {
    const etapes = [{ ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') }]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-14') }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DEPOSER_DEMANDE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('peut déposer une demande', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-16') }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('ne peut pas faire deux dépôts de la demande', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    expect(() => orderAndInterpretMachine(psMachine, etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mdp","etapeStatutId":"fai","date":"2022-04-15"}' after '["mfr_fai","mdp_fai"]'. The event {"type":"DEPOSER_DEMANDE"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE']`
    )
  })

  test('peut faire une ouverture de la participation du public', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-16') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-18') }, [
      'CLASSER_SANS_SUITE',
      'CLOTURER_PARTICIPATION_DU_PUBLIC',
      'DESISTER_PAR_LE_DEMANDEUR',
      'DEMANDER_INFORMATION',
    ])
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
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-18') }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DESISTER_PAR_LE_DEMANDEUR',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("peut rendre une décision d'administration acceptée", () => {
    const etapes = [{ ...ETES.decisionDeLadministration.ACCEPTE, date: toCaminoDate('2022-04-15') }]
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

  test('peut classer la demande sans suite', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.classementSansSuite.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.ClasseSansSuite)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test('peut classer la demande sans suite après une ouverture de la participation du publique', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-04-16') },
      { ...ETES.classementSansSuite.FAIT, date: toCaminoDate('2022-04-17') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.ClasseSansSuite)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut faire un désistement par le demandeur', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.desistementDuDemandeur.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Desiste)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test('peut faire un desistement par le demandeur après une ouverture de la participation du publique', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-04-16') },
      { ...ETES.desistementDuDemandeur.FAIT, date: toCaminoDate('2022-04-17') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Desiste)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("peut faire une demande d'information", () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.demandeDinformations.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-16') }, [
      'CLASSER_SANS_SUITE',
      'DEPOSER_DEMANDE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RECEVOIR_INFORMATION',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
    ])
  })
  test("peut faire deux demandes d'information consécutives", () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      { ...ETES.demandeDinformations.FAIT, date: toCaminoDate('2022-04-15') },
      { ...ETES.receptionDinformation.FAIT, date: toCaminoDate('2022-04-16') },
      { ...ETES.ouvertureDeLaParticipationDuPublic.FAIT, date: toCaminoDate('2022-04-17') },
      { ...ETES.demandeDinformations.FAIT, date: toCaminoDate('2022-04-18') },
      { ...ETES.clotureDeLaParticipationDuPublic.TERMINE, date: toCaminoDate('2022-04-19') },
      { ...ETES.receptionDinformation.FAIT, date: toCaminoDate('2022-04-20') },
    ]
    const service = orderAndInterpretMachine(psMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2023-04-21') }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DESISTER_PAR_LE_DEMANDEUR',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
    ])
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
