import { ArmOctMachine } from './oct.machine'
import { setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { EtapeTypeEtapeStatutValidPair, EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { Etape } from '../machine-common'
import { describe, expect, test } from 'vitest'
const etapesProd = require('./2019-10-31-oct.cas.json') // eslint-disable-line

describe('vérifie l’arbre d’octroi d’ARM', () => {
  const armOctMachine = new ArmOctMachine()
  test('ne peut pas désister', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
      ]
    `)
  })

  test('quelles sont mes prochaines étapes sur un titre mécanisé', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
  [
    "RIEN                   (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
    "FAIRE_DEMANDE          (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
    "ENREGISTRER_DEMANDE    (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
    "PAYER_FRAIS_DE_DOSSIER (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,REFUSER_RDE]",
  ]
`)
  })

  test('quelles sont mes prochaines étapes sur un titre mécanisé avec franchissements', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-02-03', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true, franchissements: 1 } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
  [
    "RIEN                   (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
    "FAIRE_DEMANDE          (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
    "ENREGISTRER_DEMANDE    (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
    "PAYER_FRAIS_DE_DOSSIER (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,REFUSER_RDE]",
  ]
`)
  })

  test('quelles sont mes prochaines étapes non mécanisé', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-02-03', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: false } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                   (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE          (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "ENREGISTRER_DEMANDE    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "PAYER_FRAIS_DE_DOSSIER (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
      ]
    `)
  })
  test('peut faire une edm après une asc', () => {
    const etapes = [
      ETES.paiementDesFraisDeDossier.FAIT,
      ETES.demande.FAIT,
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.completudeDeLaDemande.COMPLETE,
      ETES.validationDuPaiementDesFraisDeDossier.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      ETES.expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_.FAVORABLE,
    ]
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2023-09-01', etapes)
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES]",
        "RECEVOIR_EXPERTISE_SERVICE_MINES                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU]",
      ]
    `)
  })
  test('ne peut pas faire une sca avant la asc', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2023-09-26', [
        ETES.paiementDesFraisDeDossier.FAIT,
        ETES.demande.FAIT,
        ETES.enregistrementDeLaDemande.FAIT,
        ETES.completudeDeLaDemande.COMPLETE,
        ETES.validationDuPaiementDesFraisDeDossier.FAIT,
        ETES.recevabiliteDeLaDemande.FAVORABLE,
        ETES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_.FAIT,
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"sca","etapeStatutId":"fai","date":"2023-10-03"}' after '["pfd_fai","mfr_fai","men_fai","mcp_com","vfd_fai","mcr_fav"]'. The event {"type":"FAIRE_SAISINE_CARM","date":"2023-10-03","status":"fai"} should be one of 'CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES']`
    )
  })
  test('la demande ne peut pas être effectuée après une modification de la demande', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: false } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'mod', etapeStatutId: 'fai' },
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE       (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "ENREGISTRER_DEMANDE (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "MODIFIER_DEMANDE    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
      ]
    `)
  })

  test('on peut faire une demande de compléments après une complétude incomplète', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: false } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'inc' },
    ])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                   (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE          (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "ENREGISTRER_DEMANDE    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "PAYER_FRAIS_DE_DOSSIER (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "REFUSER_COMPLETUDE     (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_COMPLETUDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
      ]
    `)
  })

  test.each([ETES.demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.FAIT, ETES.demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_.FAIT])(
    'ne peut pas créer une étape "%s" si il n’existe pas d’autres étapes',
    (etape: EtapeTypeEtapeStatutValidPair & Omit<Etape, 'date' | 'etapeTypeId' | 'etapeStatutId'>) => {
      expect(() => setDateAndOrderAndInterpretMachine(armOctMachine, '2019-12-31', [etape])).toThrowErrorMatchingSnapshot()
    }
  )

  test('peut créer une étape "men" juste après une "mfr"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2022-04-16', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE       (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "ENREGISTRER_DEMANDE (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
      ]
    `)
  })

  test('ne peut pas créer une étape "mcp" sans "men"', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2022-04-14', [
        { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
        { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas créer 2 "mfr"', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2019-12-31', [
        { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
        { etapeTypeId: 'men', etapeStatutId: 'fai' },
        { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas déplacer une étape "men" sans "mfr"', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2020-02-01', [
        { etapeTypeId: 'men', etapeStatutId: 'fai' },
        { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test.each([
    {
      ...ETES.recepisseDeDeclarationLoiSurLeau.FAVORABLE,
      contenu: { arm: { franchissements: 1 } },
    },
    {
      ...ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
    },
  ])(
    'peut créer une étape "%s" juste après une "men" et que le titre est mécanisé avec franchissement d’eau',
    (etape: EtapeTypeEtapeStatutValidPair & Omit<Etape, 'date' | 'etapeTypeId' | 'etapeStatutId'>) => {
      setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
        { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true, franchissements: 1 } } },
        { etapeTypeId: 'men', etapeStatutId: 'fai' },
        etape,
      ])
    }
  )

  test('peut créer une étape "mcp" après une "men"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                   (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE          (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "ENREGISTRER_DEMANDE    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "PAYER_FRAIS_DE_DOSSIER (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
      ]
    `)
  })

  test('peut créer une "des" après "men"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-02-02', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'des', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                      (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE             (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "ENREGISTRER_DEMANDE       (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "DESISTER_PAR_LE_DEMANDEUR (publique      , désisté                ) -> [VALIDER_FRAIS_DE_DOSSIER]",
      ]
    `)
  })

  test('ne peut pas créer deux "des"', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2019-12-31', [
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'men',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'des',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'des',
          etapeStatutId: 'fai',
        },
      ])
    ).toThrowErrorMatchingSnapshot()
  })
  test('ne peut pas créer une "css" après une "des"', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'men',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'des',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'css',
          etapeStatutId: 'fai',
        },
      ])
    ).toThrowErrorMatchingSnapshot()
  })
  test('peut créer une "des" si le titre est en attente de "pfc"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
        contenu: { arm: { mecanise: true } },
      },
      {
        etapeTypeId: 'men',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'dae',
        etapeStatutId: 'exe',
      },
      {
        etapeTypeId: 'pfd',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'mcp',
        etapeStatutId: 'com',
      },
      {
        etapeTypeId: 'mod',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'vfd',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'mcr',
        etapeStatutId: 'fav',
      },
      {
        etapeTypeId: 'asc',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'sca',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'aca',
        etapeStatutId: 'fav',
      },
      {
        etapeTypeId: 'mnb',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'des',
        etapeStatutId: 'fai',
      },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "EXEMPTER_DAE                                          (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE,REFUSER_RDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "MODIFIER_DEMANDE                                      (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_COMPLEMENTS_RDE,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
        "RENDRE_AVIS_FAVORABLE_CARM                            (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM]",
        "NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "DESISTER_PAR_LE_DEMANDEUR                             (publique      , désisté                ) -> [VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
      ]
    `)
  })

  test('ne peut pas créer une "mno" après la "aca" si le titre n’est pas mécanisé', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'men',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'pfd',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'mcp',
          etapeStatutId: 'com',
        },
        {
          etapeTypeId: 'vfd',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'mcr',
          etapeStatutId: 'fav',
        },
        {
          etapeTypeId: 'asc',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'sca',
          etapeStatutId: 'fai',
        },
        {
          etapeTypeId: 'aca',
          etapeStatutId: 'fav',
        },
        {
          etapeTypeId: 'mnb',
          etapeStatutId: 'fai',
        },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('peut créer une "mnd" apres une "aca" défavorable', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-08-18', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcr', etapeStatutId: 'fav' },
      { etapeTypeId: 'asc', etapeStatutId: 'fai' },
      { etapeTypeId: 'sca', etapeStatutId: 'fai' },
      { etapeTypeId: 'aca', etapeStatutId: 'def' },
      { etapeTypeId: 'mnd', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
        "RENDRE_AVIS_DEFAVORABLE_CARM                          (publique      , rejeté                 ) -> [NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM]",
        "NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM              (publique      , rejeté                 ) -> []",
      ]
    `)
  })

  test('peut créer une "mod" si il n’y a pas de sca', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2019-12-12', [
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'men',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'pfd',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'mcp',
        etapeStatutId: 'com',
      },
      {
        etapeTypeId: 'vfd',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'mcr',
        etapeStatutId: 'fav',
      },
      {
        etapeTypeId: 'asc',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'mod',
        etapeStatutId: 'fai',
      },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES]",
        "MODIFIER_DEMANDE                                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES]",
      ]
    `)
  })

  test('peut créer une "mcp" après une "pfd" et "men"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-30', [
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'men',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'pfd',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'mcp',
        etapeStatutId: 'com',
      },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                   (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE          (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "ENREGISTRER_DEMANDE    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "PAYER_FRAIS_DE_DOSSIER (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
      ]
    `)
  })

  test('peut créer une "sca" après une "asc" et "rde"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-06-22', [
      {
        etapeTypeId: 'dae',
        etapeStatutId: 'exe',
      },
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
        contenu: { arm: { mecanise: true, franchissements: 3 } },
      },
      {
        etapeTypeId: 'pfd',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'men',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'mcp',
        etapeStatutId: 'com',
      },
      {
        etapeTypeId: 'rde',
        etapeStatutId: 'fav',
        contenu: { arm: { franchissements: 3 } },
      },
      {
        etapeTypeId: 'vfd',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'mcr',
        etapeStatutId: 'fav',
      },
      {
        etapeTypeId: 'asc',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'sca',
        etapeStatutId: 'fai',
      },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "EXEMPTER_DAE                                          (confidentielle, en construction        ) -> [ACCEPTER_RDE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_COMPLEMENTS_RDE,ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_COMPLEMENTS_RDE,ENREGISTRER_DEMANDE,REFUSER_RDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE,REFUSER_RDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "ACCEPTER_RDE                                          (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
      ]
    `)
  })

  test('peut faire une "sco" après une "aca" favorable en mécanisé', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-09-28', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true, franchissements: 3 } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'dae', etapeStatutId: 'exe' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcr', etapeStatutId: 'fav' },
      { etapeTypeId: 'asc', etapeStatutId: 'fai' },
      { etapeTypeId: 'rde', etapeStatutId: 'fav', contenu: { arm: { franchissements: 3 } } },
      { etapeTypeId: 'sca', etapeStatutId: 'fai' },
      { etapeTypeId: 'aca', etapeStatutId: 'fav' },
      { etapeTypeId: 'mnb', etapeStatutId: 'fai' },
      { etapeTypeId: 'pfc', etapeStatutId: 'fai' },
      { etapeTypeId: 'vfc', etapeStatutId: 'fai' },
      { etapeTypeId: 'sco', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,REFUSER_RDE]",
        "EXEMPTER_DAE                                          (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE,REFUSER_RDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_COMPLEMENTS_RDE,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE]",
        "ACCEPTER_RDE                                          (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
        "RENDRE_AVIS_FAVORABLE_CARM                            (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM]",
        "NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES     (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE]",
        "SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE              (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
      ]
    `)
  })

  test('les étapes sont vérifiées dans le bon ordre', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-04-09', [
      { etapeTypeId: 'rde', etapeStatutId: 'fav', contenu: { arm: { franchissements: 3 } } },
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true, franchissements: 3 } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'dae', etapeStatutId: 'exe' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcr', etapeStatutId: 'fav' },
      { etapeTypeId: 'asc', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "ACCEPTER_RDE                                          (confidentielle, en construction        ) -> [DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "EXEMPTER_DAE                                          (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES]",
      ]
    `)
  })

  test('des étapes qui se font la même journée', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-09-03', [
      {
        etapeTypeId: 'pfd',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'men',
        etapeStatutId: 'fai',
      },
      {
        etapeTypeId: 'mcp',
        etapeStatutId: 'com',
      },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                   (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,REFUSER_RDE]",
        "FAIRE_DEMANDE          (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE    (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
      ]
    `)
  })

  test('peut réaliser une saisine de la CARM après un récépissé de la déclaration sur l’eau défavorable', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-07-28', [
      { etapeTypeId: 'dae', etapeStatutId: 'exe' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true, franchissements: 3 } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcr', etapeStatutId: 'fav' },
      { etapeTypeId: 'mcb', etapeStatutId: 'fai' },
      { etapeTypeId: 'edm', etapeStatutId: 'fav' },
      { etapeTypeId: 'rde', etapeStatutId: 'def', contenu: { arm: { franchissements: 3 } } },
      { etapeTypeId: 'asc', etapeStatutId: 'fai' },
      { etapeTypeId: 'sca', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "EXEMPTER_DAE                                          (confidentielle, en construction        ) -> [ACCEPTER_RDE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en construction        ) -> [ACCEPTER_RDE,FAIRE_DEMANDE,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_COMPLEMENTS_RDE,ENREGISTRER_DEMANDE,REFUSER_RDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE,REFUSER_RDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_COMPLEMENTS_RDE,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "DEMANDER_COMPLEMENTS_RDE                              (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_COMPLEMENTS_RDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RECEVOIR_EXPERTISE_SERVICE_MINES                      (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_COMPLEMENTS_RDE,RECEVOIR_EXPERTISE_SERVICE_EAU,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "REFUSER_RDE                                           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
      ]
    `)
  })

  test('peut réaliser une demande de compléments après un avis de la CARM ajourné', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-09-03', [
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcr', etapeStatutId: 'fav' },
      { etapeTypeId: 'asc', etapeStatutId: 'fai' },
      { etapeTypeId: 'sca', etapeStatutId: 'fai' },
      { etapeTypeId: 'aca', etapeStatutId: 'ajo' },
      { etapeTypeId: 'mna', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcs', etapeStatutId: 'fai' },
      { etapeTypeId: 'rcs', etapeStatutId: 'fai' },
      { etapeTypeId: 'sca', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
        "RENDRE_AVIS_AJOURNE_CARM                              (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR_AVIS_AJOURNE_CARM]",
        "NOTIFIER_DEMANDEUR_AVIS_AJOURNE_CARM                  (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENT_SAISINE_CARM,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM]",
        "DEMANDER_COMPLEMENT_SAISINE_CARM                      (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,RECEVOIR_COMPLEMENT_SAISINE_CARM]",
        "RECEVOIR_COMPLEMENT_SAISINE_CARM                      (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENT_SAISINE_CARM,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
      ]
    `)
  })

  test('peut réaliser une demande d’ARM non mécanisée et un avenant', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-09-03', [
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcr', etapeStatutId: 'fav' },
      { etapeTypeId: 'asc', etapeStatutId: 'fai' },
      { etapeTypeId: 'sca', etapeStatutId: 'fai' },
      { etapeTypeId: 'aca', etapeStatutId: 'fav' },
      { etapeTypeId: 'sco', etapeStatutId: 'fai' },
      { etapeTypeId: 'mns', etapeStatutId: 'fai' },
      { etapeTypeId: 'aco', etapeStatutId: 'fai' },
      { etapeTypeId: 'mnv', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
        "RENDRE_AVIS_FAVORABLE_CARM                            (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE]",
        "SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE              (publique      , accepté                ) -> [NOTIFIER_DEMANDEUR_SIGNATURE_ARM]",
        "NOTIFIER_DEMANDEUR_SIGNATURE_ARM                      (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
        "FAIRE_AVENANT_ARM                                     (publique      , accepté                ) -> [NOTIFIER_AVENANT_ARM]",
        "NOTIFIER_AVENANT_ARM                                  (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
      ]
    `)
  })

  test('peut réaliser une demande d’ARM mécanisée et un avenant', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-25', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'dae', etapeStatutId: 'exe' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcr', etapeStatutId: 'fav' },
      { etapeTypeId: 'asc', etapeStatutId: 'fai' },
      { etapeTypeId: 'sca', etapeStatutId: 'fai' },
      { etapeTypeId: 'aca', etapeStatutId: 'fav' },
      { etapeTypeId: 'mnb', etapeStatutId: 'fai' },
      { etapeTypeId: 'pfc', etapeStatutId: 'fai' },
      { etapeTypeId: 'vfc', etapeStatutId: 'fai' },
      { etapeTypeId: 'sco', etapeStatutId: 'fai' },
      { etapeTypeId: 'aco', etapeStatutId: 'fai' },
      { etapeTypeId: 'mnv', etapeStatutId: 'fai' },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "EXEMPTER_DAE                                          (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE,REFUSER_RDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_COMPLEMENTS_RDE,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
        "RENDRE_AVIS_FAVORABLE_CARM                            (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM]",
        "NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES     (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE]",
        "SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE              (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
        "FAIRE_AVENANT_ARM                                     (publique      , accepté                ) -> [NOTIFIER_AVENANT_ARM]",
        "NOTIFIER_AVENANT_ARM                                  (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
      ]
    `)
  })

  test("peut faire une demande de compléments pour la RDE si les franchissements d'eau ne sont pas spécifiés sur une ARM mécanisée", () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-07-14', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true } } },
      { etapeTypeId: 'dae', etapeStatutId: 'exe' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'mcb', etapeStatutId: 'fai' },
      { etapeTypeId: 'rcb', etapeStatutId: 'fai', contenu: { arm: { franchissements: 4 } } },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                     (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE            (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "EXEMPTER_DAE             (confidentielle, en construction        ) -> [ACCEPTER_RDE,ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER   (confidentielle, en construction        ) -> [ACCEPTER_RDE,ENREGISTRER_DEMANDE,REFUSER_RDE]",
        "ENREGISTRER_DEMANDE      (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE,REFUSER_RDE]",
        "ACCEPTER_COMPLETUDE      (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "DEMANDER_COMPLEMENTS_RDE (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_COMPLEMENTS_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "RECEVOIR_COMPLEMENTS_RDE (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
      ]
    `)
  })

  test('ne peut pas faire de mfr non mécanisée après une dae', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-23', [
        {
          etapeTypeId: 'dae',
          etapeStatutId: 'exe',
        },
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          contenu: { arm: { mecanise: false } },
        },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas faire de mfr non mécanisée après une rde', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-23', [
        {
          etapeTypeId: 'rde',
          etapeStatutId: 'fav',
          contenu: { arm: { franchissements: 1 } },
        },
        {
          etapeTypeId: 'mfr',
          etapeStatutId: 'fai',
          contenu: { arm: { mecanise: false } },
        },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('peut réaliser une validation des frais de dossier complémentaire après un désistement', () => {
    let result = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-25', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'dae', etapeStatutId: 'exe' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcr', etapeStatutId: 'fav' },
      { etapeTypeId: 'asc', etapeStatutId: 'fai' },
      { etapeTypeId: 'css', etapeStatutId: 'fai' },
      { etapeTypeId: 'mnc', etapeStatutId: 'fai' },
      { etapeTypeId: 'vfc', etapeStatutId: 'fai' },
    ])
    expect(result.tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "EXEMPTER_DAE                                          (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE,REFUSER_RDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_COMPLEMENTS_RDE,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE]",
        "CLASSER_SANS_SUITE                                    (publique      , classé sans suite      ) -> [NOTIFIER_DEMANDEUR_CSS]",
        "NOTIFIER_DEMANDEUR_CSS                                (publique      , classé sans suite      ) -> [VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES     (publique      , classé sans suite      ) -> []",
      ]
    `)

    result = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-25', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'dae', etapeStatutId: 'exe' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'css', etapeStatutId: 'fai' },
      { etapeTypeId: 'mnc', etapeStatutId: 'fai' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'vfc', etapeStatutId: 'fai' },
    ])
    expect(result.tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "EXEMPTER_DAE                                      (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                            (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE,REFUSER_RDE]",
        "ACCEPTER_COMPLETUDE                               (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "CLASSER_SANS_SUITE                                (publique      , classé sans suite      ) -> [NOTIFIER_DEMANDEUR_CSS]",
        "NOTIFIER_DEMANDEUR_CSS                            (publique      , classé sans suite      ) -> [ACCEPTER_RDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                          (publique      , classé sans suite      ) -> [VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES (publique      , classé sans suite      ) -> []",
      ]
    `)

    result = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-25', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'dae', etapeStatutId: 'exe' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcr', etapeStatutId: 'fav' },
      { etapeTypeId: 'asc', etapeStatutId: 'fai' },
      { etapeTypeId: 'des', etapeStatutId: 'fai' },
      { etapeTypeId: 'vfc', etapeStatutId: 'fai' },
    ])
    expect(result.tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "EXEMPTER_DAE                                          (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE,REFUSER_RDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_COMPLEMENTS_RDE,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE_SERVICE_EAU,RECEVOIR_EXPERTISE_SERVICE_MINES,REFUSER_RDE]",
        "DESISTER_PAR_LE_DEMANDEUR                             (publique      , désisté                ) -> [VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES     (publique      , désisté                ) -> []",
      ]
    `)

    result = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-25', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', contenu: { arm: { mecanise: true } } },
      { etapeTypeId: 'men', etapeStatutId: 'fai' },
      { etapeTypeId: 'dae', etapeStatutId: 'exe' },
      { etapeTypeId: 'pfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'mcp', etapeStatutId: 'com' },
      { etapeTypeId: 'des', etapeStatutId: 'fai' },
      { etapeTypeId: 'vfd', etapeStatutId: 'fai' },
      { etapeTypeId: 'vfc', etapeStatutId: 'fai' },
    ])
    expect(result.tree).toMatchInlineSnapshot(`
      [
        "RIEN                                              (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                     (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,ENREGISTRER_DEMANDE,EXEMPTER_DAE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "ENREGISTRER_DEMANDE                               (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_DAE,DEMANDER_COMPLEMENTS_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,DESISTER_PAR_LE_DEMANDEUR,EXEMPTER_DAE,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "EXEMPTER_DAE                                      (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                            (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE,REFUSER_RDE]",
        "ACCEPTER_COMPLETUDE                               (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "DESISTER_PAR_LE_DEMANDEUR                         (publique      , désisté                ) -> [ACCEPTER_RDE,REFUSER_RDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                          (publique      , désisté                ) -> [VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES (publique      , désisté                ) -> []",
      ]
    `)
  })

  test('peut faire une "mfr" non mécanisée avec un franchissement d’eau', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2019-12-10', [
      {
        etapeTypeId: 'mfr',
        etapeStatutId: 'fai',
        contenu: { arm: { mecanise: false, franchissements: 3 } },
      },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN          (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
      ]
    `)
  })

  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    armOctMachine.interpretMachine(demarche.etapes)
    expect(armOctMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
