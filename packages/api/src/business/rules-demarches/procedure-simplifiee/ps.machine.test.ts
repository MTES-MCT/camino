import { interpretMachine, orderAndInterpretMachine, setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { toCaminoDate } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { ProcedureSimplifieeMachine } from './ps.machine'

const etapesProdProceduresHistoriques = require('../pxg-arg-cxr-inr-prr-pxr-cxf-prf-pxf/1717-01-09-amo-ces-con-dec-dep-exp-exs-fus-mut-oct-pr1-pr2-pre-pro-prr-ren-res-ret-vct-vut.cas.json') // eslint-disable-line
const psMachine = new ProcedureSimplifieeMachine()

describe('vérifie l’arbre des procédures historiques et simplifiées', async () => {
  test('statut de la démarche simplifiee sans étape', async () => {
    const service = await orderAndInterpretMachine(psMachine, [])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2024-10-10') }, ['FAIRE_DEMANDE'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnConstruction)
  })
  test('statut de la démarche historique sans étape', async () => {
    const service = await orderAndInterpretMachine(psMachine, [])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('2022-04-14') }, [
      'FAIRE_DEMANDE',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnConstruction)
  })
  test('statut de la démarche incomplète sans étape', async () => {
    const service = await orderAndInterpretMachine(psMachine, [])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: toCaminoDate('1999-04-14') }, [
      'FAIRE_DEMANDE',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE',
      'SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE',
      'PUBLIER_DECISION_ACCEPTEE_AU_JORF',
      'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnConstruction)
  })

  test('peut faire une démarche historique incomplète', async () => {
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '1999-04-14', [ETES.informationsHistoriquesIncompletes.FAIT])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test('peut publier une démarche historique incomplète', async () => {
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '1999-04-14', [ETES.publicationDeDecisionAuJORF.FAIT])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['FAIRE_ABROGATION'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.AccepteEtPublie)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut créer une "mfr"', async () => {
    const etapes = [ETES.demande.FAIT]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'RECEVOIR_INFORMATION',
      'DEPOSER_DEMANDE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('peut déposer une demande', async () => {
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'RECEVOIR_INFORMATION',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE',
    ])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
  })

  test('ne peut pas faire deux dépôts de la demande', async () => {
    const etapes = [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.depotDeLaDemande.FAIT]
    await expect(setDateAndOrderAndInterpretMachine(psMachine, '2022-04-12', etapes)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mdp","etapeStatutId":"fai","date":"2022-04-15"}' after '["mfr_fai","mdp_fai"]'. The event {"type":"DEPOSER_DEMANDE","date":"2022-04-15","status":"fai"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE']`
    )
  })

  test('peut faire une ouverture de la participation du public', async () => {
    const etapes = [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.participationDuPublic.EN_COURS]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-16', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['CLASSER_SANS_SUITE', 'DESISTER_PAR_LE_DEMANDEUR', 'DEMANDER_INFORMATION', 'RECEVOIR_INFORMATION'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("tant que l'ouverture du public n'est pas en cours, la demarche est confidentielle", async () => {
    const etapes = [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.participationDuPublic.PROGRAMME]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-16', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['CLASSER_SANS_SUITE', 'DESISTER_PAR_LE_DEMANDEUR', 'DEMANDER_INFORMATION', 'RECEVOIR_INFORMATION'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.EnInstruction)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test("peut rendre une décision d'administration acceptée", async () => {
    const etapes = [ETES.decisionDeLadministration.ACCEPTE]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-15', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['PUBLIER_DECISION_ACCEPTEE_AU_JORF', 'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Accepte)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut rendre une décision acceptée au recueil des actes administratifs', async () => {
    const etapes = [ETES.demande.FAIT, ETES.decisionDeLadministration.ACCEPTE, ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['FAIRE_ABROGATION'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.AccepteEtPublie)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut classer la demande sans suite', async () => {
    const etapes = [ETES.demande.FAIT, ETES.classementSansSuite.FAIT]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.ClasseSansSuite)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test('peut classer la demande sans suite après une ouverture de la participation du publique', async () => {
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-15', [ETES.demande.FAIT, ETES.participationDuPublic.EN_COURS, ETES.classementSansSuite.FAIT])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.ClasseSansSuite)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut faire un désistement par le demandeur', async () => {
    const etapes = [ETES.demande.FAIT, ETES.desistementDuDemandeur.FAIT]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Desiste)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test('peut faire un desistement par le demandeur après une ouverture de la participation du publique', async () => {
    const etapes = [ETES.demande.FAIT, ETES.participationDuPublic.TERMINE, ETES.desistementDuDemandeur.FAIT]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Desiste)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("peut rejeter une décision de l'administration puis un publication au JORF", async () => {
    const etapes = [ETES.decisionDeLadministration.REJETE, ETES.publicationDeDecisionAuJORF.FAIT]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Rejete)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test("peut faire une demande d'information", async () => {
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-16', [ETES.demande.FAIT, ETES.demandeDinformations.FAIT])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [
      'CLASSER_SANS_SUITE',
      'DEPOSER_DEMANDE',
      'DESISTER_PAR_LE_DEMANDEUR',
      'OUVRIR_PARTICIPATION_DU_PUBLIC',
      'DEMANDER_INFORMATION',
      'RECEVOIR_INFORMATION',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE',
    ])
  })
  test("peut faire deux demandes d'information consécutives", async () => {
    const etapes = [
      ETES.demande.FAIT,
      ETES.demandeDinformations.FAIT,
      ETES.receptionDinformation.FAIT,
      ETES.participationDuPublic.TERMINE,
      ETES.demandeDinformations.FAIT,
      ETES.receptionDinformation.FAIT,
    ]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-01', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [
      'CLASSER_SANS_SUITE',
      'DEMANDER_INFORMATION',
      'RECEVOIR_INFORMATION',
      'DESISTER_PAR_LE_DEMANDEUR',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE',
      'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE',
    ])
  })

  test('peut faire la démarche la plus complète possible', async () => {
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', [
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

  test('peut abroger et publier', async () => {
    const etapes = [ETES.decisionDeLadministration.ACCEPTE, ETES.publicationDeDecisionAuJORF.FAIT, ETES.abrogationDeLaDecision.FAIT, ETES.publicationDeDecisionAuJORF.FAIT]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-18', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.RejeteApresAbrogation)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test("peut rejeter un décision de l'administration", async () => {
    const etapes = [ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT, ETES.participationDuPublic.TERMINE, ETES.decisionDeLadministration.REJETE]
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Rejete)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test("peut rejeter immédiatement une décision de l'administration", async () => {
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-08', [ETES.decisionDeLadministration.REJETE])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['PUBLIER_DECISION_ACCEPTEE_AU_JORF'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Rejete)
    expect(service.getSnapshot().context.visibilite).toBe('confidentielle')
  })

  test("peut rejeter par décision implicite une décision de l'administration", async () => {
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '2022-04-08', [ETES.decisionDeLadministration.REJETE_DECISION_IMPLICITE])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, [])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.Rejete)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })

  test('peut publier au JORF sur les démarches très historiques', async () => {
    const { service, dateFin } = await setDateAndOrderAndInterpretMachine(psMachine, '1999-01-01', [ETES.publicationDeDecisionAuJORF.FAIT])
    expect(service).canOnlyTransitionTo({ machine: psMachine, date: dateFin }, ['FAIRE_ABROGATION'])
    expect(service.getSnapshot().context.demarcheStatut).toBe(DemarchesStatutsIds.AccepteEtPublie)
    expect(service.getSnapshot().context.visibilite).toBe('publique')
  })
  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProdProceduresHistoriques as any[])('cas réel N°$id', async demarche => {
    // ici les étapes sont déjà ordonnées
    await interpretMachine(psMachine, demarche.etapes)
    await expect(psMachine.demarcheStatut(demarche.etapes)).resolves.toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
