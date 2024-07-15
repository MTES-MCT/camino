import { interpretMachine, orderAndInterpretMachine, setDateAndOrderAndInterpretMachine } from '../machine-test-helper.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { ProcedureSimplifieeMachine } from './ps.machine.js'

const etapesProdProceduresHistoriques = require('../pxg/1717-01-09-amo-ces-con-dec-dep-exp-exs-fus-mut-oct-pr1-pr2-pre-pro-prr-ren-res-ret-vct-vut.cas.json')
const psMachine = new ProcedureSimplifieeMachine()

describe('vérifie l’arbre des procédures historiques et simplifiées', () => {
  test('statut de la démarche simplifiee sans étape', () => {
    const service = orderAndInterpretMachine(psMachine, [])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2024-10-10') }, ['FAIRE_DEMANDE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnConstruction)
  })
  test('statut de la démarche historique sans étape', () => {
    const service = orderAndInterpretMachine(psMachine, [])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-14') }, [
      'FAIRE_DEMANDE',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnConstruction)
  })
  test('peut créer une "mfr"', () => {
    const etapes = [ETES.demande.FAIT]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DEPOSER_DEMANDE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('peut déposer une demande', () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('ne peut pas faire deux dépôts de la demande', () => {
    const etapes = [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.depotDeLaDemande.FAIT]
    expect(() => setDateAndOrderAndInterpretMachine(psMachine, '2022-04-12', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mdp","etapeStatutId":"fai","date":"2022-04-15"}' after '["mfr_fai","mdp_fai"]'. The event {"type":"DEPOSER_DEMANDE"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE']`
    )
  })

  test('peut faire une ouverture de la participation du public', () => {
    const etapes = [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.participationDuPublic.EN_COURS]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-16', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['CLASSER_SANS_SUITE', 'DESISTER_PAR_LE_DEMANDEUR', 'DEMANDER_INFORMATION', 'RENDRE_DECISION_ADMINISTRATION_REJETEE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("tant que l'ouverture du public n'est pas en cours, la demarche est confidentielle", () => {
    const etapes = [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.participationDuPublic.PROGRAMME]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-16', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['CLASSER_SANS_SUITE', 'DESISTER_PAR_LE_DEMANDEUR', 'DEMANDER_INFORMATION', 'RENDRE_DECISION_ADMINISTRATION_REJETEE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test("peut rendre une décision d'administration acceptée", () => {
    const etapes = [ETES.decisionDeLadministration.ACCEPTE]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-15', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['PUBLIER_DECISION_ACCEPTEE_AU_JORF', 'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut rendre une décision acceptée au recueil des actes administratifs', () => {
    const etapes = [ETES.demande.FAIT, ETES.decisionDeLadministration.ACCEPTE, ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['FAIRE_ABROGATION'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.AccepteEtPublie)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut classer la demande sans suite', () => {
    const etapes = [ETES.demande.FAIT, ETES.classementSansSuite.FAIT]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.ClasseSansSuite)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test('peut classer la demande sans suite après une ouverture de la participation du publique', () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-15', [ETES.demande.FAIT, ETES.participationDuPublic.EN_COURS, ETES.classementSansSuite.FAIT])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.ClasseSansSuite)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut faire un désistement par le demandeur', () => {
    const etapes = [ETES.demande.FAIT, ETES.desistementDuDemandeur.FAIT]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Desiste)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test('peut faire un desistement par le demandeur après une ouverture de la participation du publique', () => {
    const etapes = [ETES.demande.FAIT, ETES.participationDuPublic.TERMINE, ETES.desistementDuDemandeur.FAIT]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Desiste)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("peut faire une demande d'information", () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-16', [ETES.demande.FAIT, ETES.demandeDinformations.FAIT])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [
      'CLASSER_SANS_SUITE',
      'DEPOSER_DEMANDE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RECEVOIR_INFORMATION',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
    ])
  })
  test("peut faire deux demandes d'information consécutives", () => {
    const etapes = [
      ETES.demande.FAIT,
      ETES.demandeDinformations.FAIT,
      ETES.receptionDinformation.FAIT,
      ETES.participationDuPublic.TERMINE,
      ETES.demandeDinformations.FAIT,
      ETES.receptionDinformation.FAIT,
    ]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-01', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'DESISTER_PAR_LE_DEMANDEUR',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
    ])
  })

  test('peut faire la démarche la plus complète possible', () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', [
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.participationDuPublic.TERMINE,
      ETES.decisionDeLadministration.ACCEPTE,
      ETES.publicationDeDecisionAuJORF.FAIT,
      ETES.abrogationDeLaDecision.FAIT,
      ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
    ])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.RejeteApresAbrogation)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut abroger et publier', () => {
    const etapes = [ETES.decisionDeLadministration.ACCEPTE, ETES.publicationDeDecisionAuJORF.FAIT, ETES.abrogationDeLaDecision.FAIT, ETES.publicationDeDecisionAuJORF.FAIT]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-18', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.RejeteApresAbrogation)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("peut rejeter un décision de l'administration", () => {
    const etapes = [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.participationDuPublic.EN_COURS, ETES.decisionDeLadministration.REJETE]
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Rejete)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test("peut rejeter immédiatement un décision de l'administration", () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-08', [ETES.decisionDeLadministration.REJETE])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Rejete)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })
  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProdProceduresHistoriques as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    interpretMachine(psMachine, demarche.etapes)
    expect(psMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
