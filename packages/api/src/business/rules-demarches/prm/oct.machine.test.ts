import { setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { PrmOctMachine } from './oct.machine'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { describe, expect, test } from 'vitest'
import { PAYS_IDS } from 'camino-common/src/static/pays'
import { km2Validator } from 'camino-common/src/number'
const etapesProd = require('./2019-10-31-oct.cas.json') // eslint-disable-line

describe('vérifie l’arbre d’octroi de PRM', () => {
  const prmOctMachine = new PrmOctMachine()
  test('peut créer une demande d’octroi de PRM complète en Métropole', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-07-01', [
      ETES.demande.FAIT,
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      { ...ETES.rapportEtAvisDeLaDREAL.FAVORABLE, addDays: 31 },
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.saisineDuConseilGeneralDeLeconomie_CGE_.FAIT,
      ETES.rapportDuConseilGeneralDeLeconomie_CGE_.FAVORABLE,
      ETES.avisDuConseilGeneralDeLeconomie_CGE_.FAVORABLE,
      ETES.saisineDeLautoriteSignataire.FAIT,
      ETES.decisionDeLAutoriteAdministrative.ACCEPTE,
      ETES.publicationDeDecisionAuJORF.ACCEPTE,
      ETES.notificationDesCollectivitesLocales.FAIT,
      ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
      ETES.publicationDansUnJournalLocalOuNational.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.notificationAuPrefet.FAIT,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_PREFET,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_SAISINE_PREFET                              (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE              (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF]",
        "RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF        (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "RENDRE_RAPPORT_DREAL                              (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATIONS,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATIONS]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CONSEIL_GENERAL_CHARGE_DES_MINES,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_SAISINE_CONSEIL_GENERAL_CHARGE_DES_MINES    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RAPPORT_CONSEIL_GENERAL_CHARGE_DES_MINES,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_RAPPORT_CONSEIL_GENERAL_CHARGE_DES_MINES    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_CONSEIL_GENERAL_CHARGE_DES_MINES]",
        "RENDRE_AVIS_CONSEIL_GENERAL_CHARGE_DES_MINES      (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_AUTORITE_SIGNATAIRE,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_SAISINE_AUTORITE_SIGNATAIRE                 (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_DECISION_ADMINISTRATION_ACCEPTE,RENDRE_DECISION_ADMINISTRATION_REJETE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTE            (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_PUBLICATION_AU_JORF,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_PUBLICATION_AU_JORF                         (publique      , accepté                ) -> [NOTIFIER_COLLECTIVITES_LOCALES,NOTIFIER_DEMANDEUR,NOTIFIER_PREFET,PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL,PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS]",
        "NOTIFIER_COLLECTIVITES_LOCALES                    (publique      , accepté                ) -> [NOTIFIER_DEMANDEUR,NOTIFIER_PREFET,PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL,PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS    (publique      , accepté                ) -> [NOTIFIER_DEMANDEUR,NOTIFIER_PREFET,PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL]",
        "PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL         (publique      , accepté                ) -> [NOTIFIER_DEMANDEUR,NOTIFIER_PREFET]",
        "NOTIFIER_DEMANDEUR                                (publique      , accepté                ) -> [NOTIFIER_PREFET]",
        "NOTIFIER_PREFET                                   (publique      , accepté                ) -> []",
      ]
    `)
  })

  test('peut classer sans suite une demande déposée, qui reste confidentielle', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-07-01', [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT, ETES.saisineDuPrefet.FAIT, ETES.classementSansSuite.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                 (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE        (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE  (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_PREFET,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_SAISINE_PREFET (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "CLASSER_SANS_SUITE   (confidentielle, classé sans suite      ) -> []",
      ]
    `)
  })

  test('peut créer une demande d’octroi de PRM en Guyane', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['Département de la Guyane'], surface: km2Validator.parse(200) },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      { ...ETES.participationDuPublic.TERMINE, addDays: 31 },
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDesCollectivites.FAIT,
      { ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE, addDays: 31 },
      ETES.rapportEtAvisDeLaDREAL.FAVORABLE,
      ETES.avisDuPrefet.FAVORABLE,
    ]
    const { tree } = setDateAndOrderAndInterpretMachine(prmOctMachine, '2020-04-14', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_PREFET,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_SAISINE_PREFET                              (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE              (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF]",
        "RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF        (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_DES_COLLECTIVITES,RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_DES_COLLECTIVITES,RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_DES_COLLECTIVITES]",
        "RENDRE_AVIS_DES_COLLECTIVITES                     (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "RENDRE_AVIS_CDM                                   (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_RAPPORT_DREAL]",
        "RENDRE_RAPPORT_DREAL                              (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CONSEIL_GENERAL_CHARGE_DES_MINES,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
      ]
    `)
  })

  test('peut créer une demande d’octroi de PRM en Guyane sans avis du maire', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['Département de la Guyane'], surface: km2Validator.parse(14) },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
      ETES.receptionDeComplements_RecevabiliteDeLaDemande_.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      { ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE, addDays: 31 },
      ETES.rapportEtAvisDeLaDREAL.FAVORABLE,
      ETES.avisDuPrefet.FAVORABLE,
    ]

    const { tree } = setDateAndOrderAndInterpretMachine(prmOctMachine, '2023-09-05', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_PREFET,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_SAISINE_PREFET                              (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "DEMANDER_COMPLEMENTS_POUR_RECEVABILITE            (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,MODIFIER_DEMANDE,RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE,RECEVOIR_INFORMATIONS]",
        "RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE            (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE              (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATIONS,RENDRE_AVIS_DES_COLLECTIVITES,RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATIONS,RENDRE_AVIS_DES_COLLECTIVITES]",
        "RENDRE_AVIS_CDM                                   (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATIONS,RENDRE_RAPPORT_DREAL]",
        "RENDRE_RAPPORT_DREAL                              (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATIONS,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,OUVRIR_PARTICIPATION_DU_PUBLIC,RECEVOIR_INFORMATIONS]",
      ]
    `)
  })

  test('peut créer une demande d’octroi de PRM en Outre mer (hors Guyane)', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['Wallis-et-Futuna'] },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      { ...ETES.participationDuPublic.TERMINE, addDays: 31 },
      ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE,
      ETES.rapportEtAvisDeLaDREAL.FAVORABLE,
      ETES.avisDuPrefet.FAVORABLE,
    ]
    const { tree } = setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-06-08', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_PREFET,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_SAISINE_PREFET                              (confidentielle, déposé                 ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE              (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF]",
        "RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF        (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_CDM]",
        "RENDRE_AVIS_CDM                                   (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_RAPPORT_DREAL]",
        "RENDRE_RAPPORT_DREAL                              (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CONSEIL_GENERAL_CHARGE_DES_MINES,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS]",
      ]
    `)
  })

  test('ne peut pas faire l’avis de la DREAL si la saisine des services a été faite dans les 30 jours', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['République Française'] },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.rapportEtAvisDeLaDREAL.FAVORABLE,
    ]
    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-04-13', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"apd","etapeStatutId":"fav","date":"2022-04-20"}' after '["mfr_fai","men_fai","spp_fai","mcr_fav","anf_ter","asc_fai"]'. The event {"type":"RENDRE_RAPPORT_DREAL","date":"2022-04-20","status":"fav"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS']`
    )
  })

  test('ne peut pas faire 2 avis des services et commissions consultatives', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['République Française'] },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
    ]
    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-04-12', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"asc","etapeStatutId":"fai","date":"2022-04-19"}' after '["mfr_fai","men_fai","spp_fai","mcr_fav","anf_ter","asc_fai"]'. The event {"type":"RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES","date":"2022-04-19","status":"fai"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS']`
    )
  })

  test('ne peut pas ouvrir la participation du public si la mise en concurrence n’est pas terminée', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['République Française'] },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      ETES.participationDuPublic.PROGRAMME,
    ]
    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-04-13', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"ppu","etapeStatutId":"pro","date":"2022-04-19"}' after '["mfr_fai","men_fai","spp_fai","mcr_fav","anf_ter"]'. The event {"type":"OUVRIR_PARTICIPATION_DU_PUBLIC","date":"2022-04-19","status":"pro"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATIONS,DEPOSER_DEMANDE_CONCURRENTE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_INFORMATIONS,RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES']`
    )
  })

  test('ne peut pas créer une "rpu" après une "dex" rejetée', () => {
    const etapes = [
      { ...ETES.demande.FAIT, paysId: PAYS_IDS['République Française'] },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      { ...ETES.participationDuPublic.TERMINE, addDays: 31 },
      ETES.rapportEtAvisDeLaDREAL.FAVORABLE,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.saisineDuConseilGeneralDeLeconomie_CGE_.FAIT,
      ETES.rapportDuConseilGeneralDeLeconomie_CGE_.FAVORABLE,
      ETES.avisDuConseilGeneralDeLeconomie_CGE_.FAVORABLE,
      ETES.saisineDeLautoriteSignataire.FAIT,
      ETES.decisionDeLAutoriteAdministrative.REJETE,
      ETES.notificationAuPrefet.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
    ]

    expect(() => setDateAndOrderAndInterpretMachine(prmOctMachine, '2022-04-13', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"rpu","etapeStatutId":"fai","date":"2022-05-30"}' after '["mfr_fai","men_fai","spp_fai","mcr_fav","anf_ter","asc_fai","ppu_ter","apd_fav","app_fav","scg_fai","rcg_fav","acg_fav","sas_fai","dex_rej","npp_fai","mno_fai"]'. The event {"type":"PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS","date":"2022-05-30","status":"fai"} should be one of 'RENDRE_DECISION_ABROGATION,RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF']`
    )
  })

  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    prmOctMachine.interpretMachine(demarche.etapes)
    expect(prmOctMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
