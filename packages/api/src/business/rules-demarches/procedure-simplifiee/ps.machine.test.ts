import { setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { describe, expect, test } from 'vitest'
import { ProcedureSimplifieeMachine } from './ps.machine'

const etapesProdProceduresHistoriques = require('../pxg-arg-cxr-inr-prr-pxr-cxf-prf-pxf-arc-apc-pcc/1717-01-09-amo-ces-con-dec-dep-exp-exs-fus-mut-oct-pr1-pr2-pre-pro-prr-rec-rep-res-ret-vct-vut.cas.json') // eslint-disable-line
const psMachine = new ProcedureSimplifieeMachine()

describe('vérifie l’arbre des procédures historiques et simplifiées', () => {
  test('statut de la démarche simplifiee sans étape', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2024-10-10', [])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE]",
      ]
    `)
  })
  test('statut de la démarche historique sans étape', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', [])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
      ]
    `)
  })
  test('statut de la démarche incomplète sans étape', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '1999-04-14', [])
    expect(tree).toMatchInlineSnapshot(`
       [
         "RIEN (confidentielle, en construction        ) -> [FAIRE_DEMANDE,PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE,SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE]",
       ]
     `)
  })

  test('peut faire une démarche historique incomplète', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '1999-04-14', [ETES.informationsHistoriquesIncompletes.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                     (confidentielle, en construction        ) -> [FAIRE_DEMANDE,PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE,SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE]",
        "SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE (confidentielle, accepté                ) -> []",
      ]
    `)
  })

  test('peut publier une démarche historique incomplète', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '1999-04-14', [ETES.publicationDeDecisionAuJORF.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE,PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE,SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
      ]
    `)
  })

  test('peut déposer une demande', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE       (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "ENREGISTRER_DEMANDE (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
      ]
    `)
  })

  test('ne peut pas faire deux dépôts de la demande', () => {
    const etapes = [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT, ETES.enregistrementDeLaDemande.FAIT]
    expect(() => setDateAndOrderAndInterpretMachine(psMachine, '2022-04-12', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"men","etapeStatutId":"fai","date":"2022-04-15"}' after '["mfr_fai","men_fai"]'. The event {"type":"ENREGISTRER_DEMANDE","date":"2022-04-15","status":"fai"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE']`
    )
  })

  test('peut faire une ouverture de la participation du public', () => {
    const etapes = [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT, ETES.participationDuPublic.EN_COURS]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-16', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                           (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE                  (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "ENREGISTRER_DEMANDE            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
      ]
    `)
  })

  test("tant que l'ouverture du public n'est pas en cours, la demarche est confidentielle", () => {
    const etapes = [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT, ETES.participationDuPublic.PROGRAMME]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-16', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                           (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE                  (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "ENREGISTRER_DEMANDE            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
      ]
    `)
  })

  test("peut rendre une décision d'administration acceptée", () => {
    const etapes = [ETES.decisionDeLAutoriteAdministrative.ACCEPTE]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-15', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                    (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
      ]
    `)
  })

  test('peut rendre une décision acceptée au recueil des actes administratifs', () => {
    const etapes = [ETES.demande.FAIT, ETES.decisionDeLAutoriteAdministrative.ACCEPTE, ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                 (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE                                        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE              (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
      ]
    `)
  })

  test('peut classer la demande sans suite', () => {
    const etapes = [ETES.demande.FAIT, ETES.classementSansSuite.FAIT]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN               (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "CLASSER_SANS_SUITE (confidentielle, classé sans suite      ) -> []",
      ]
    `)
  })

  test('peut classer la demande sans suite après une ouverture de la participation du publique', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-15', [ETES.demande.FAIT, ETES.participationDuPublic.EN_COURS, ETES.classementSansSuite.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                           (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE                  (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "CLASSER_SANS_SUITE             (publique      , classé sans suite      ) -> []",
      ]
    `)
  })

  test('peut faire un désistement par le demandeur', () => {
    const etapes = [ETES.demande.FAIT, ETES.desistementDuDemandeur.FAIT]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                      (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE             (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "DESISTER_PAR_LE_DEMANDEUR (confidentielle, désisté                ) -> []",
      ]
    `)
  })

  test("peut faire une décision de l'autorité administrative avant le 1er juillet 2024 qui termine la machine", () => {
    const etapes = [ETES.decisionDeLAutoriteAdministrative.ACCEPTE, ETES.publicationDeDecisionAuJORF.FAIT]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                    (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF       (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
      ]
    `)
  })

  test("peut faire une décision de l'autorité administrative après le 1er juillet 2024", () => {
    const etapes = [ETES.decisionDeLAutoriteAdministrative.ACCEPTE]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2024-07-14', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                    (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
      ]
    `)
  })

  test('peut faire un avis des collectivités', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-15', [
      ETES.demande.FAIT,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.decisionDeLAutoriteAdministrative.ACCEPTE,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                    (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE                           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_AVIS_COLLECTIVITES               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_PREFET,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_PREFET                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
      ]
    `)
  })

  test('peut faire un avis des collectivités', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-15', [
      ETES.demande.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.decisionDeLAutoriteAdministrative.ACCEPTE,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                    (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE                           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
      ]
    `)
  })

  test('peut faire un desistement par le demandeur après une ouverture de la participation du publique', () => {
    const etapes = [ETES.demande.FAIT, ETES.participationDuPublic.TERMINE, ETES.desistementDuDemandeur.FAIT]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                           (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE                  (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "DESISTER_PAR_LE_DEMANDEUR      (publique      , désisté                ) -> []",
      ]
    `)
  })

  test("peut rejeter une décision de l'administration puis un publication au JORF", () => {
    const etapes = [ETES.decisionDeLAutoriteAdministrative.REJETE, ETES.publicationDeDecisionAuJORF.FAIT]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                   (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_REJETEE (confidentielle, rejeté                 ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF      (confidentielle, rejeté                 ) -> []",
      ]
    `)
  })

  test("peut faire une demande d'information", () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-16', [ETES.demande.FAIT, ETES.demandeDinformations.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                 (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "DEMANDER_INFORMATION (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
      ]
    `)
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
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-01', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                           (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE                  (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "DEMANDER_INFORMATION           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RECEVOIR_INFORMATION           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "DEMANDER_INFORMATION           (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RECEVOIR_INFORMATION           (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
      ]
    `)
  })

  test('peut faire la démarche la plus complète possible', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', [
      ETES.demande.FAIT,
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.participationDuPublic.TERMINE,
      ETES.decisionDeLAutoriteAdministrative.ACCEPTE,
      ETES.publicationDeDecisionAuJORF.FAIT,
      ETES.abrogationDeLaDecision.FAIT,
      ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                 (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE                                        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "ENREGISTRER_DEMANDE                                  (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC                       (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE              (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF                    (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
        "FAIRE_ABROGATION                                     (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS (publique      , rejeté après abrogation) -> []",
      ]
    `)
  })

  test('peut abroger et publier', () => {
    const etapes = [ETES.decisionDeLAutoriteAdministrative.ACCEPTE, ETES.publicationDeDecisionAuJORF.FAIT, ETES.abrogationDeLaDecision.FAIT, ETES.publicationDeDecisionAuJORF.FAIT]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-18', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                    (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF       (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
        "FAIRE_ABROGATION                        (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF       (publique      , rejeté après abrogation) -> []",
      ]
    `)
  })

  test("peut rejeter un décision de l'administration", () => {
    const etapes = [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT, ETES.participationDuPublic.TERMINE, ETES.decisionDeLAutoriteAdministrative.REJETE]
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-14', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                   (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "FAIRE_DEMANDE                          (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "ENREGISTRER_DEMANDE                    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC         (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_REJETEE (confidentielle, rejeté                 ) -> []",
      ]
    `)
  })

  test("peut rejeter immédiatement une décision de l'administration", () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-08', [ETES.decisionDeLAutoriteAdministrative.REJETE])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                   (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_REJETEE (confidentielle, rejeté                 ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF]",
      ]
    `)
  })

  test("peut rejeter par décision implicite une décision de l'administration", () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '2022-04-08', [ETES.decisionDeLAutoriteAdministrative.REJETE_DECISION_IMPLICITE])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                      (confidentielle, en construction        ) -> [FAIRE_DEMANDE,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE (publique      , rejeté                 ) -> []",
      ]
    `)
  })

  test('peut publier au JORF sur les démarches très historiques', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psMachine, '1999-01-01', [ETES.publicationDeDecisionAuJORF.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE,PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE,SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
      ]
    `)
  })
  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProdProceduresHistoriques as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    psMachine.interpretMachine(demarche.etapes)
    expect(psMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
