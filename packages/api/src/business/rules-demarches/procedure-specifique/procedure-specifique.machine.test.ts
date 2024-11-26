import { setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { describe, expect, test } from 'vitest'
import { ProcedureSpecifiqueMachine } from './procedure-specifique.machine'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { hectareToKm2, hectareValidator } from 'camino-common/src/number'
import { machineFind } from '../machines'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'
const etapesProdSpecifiqueArmAxm = require('../arm-axm/2024-07-01-oct-pro-pr1-pr2-pre-exp-exs-prr.cas.json') // eslint-disable-line
const psPccOctMachine = new ProcedureSpecifiqueMachine('pcc', 'oct')
const psCxmOctMachine = new ProcedureSpecifiqueMachine('cxm', 'oct')
const psPrmProMachine = new ProcedureSpecifiqueMachine('prm', 'pro')
const psArmProMachine = new ProcedureSpecifiqueMachine('arm', 'pro')
const psAxmProMachine = new ProcedureSpecifiqueMachine('axm', 'pro')
const psCxwOctMachine = new ProcedureSpecifiqueMachine('cxw', 'oct')

describe('vérifie l’arbre des procédures spécifique', () => {
  test('statut de la démarche simplifiee sans étape', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psPccOctMachine, '2024-10-10', [])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
      ]
    `)
  })

  test('demande irrecevable', async () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psPccOctMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        paysId: 'FR',
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.DEFAVORABLE,
      ETES.demandeDeComplements.FAIT,
      ETES.receptionDeComplements.FAIT,
      ETES.declarationDIrrecevabilite.FAIT,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                             (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_DEFAVORABLE   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DEMANDE_DE_COMPLEMENTS]",
        "FAIRE_DEMANDE_DE_COMPLEMENTS     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DECLARATION_IRRECEVABILITE,RECEVOIR_COMPLEMENTS]",
        "RECEVOIR_COMPLEMENTS             (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DECLARATION_IRRECEVABILITE,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_DECLARATION_IRRECEVABILITE (confidentielle, rejeté                 ) -> []",
      ]
    `)
  })
  test('après une recevabilité favorable pour un PER ou une concession on doit pouvoir faire une notification au demandeur et aussi mise en concurrence et consentement', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      { ...ETES.demande.FAIT, consentement: 'à faire', concurrence: { amIFirst: true }, paysId: 'FR', hasTitreFrom: false, surface: hectareToKm2(hectareValidator.parse(10)) },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.notificationAuDemandeur.FAIT,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DEMANDE_DE_CONSENTEMENT,FAIRE_MISE_EN_CONCURRENCE,NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DEMANDE_DE_CONSENTEMENT,FAIRE_MISE_EN_CONCURRENCE]",
      ]
    `)
  })

  test('on peut notifier le demandeur apres une recevabilité favorable pour une concession suite à un PER ', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      { ...ETES.demande.FAIT, consentement: 'non-applicable', concurrence: { amIFirst: true }, paysId: 'FR', hasTitreFrom: true, surface: hectareToKm2(hectareValidator.parse(10)) },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.notificationAuDemandeur.FAIT,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_CGE_IGEDD]",
      ]
    `)
  })
  test('on ne peut plus rien faire pendant que la mise en concurrence est en cours', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      { ...ETES.demande.FAIT, consentement: 'non-applicable', concurrence: { amIFirst: true }, paysId: 'FR', hasTitreFrom: false, surface: hectareToKm2(hectareValidator.parse(10)) },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
      ETES.avisDeMiseEnConcurrenceAuJORF.EN_COURS,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE,NOTIFIER_DEMANDEUR]",
        "FAIRE_MISE_EN_CONCURRENCE                         (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR]",
      ]
    `)
  })
  test('on peut publier le résultat de la mise en concurrence, une fois celle-ci terminée', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      { ...ETES.demande.FAIT, consentement: 'non-applicable', concurrence: { amIFirst: true }, paysId: 'FR', hasTitreFrom: false, surface: hectareToKm2(hectareValidator.parse(10)) },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      ETES.resultatMiseEnConcurrence.ACCEPTE,
      ETES.avisDuConseilGeneralDeLeconomie_CGE_.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.saisineDuPrefet.FAIT,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE,NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE]",
        "FAIRE_MISE_EN_CONCURRENCE                         (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE]",
        "RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE      (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_CGE_IGEDD]",
        "RENDRE_AVIS_CGE_IGEDD                             (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DEMANDE_MODIFICATION_AES,NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_LETTRE_SAISINE_PREFET,RECEVOIR_REPONSE_DEMANDEUR]",
        "FAIRE_LETTRE_SAISINE_PREFET                       (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
      ]
    `)
  })
  test('on peut programmer une mise en concurrence', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      { ...ETES.demande.FAIT, consentement: 'non-applicable', concurrence: { amIFirst: true }, paysId: 'FR', hasTitreFrom: false, surface: hectareToKm2(hectareValidator.parse(10)) },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
      ETES.avisDeMiseEnConcurrenceAuJORF.PROGRAMME,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE,NOTIFIER_DEMANDEUR]",
        "FAIRE_MISE_EN_CONCURRENCE                         (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR]",
      ]
    `)
  })

  test('on peut rejeter à la fin de la mise en concurrence', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      { ...ETES.demande.FAIT, consentement: 'non-applicable', concurrence: { amIFirst: true }, paysId: 'FR', hasTitreFrom: false, surface: hectareToKm2(hectareValidator.parse(10)) },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      ETES.resultatMiseEnConcurrence.REJETE,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE,NOTIFIER_DEMANDEUR]",
        "FAIRE_MISE_EN_CONCURRENCE                         (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE]",
        "RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE       (publique      , rejeté                 ) -> []",
      ]
    `)
  })
  test('on ne peut pas notifier le demandeur apres une recevabilité favorable pour pcc', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(psPccOctMachine, '1999-04-14', [
        {
          ...ETES.demande.FAIT,
          consentement: 'non-applicable',
          concurrence: { amIFirst: true },
          paysId: 'FR',
          hasTitreFrom: false,
          surface: hectareToKm2(hectareValidator.parse(10)),
        },
        ETES.enregistrementDeLaDemande.FAIT,
        ETES.recevabiliteDeLaDemande.FAVORABLE,
        ETES.notificationAuDemandeur.FAIT,
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mno","etapeStatutId":"fai","date":"1999-04-18"}' after '["mfr_fai","men_fai","mcr_fav"]'. The event {"type":"NOTIFIER_DEMANDEUR","date":"1999-04-18","status":"fai"} should be one of 'CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE']`
    )
  })
  test("après la recevabilité favorable la démarche reste confidentielle si il n'y a pas de mise en concurrence", () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psPrmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR]",
      ]
    `)
  })
  test('après la recevabilité favorable la démarche reste confidentielle si il y a une mise en concurrence', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      { ...ETES.demande.FAIT, consentement: 'non-applicable', concurrence: { amIFirst: true }, paysId: 'FR', hasTitreFrom: false, surface: hectareToKm2(hectareValidator.parse(10)) },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE,NOTIFIER_DEMANDEUR]",
      ]
    `)
  })

  test('après la recevabilité la démarche devient publique si la démarche concurrente est visible', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: false, demarcheConcurrenteVisibilite: 'publique' },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
    ])
    expect(tree).toMatchInlineSnapshot(`
  [
    "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
    "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
    "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
    "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
    "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE]",
  ]
`)
  })

  test('après la recevabilité la démarche reste confidentielle si la démarche concurrente est confidentielle', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: false, demarcheConcurrenteVisibilite: 'confidentielle' },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE]",
      ]
    `)
  })
  test("ne peut pas rendre la décision de l'administration si la participation du public n'est pas terminée", () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psAxmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.EN_COURS,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                             (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC   (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR]",
      ]
    `)
  })

  test('ne peut pas faire une mise en concurrence si on a un titre from', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: true,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR]",
      ]
    `)
  })

  test("doit faire une mise en concurrence si on n'a pas de titre from", () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psCxmOctMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE,NOTIFIER_DEMANDEUR]",
      ]
    `)
  })
  test("réalise une demande de prolongation d'ARM complète", async () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.decisionDeLAutoriteAdministrative.ACCEPTE,
      ETES.mesuresDePublicite.FAIT,
      ETES.publicationDeDecisionAuJORF.FAIT,
      ETES.notificationAuDemandeur.FAIT,
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                    (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS,RENDRE_MESURES_DE_PUBLICITE]",
        "RENDRE_MESURES_DE_PUBLICITE             (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF       (publique      , accepté et publié      ) -> [NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                      (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
      ]
    `)
  })
  test("réalise une demande de prolongation d'ARM rejetée", () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.decisionDeLAutoriteAdministrative.REJETE,
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                   (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                          (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS       (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_REJETEE (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR]",
      ]
    `)
  })
  test("réalise une demande de prolongation d'ARM rejetée puis une notification au demandeur", () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.decisionDeLAutoriteAdministrative.REJETE,
      ETES.notificationAuDemandeur.FAIT,
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                   (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                          (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS       (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_REJETEE (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                     (confidentielle, rejeté                 ) -> []",
      ]
    `)
  })

  test('Peut classer sans suite', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.classementSansSuite.FAIT,
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                             (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "CLASSER_SANS_SUITE               (confidentielle, classé sans suite      ) -> []",
      ]
    `)
  })

  test('Peut désister par le demandeur', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.desistementDuDemandeur.FAIT,
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                             (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "DESISTER_PAR_LE_DEMANDEUR        (confidentielle, désisté                ) -> []",
      ]
    `)
  })

  test("peut faire plusieurs demande/réception d'information à la suite", () => {
    const result = setDateAndOrderAndInterpretMachine(psAxmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.demandeDinformations.FAIT,
      ETES.receptionDinformation.FAIT,
      ETES.demandeDinformations.FAIT,
    ])

    expect(result.tree).toMatchInlineSnapshot(`
      [
        "RIEN                             (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC   (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "DEMANDER_INFORMATION             (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RECEVOIR_INFORMATION             (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "DEMANDER_INFORMATION             (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RECEVOIR_INFORMATION,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
      ]
    `)
  })
  test("réalise une demande de prolongation d'ARM rejetée suite à une décision implicite", () => {
    const { dateFin, machine, etapes } = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.decisionDeLAutoriteAdministrative.REJETE_DECISION_IMPLICITE,
    ])

    expect(machine.possibleNextEtapes(etapes, dateFin)).toStrictEqual([])
    expect(machine.demarcheStatut(etapes)).toMatchInlineSnapshot(`
      {
        "demarcheStatut": "rej",
        "publique": true,
      }
    `)
  })

  test("réalise une demande de prolongation d'AXM complète", () => {
    const result = setDateAndOrderAndInterpretMachine(psAxmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'à faire',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.demandeDeConsentement.FAIT,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.participationDuPublic.TERMINE,
      ETES.decisionDeLAutoriteAdministrative.ACCEPTE,
      ETES.mesuresDePublicite.FAIT,
      ETES.publicationDeDecisionAuJORF.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.attestationDeConstitutionDeGarantiesFinancieres.FAIT,
    ])

    expect(result.tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                       (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                                        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DEMANDE_DE_CONSENTEMENT]",
        "FAIRE_DEMANDE_DE_CONSENTEMENT                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES                                  (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS                           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                                         (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC]",
        "OUVRIR_PARTICIPATION_DU_PUBLIC                             (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE                    (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS,RENDRE_MESURES_DE_PUBLICITE]",
        "RENDRE_MESURES_DE_PUBLICITE                                (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF                          (publique      , accepté et publié      ) -> [NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                         (publique      , accepté et publié      ) -> [FAIRE_ATTESTATION_DE_CONSTITUTION_DE_GARANTIES_FINANCIERES]",
        "FAIRE_ATTESTATION_DE_CONSTITUTION_DE_GARANTIES_FINANCIERES (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
      ]
    `)
  })

  test('peut faire une enquête publique ou une participation du publique si AXM <= 25 hectares', () => {
    const result = setDateAndOrderAndInterpretMachine(psAxmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'à faire',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.demandeDeConsentement.FAIT,
    ])

    expect(result.tree).toMatchInlineSnapshot(`
      [
        "RIEN                          (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                 (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE  (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DEMANDE_DE_CONSENTEMENT]",
        "FAIRE_DEMANDE_DE_CONSENTEMENT (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,OUVRIR_PARTICIPATION_DU_PUBLIC,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
      ]
    `)
  })

  test('ne peut pas faire une participation du publique si AXM > 25 hectares', () => {
    const result = setDateAndOrderAndInterpretMachine(psAxmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'à faire',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(30)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.demandeDeConsentement.FAIT,
    ])

    expect(result.tree).toMatchInlineSnapshot(`
        [
          "RIEN                          (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
          "FAIRE_DEMANDE                 (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
          "ENREGISTRER_DEMANDE           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
          "FAIRE_RECEVABILITE_FAVORABLE  (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DEMANDE_DE_CONSENTEMENT]",
          "FAIRE_DEMANDE_DE_CONSENTEMENT (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        ]
      `)
  })

  test('réalise une demande de concession granulats marins complète', () => {
    const result = setDateAndOrderAndInterpretMachine(psCxwOctMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.notificationAuDemandeur.FAIT,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      ETES.resultatMiseEnConcurrence.ACCEPTE,
      ETES.avisDuConseilGeneralDeLeconomie_CGE_.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.enquetePublique.TERMINE,
      ETES.consultationDesAdministrationsCentrales.FAIT,
      ETES.decisionDeLAutoriteAdministrative.ACCEPTE,
      ETES.mesuresDePublicite.FAIT,
      ETES.publicationDeDecisionAuJORF.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.abrogationDeLaDecision.FAIT,
      ETES.publicationDeDecisionAuJORF.FAIT,
    ])

    expect(result.tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE,NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE]",
        "FAIRE_MISE_EN_CONCURRENCE                         (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE]",
        "RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE      (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_CGE_IGEDD]",
        "RENDRE_AVIS_CGE_IGEDD                             (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DEMANDE_MODIFICATION_AES,NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_LETTRE_SAISINE_PREFET,RECEVOIR_REPONSE_DEMANDEUR]",
        "FAIRE_LETTRE_SAISINE_PREFET                       (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES                         (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS                  (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE]",
        "OUVRIR_ENQUETE_PUBLIQUE                           (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_CONSULTATION_DES_ADMINISTRATIONS_CENTRALES]",
        "FAIRE_CONSULTATION_DES_ADMINISTRATIONS_CENTRALES  (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE           (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS,RENDRE_MESURES_DE_PUBLICITE]",
        "RENDRE_MESURES_DE_PUBLICITE                       (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF                 (publique      , accepté et publié      ) -> [NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
        "FAIRE_ABROGATION                                  (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF                 (publique      , rejeté après abrogation) -> []",
      ]
    `)
  })

  test('réalise une demande de concession granulats marins en outre mer complète', () => {
    const result = setDateAndOrderAndInterpretMachine(psCxwOctMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'GF',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.informationDuPrefetEtDesCollectivites.FAIT,
      ETES.avisDeMiseEnConcurrenceAuJORF.TERMINE,
      ETES.resultatMiseEnConcurrence.ACCEPTE,
      ETES.notificationAuDemandeur.FAIT,
      ETES.avisDuConseilGeneralDeLeconomie_CGE_.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.saisineDuPrefet.FAIT,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAIT,
      ETES.enquetePublique.TERMINE,
      ETES.consultationDesAdministrationsCentrales.FAIT,
      ETES.decisionDeLAutoriteAdministrative.ACCEPTE,
      ETES.mesuresDePublicite.FAIT,
      ETES.publicationDeDecisionAuJORF.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.abrogationDeLaDecision.FAIT,
      ETES.publicationDeDecisionAuJORF.FAIT,
    ])

    expect(result.tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "FAIRE_RECEVABILITE_FAVORABLE                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES]",
        "RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_MISE_EN_CONCURRENCE,NOTIFIER_DEMANDEUR]",
        "FAIRE_MISE_EN_CONCURRENCE                         (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE,RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE]",
        "RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE      (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_CGE_IGEDD]",
        "RENDRE_AVIS_CGE_IGEDD                             (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DEMANDE_MODIFICATION_AES,NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_LETTRE_SAISINE_PREFET,RECEVOIR_REPONSE_DEMANDEUR]",
        "FAIRE_LETTRE_SAISINE_PREFET                       (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES                         (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS                  (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES]",
        "RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES   (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,OUVRIR_ENQUETE_PUBLIQUE]",
        "OUVRIR_ENQUETE_PUBLIQUE                           (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_CONSULTATION_DES_ADMINISTRATIONS_CENTRALES]",
        "FAIRE_CONSULTATION_DES_ADMINISTRATIONS_CENTRALES  (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE           (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS,RENDRE_MESURES_DE_PUBLICITE]",
        "RENDRE_MESURES_DE_PUBLICITE                       (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF                 (publique      , accepté et publié      ) -> [NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
        "FAIRE_ABROGATION                                  (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF                 (publique      , rejeté après abrogation) -> []",
      ]
    `)
  })
  test("vérifie l'arbre pour la prolongation d'ARM", () => {
    const result = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.avisDuPrefet.FAVORABLE,
      ETES.decisionDeLAutoriteAdministrative.ACCEPTE,
      ETES.publicationDeDecisionAuJORF.FAIT,
      ETES.mesuresDePublicite.FAIT,
      ETES.notificationAuDemandeur.FAIT,
      ETES.abrogationDeLaDecision.FAIT,
      ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
    ])

    expect(result.tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                 (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                        (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                                  (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
        "FAIRE_RECEVABILITE_FAVORABLE                         (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_COLLECTIVITES,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_COLLECTIVITES                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_SERVICES_COMMISSIONS]",
        "RENDRE_AVIS_SERVICES_COMMISSIONS                     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_PREFET]",
        "RENDRE_AVIS_PREFET                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTEE,RENDRE_DECISION_ADMINISTRATION_REJETEE,RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTEE              (publique      , accepté                ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS,RENDRE_MESURES_DE_PUBLICITE]",
        "PUBLIER_DECISION_ACCEPTEE_AU_JORF                    (publique      , accepté et publié      ) -> [NOTIFIER_DEMANDEUR,RENDRE_MESURES_DE_PUBLICITE]",
        "RENDRE_MESURES_DE_PUBLICITE                          (publique      , accepté et publié      ) -> [NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                   (publique      , accepté et publié      ) -> [FAIRE_ABROGATION]",
        "FAIRE_ABROGATION                                     (publique      , accepté et publié      ) -> [PUBLIER_DECISION_ACCEPTEE_AU_JORF,PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS (publique      , rejeté après abrogation) -> []",
      ]
    `)
  })

  test("vérifie l'arbre pour la déclaration d'irrecevabilité", () => {
    const result = setDateAndOrderAndInterpretMachine(psArmProMachine, '1999-04-14', [
      {
        ...ETES.demande.FAIT,
        consentement: 'non-applicable',
        concurrence: { amIFirst: true },
        paysId: 'FR',
        hasTitreFrom: false,
        surface: hectareToKm2(hectareValidator.parse(10)),
      },
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.DEFAVORABLE,
      ETES.demandeDeComplements.FAIT,
      ETES.receptionDeComplements.FAIT,
      ETES.declarationDIrrecevabilite.FAIT,
    ])
    expect(result.tree).toMatchInlineSnapshot(`
          [
            "RIEN                             (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
            "FAIRE_DEMANDE                    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,ENREGISTRER_DEMANDE]",
            "ENREGISTRER_DEMANDE              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
            "FAIRE_RECEVABILITE_DEFAVORABLE   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DEMANDE_DE_COMPLEMENTS]",
            "FAIRE_DEMANDE_DE_COMPLEMENTS     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DECLARATION_IRRECEVABILITE,RECEVOIR_COMPLEMENTS]",
            "RECEVOIR_COMPLEMENTS             (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_INFORMATION,DESISTER_PAR_LE_DEMANDEUR,FAIRE_DECLARATION_IRRECEVABILITE,FAIRE_RECEVABILITE_DEFAVORABLE,FAIRE_RECEVABILITE_FAVORABLE]",
            "FAIRE_DECLARATION_IRRECEVABILITE (confidentielle, rejeté                 ) -> []",
          ]
        `)
  })

  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProdSpecifiqueArmAxm as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    const machine = machineFind(demarche.titreTypeId, demarche.demarcheTypeId, demarche.etapes, demarche.id)
    if (isNullOrUndefined(machine)) {
      throw new Error('Impossible de trouver une machine')
    }
    machine.interpretMachine(demarche.etapes)
    expect(machine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
  // FIXMACHINE tester que la participation du public peut-être optionnelle
})
