import { ArmOctMachine } from './oct.machine'
import { setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { EtapeTypeEtapeStatutValidPair, EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { Etape } from '../machine-common'
import { describe, expect, test } from 'vitest'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'

describe('vérifie l’arbre d’octroi d’ARM', () => {
  const armOctMachine = new ArmOctMachine(TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, DEMARCHES_TYPES_IDS.Octroi)
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
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
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
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true, franchissements: 1 } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
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
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: false } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
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
      ETES.expertises.FAVORABLE,
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
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE]",
        "RECEVOIR_EXPERTISE                                    (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE]",
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
      `[Error: Error: cannot execute step: '{"etapeTypeId":"sca","etapeStatutId":"fai","date":"2023-10-03"}' after '["pfd_fai","mfr_fai","men_fai","mcp_com","vfd_fai","mcr_fav"]'. The event {"type":"FAIRE_SAISINE_CARM","date":"2023-10-03","status":"fai"} should be one of 'CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES']`
    )
  })
  test('la demande ne peut pas être effectuée après une modification de la demande', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: false } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.modificationDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
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
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: false } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.INCOMPLETE },
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
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
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
        { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT },
        { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas créer 2 "mfr"', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2019-12-31', [
        { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT },
        { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
        { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas déplacer une étape "men" sans "mfr"', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2020-02-01', [
        { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
        { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT },
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
        { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true, franchissements: 1 } } },
        { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
        etape,
      ])
    }
  )

  test('peut créer une étape "mcp" après une "men"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
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
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.desistementDuDemandeur, etapeStatutId: ETAPES_STATUTS.FAIT },
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
          etapeTypeId: ETAPES_TYPES.demande,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
      ])
    ).toThrowErrorMatchingSnapshot()
  })
  test('ne peut pas créer une "css" après une "des"', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
        {
          etapeTypeId: ETAPES_TYPES.demande,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.classementSansSuite,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
      ])
    ).toThrowErrorMatchingSnapshot()
  })
  test('peut créer une "des" si le titre est en attente de "pfc"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-01', [
      {
        etapeTypeId: ETAPES_TYPES.demande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
        contenu: { arm: { mecanise: true } },
      },
      {
        etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
        etapeStatutId: ETAPES_STATUTS.EXEMPTE,
      },
      {
        etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.COMPLETE,
      },
      {
        etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.FAVORABLE,
      },
      {
        etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
        etapeStatutId: ETAPES_STATUTS.FAVORABLE,
      },
      {
        etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.desistementDuDemandeur,
        etapeStatutId: ETAPES_STATUTS.FAIT,
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
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE]",
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
          etapeTypeId: ETAPES_TYPES.demande,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
          etapeStatutId: ETAPES_STATUTS.COMPLETE,
        },
        {
          etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
          etapeStatutId: ETAPES_STATUTS.FAVORABLE,
        },
        {
          etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
        {
          etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
          etapeStatutId: ETAPES_STATUTS.FAVORABLE,
        },
        {
          etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_,
          etapeStatutId: ETAPES_STATUTS.FAIT,
        },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('peut créer une "mnd" apres une "aca" défavorable', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-08-18', [
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.DEFAVORABLE },
      { etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisDefavorable_, etapeStatutId: ETAPES_STATUTS.FAIT },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,PAYER_FRAIS_DE_DOSSIER]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
        "RENDRE_AVIS_DEFAVORABLE_CARM                          (publique      , rejeté                 ) -> [NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM]",
        "NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM              (publique      , rejeté                 ) -> []",
      ]
    `)
  })

  test('peut créer une "mod" si il n’y a pas de sca', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2019-12-12', [
      {
        etapeTypeId: ETAPES_TYPES.demande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.COMPLETE,
      },
      {
        etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.FAVORABLE,
      },
      {
        etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.modificationDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
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
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE]",
        "MODIFIER_DEMANDE                                      (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE]",
      ]
    `)
  })

  test('peut créer une "mcp" après une "pfd" et "men"', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-01-30', [
      {
        etapeTypeId: ETAPES_TYPES.demande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.COMPLETE,
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
        etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
        etapeStatutId: ETAPES_STATUTS.EXEMPTE,
      },
      {
        etapeTypeId: ETAPES_TYPES.demande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
        contenu: { arm: { mecanise: true, franchissements: 3 } },
      },
      {
        etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.COMPLETE,
      },
      {
        etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau,
        etapeStatutId: ETAPES_STATUTS.FAVORABLE,
        contenu: { arm: { franchissements: 3 } },
      },
      {
        etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.FAVORABLE,
      },
      {
        etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_,
        etapeStatutId: ETAPES_STATUTS.FAIT,
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
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
      ]
    `)
  })

  test('peut faire une "sco" après une "aca" favorable en mécanisé', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-09-28', [
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true, franchissements: 3 } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, etapeStatutId: ETAPES_STATUTS.EXEMPTE },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau, etapeStatutId: ETAPES_STATUTS.FAVORABLE, contenu: { arm: { franchissements: 3 } } },
      { etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: 'pfc', etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: 'sco', etapeStatutId: ETAPES_STATUTS.FAIT },
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
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE]",
        "ACCEPTER_RDE                                          (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
        "RENDRE_AVIS_FAVORABLE_CARM                            (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM]",
        "NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES     (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE]",
        "SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE              (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
        "[2020-10-13 -> 2021-10-13]",
      ]
    `)
  })

  test('les étapes sont vérifiées dans le bon ordre', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-04-09', [
      { etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau, etapeStatutId: ETAPES_STATUTS.FAVORABLE, contenu: { arm: { franchissements: 3 } } },
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true, franchissements: 3 } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, etapeStatutId: ETAPES_STATUTS.EXEMPTE },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, etapeStatutId: ETAPES_STATUTS.FAIT },
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
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE]",
      ]
    `)
  })

  test('des étapes qui se font la même journée', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-09-03', [
      {
        etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.demande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
      },
      {
        etapeTypeId: ETAPES_TYPES.completudeDeLaDemande,
        etapeStatutId: ETAPES_STATUTS.COMPLETE,
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
      { etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, etapeStatutId: ETAPES_STATUTS.EXEMPTE },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true, franchissements: 3 } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.expertises, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau, etapeStatutId: ETAPES_STATUTS.DEFAVORABLE, contenu: { arm: { franchissements: 3 } } },
      { etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
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
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "DEMANDER_COMPLEMENTS_RDE                              (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_COMPLEMENTS_RDE,RECEVOIR_EXPERTISE,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RECEVOIR_EXPERTISE                                    (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_COMPLEMENTS_RDE,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "REFUSER_RDE                                           (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
      ]
    `)
  })

  test('peut réaliser une demande de compléments après un avis de la CARM ajourné', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-09-03', [
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: 'ajo' },
      { etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AjournementDeLaCARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.demandeDeComplements_SaisineDeLaCARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.receptionDeComplements_SaisineDeLaCARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE]",
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
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: 'sco', etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: 'mns', etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: 'aco', etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: 'mnv', etapeStatutId: ETAPES_STATUTS.FAIT },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,PAYER_FRAIS_DE_DOSSIER,REFUSER_RDE]",
        "PAYER_FRAIS_DE_DOSSIER                                (confidentielle, en construction        ) -> [ACCEPTER_RDE,DEMANDER_MODIFICATION_DE_LA_DEMANDE,EXEMPTER_DAE,FAIRE_DEMANDE,REFUSER_RDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, en instruction         ) -> [ACCEPTER_COMPLETUDE,CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,REFUSER_COMPLETUDE]",
        "ACCEPTER_COMPLETUDE                                   (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,VALIDER_FRAIS_DE_DOSSIER]",
        "VALIDER_FRAIS_DE_DOSSIER                              (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DECLARER_DEMANDE_DEFAVORABLE,DECLARER_DEMANDE_FAVORABLE,DEMANDER_COMPLEMENTS_MCR,DEMANDER_INFORMATION_MCR,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE]",
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
        "RENDRE_AVIS_FAVORABLE_CARM                            (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE]",
        "SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE              (publique      , accepté                ) -> [NOTIFIER_DEMANDEUR_SIGNATURE_ARM]",
        "[2020-09-13 -> 2021-09-13]",
        "NOTIFIER_DEMANDEUR_SIGNATURE_ARM                      (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
        "[2020-09-13 -> 2021-09-13]",
        "FAIRE_AVENANT_ARM                                     (publique      , accepté                ) -> [NOTIFIER_AVENANT_ARM]",
        "[2020-09-13 -> 2021-09-13]",
        "NOTIFIER_AVENANT_ARM                                  (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
        "[2020-09-13 -> 2021-09-13]",
      ]
    `)
  })

  test('peut réaliser une demande d’ARM mécanisée et un avenant', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-25', [
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, etapeStatutId: ETAPES_STATUTS.EXEMPTE },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: 'pfc', etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: 'sco', etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: 'aco', etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: 'mnv', etapeStatutId: ETAPES_STATUTS.FAIT },
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
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE]",
        "FAIRE_SAISINE_CARM                                    (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,RENDRE_AVIS_AJOURNE_CARM,RENDRE_AVIS_DEFAVORABLE_CARM,RENDRE_AVIS_FAVORABLE_CARM]",
        "RENDRE_AVIS_FAVORABLE_CARM                            (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM]",
        "NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES                (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES     (publique      , en instruction         ) -> [CLASSER_SANS_SUITE,DESISTER_PAR_LE_DEMANDEUR,SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE]",
        "SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE              (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
        "[2021-03-11 -> 2022-03-11]",
        "FAIRE_AVENANT_ARM                                     (publique      , accepté                ) -> [NOTIFIER_AVENANT_ARM]",
        "[2021-03-11 -> 2022-03-11]",
        "NOTIFIER_AVENANT_ARM                                  (publique      , accepté                ) -> [FAIRE_AVENANT_ARM]",
        "[2021-03-11 -> 2022-03-11]",
      ]
    `)
  })

  test("peut faire une demande de compléments pour la RDE si les franchissements d'eau ne sont pas spécifiés sur une ARM mécanisée", () => {
    const { tree } = setDateAndOrderAndInterpretMachine(armOctMachine, '2020-07-14', [
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true } } },
      { etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, etapeStatutId: ETAPES_STATUTS.EXEMPTE },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: 'mcb', etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: 'rcb', etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { franchissements: 4 } } },
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
          etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_,
          etapeStatutId: ETAPES_STATUTS.EXEMPTE,
        },
        {
          etapeTypeId: ETAPES_TYPES.demande,
          etapeStatutId: ETAPES_STATUTS.FAIT,
          contenu: { arm: { mecanise: false } },
        },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('ne peut pas faire de mfr non mécanisée après une rde', () => {
    expect(() =>
      setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-23', [
        {
          etapeTypeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau,
          etapeStatutId: ETAPES_STATUTS.FAVORABLE,
          contenu: { arm: { franchissements: 1 } },
        },
        {
          etapeTypeId: ETAPES_TYPES.demande,
          etapeStatutId: ETAPES_STATUTS.FAIT,
          contenu: { arm: { mecanise: false } },
        },
      ])
    ).toThrowErrorMatchingSnapshot()
  })

  test('peut réaliser une validation des frais de dossier complémentaire après un désistement', () => {
    let result = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-25', [
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, etapeStatutId: ETAPES_STATUTS.EXEMPTE },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.classementSansSuite, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_ClassementSansSuite_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires, etapeStatutId: ETAPES_STATUTS.FAIT },
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
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE]",
        "CLASSER_SANS_SUITE                                    (publique      , classé sans suite      ) -> [NOTIFIER_DEMANDEUR_CSS]",
        "NOTIFIER_DEMANDEUR_CSS                                (publique      , classé sans suite      ) -> [VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES     (publique      , classé sans suite      ) -> []",
      ]
    `)

    result = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-25', [
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, etapeStatutId: ETAPES_STATUTS.EXEMPTE },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.classementSansSuite, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.notificationAuDemandeur_ClassementSansSuite_, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires, etapeStatutId: ETAPES_STATUTS.FAIT },
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
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, etapeStatutId: ETAPES_STATUTS.EXEMPTE },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.recevabiliteDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAVORABLE },
      { etapeTypeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.desistementDuDemandeur, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires, etapeStatutId: ETAPES_STATUTS.FAIT },
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
        "DECLARER_DEMANDE_FAVORABLE                            (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (confidentielle, en instruction         ) -> [ACCEPTER_RDE,CLASSER_SANS_SUITE,DEMANDER_COMPLEMENTS_RDE,DESISTER_PAR_LE_DEMANDEUR,FAIRE_SAISINE_CARM,MODIFIER_DEMANDE,RECEVOIR_EXPERTISE,REFUSER_RDE]",
        "DESISTER_PAR_LE_DEMANDEUR                             (publique      , désisté                ) -> [VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES]",
        "VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES     (publique      , désisté                ) -> []",
      ]
    `)

    result = setDateAndOrderAndInterpretMachine(armOctMachine, '2021-02-25', [
      { etapeTypeId: ETAPES_TYPES.demande, etapeStatutId: ETAPES_STATUTS.FAIT, contenu: { arm: { mecanise: true } } },
      { etapeTypeId: ETAPES_TYPES.enregistrementDeLaDemande, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, etapeStatutId: ETAPES_STATUTS.EXEMPTE },
      { etapeTypeId: ETAPES_TYPES.paiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.completudeDeLaDemande, etapeStatutId: ETAPES_STATUTS.COMPLETE },
      { etapeTypeId: ETAPES_TYPES.desistementDuDemandeur, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, etapeStatutId: ETAPES_STATUTS.FAIT },
      { etapeTypeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires, etapeStatutId: ETAPES_STATUTS.FAIT },
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
        etapeTypeId: ETAPES_TYPES.demande,
        etapeStatutId: ETAPES_STATUTS.FAIT,
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
})
