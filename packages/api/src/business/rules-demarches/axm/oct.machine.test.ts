import { setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { AxmOctMachine } from './oct.machine'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { toCaminoDate } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'
import { onlyUnique } from 'camino-common/src/typescript-tools'
const etapesProd = require('./2020-10-01-oct.cas.json') // eslint-disable-line

describe('vérifie l’arbre d’octroi d’AXM', () => {
  const axmOctMachine = new AxmOctMachine()
  test('peut créer une "men" après une "mfr"', () => {
    const { tree, etapes } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2020-01-01', [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE       (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR]",
        "ENREGISTRER_DEMANDE (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RENDRE_DECISION_IMPLICITE_REJET]",
      ]
    `)
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([ADMINISTRATION_IDS['DGTM - GUYANE']])
  })

  test('peut faire l’avis du DREAL sans aucun autre avis 30 jours après la saisine des services', () => {
    const { tree, machine, etapes } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2020-01-01', [
      ETES.demande.FAIT,
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      { ...ETES.rapportEtAvisDeLaDREAL.FAVORABLE, addDays: 31 },
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RENDRE_DECISION_IMPLICITE_REJET]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE                  (publique      , en instruction         ) -> [DEMANDER_INFORMATION_POUR_AVIS_DREAL,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_AVIS_DES_COLLECTIVITES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_COLLECTIVITES                         (publique      , en instruction         ) -> [DEMANDER_INFORMATION_POUR_AVIS_DREAL,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (publique      , en instruction         ) -> [DEMANDER_INFORMATION_POUR_AVIS_DREAL,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR]",
        "RENDRE_AVIS_DREAL                                     (publique      , en instruction         ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE]",
      ]
    `)
    expect(
      machine
        .possibleNextEtapes(etapes, toCaminoDate('2022-06-15'))
        .map(({ type }) => type)
        .filter(onlyUnique)
        .toSorted()
    ).toMatchInlineSnapshot(`
      [
        "FAIRE_CLASSEMENT_SANS_SUITE",
        "FAIRE_DESISTEMENT_DEMANDEUR",
        "FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES",
        "RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES",
        "RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE",
      ]
    `)
  })
  test('peut ajourner l’avis de la commission départementale des mines', () => {
    const actual = setDateAndOrderAndInterpretMachine(axmOctMachine, '2022-04-14', [
      ETES.demande.FAIT,
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      { ...ETES.rapportEtAvisDeLaDREAL.FAVORABLE, addDays: 31 },
      ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.AJOURNE,
      ETES.rapportEtAvisDeLaDREAL.FAVORABLE,
      ETES.saisineDeLaCommissionDepartementaleDesMines_CDM_.FAIT,
      ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE,
    ])
    expect(actual.tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                    (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                           (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR]",
        "ENREGISTRER_DEMANDE                                     (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RENDRE_DECISION_IMPLICITE_REJET]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE                    (publique      , en instruction         ) -> [DEMANDER_INFORMATION_POUR_AVIS_DREAL,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_AVIS_DES_COLLECTIVITES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_COLLECTIVITES                           (publique      , en instruction         ) -> [DEMANDER_INFORMATION_POUR_AVIS_DREAL,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES   (publique      , en instruction         ) -> [DEMANDER_INFORMATION_POUR_AVIS_DREAL,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR]",
        "RENDRE_AVIS_DREAL                                       (publique      , en instruction         ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE]",
        "RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE (publique      , en instruction         ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_AVIS_DREAL]",
        "RENDRE_AVIS_DREAL                                       (publique      , en instruction         ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE]",
        "FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES       (publique      , en instruction         ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE]",
        "RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES         (publique      , en instruction         ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_SAISINE_AUTORITE_SIGNATAIRE,RENDRE_DECISION_ADMINISTRATION_ACCEPTE,RENDRE_DECISION_ADMINISTRATION_REJETE]",
      ]
    `)
  })

  test('ne peut pas faire de note interne signalée avant une demande', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2022-04-16', [])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
      ]
    `)
  })

  test('ne peut plus rien faire après un désistement', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2020-02-06', [ETES.demande.FAIT, ETES.desistementDuDemandeur.FAIT])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                        (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE               (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR]",
        "FAIRE_DESISTEMENT_DEMANDEUR (confidentielle, désisté                ) -> []",
      ]
    `)
  })

  test('peut faire uniquement une decision annulation par le juge administratif après une décision implicite', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2020-01-01', [
      ETES.demande.FAIT,
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.decisionDeLAutoriteAdministrative.REJETE_DECISION_IMPLICITE,
    ])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                            (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                   (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR]",
        "ENREGISTRER_DEMANDE             (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RENDRE_DECISION_IMPLICITE_REJET]",
        "RENDRE_DECISION_IMPLICITE_REJET (publique      , rejeté                 ) -> [RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF]",
      ]
    `)
  })

  test('peut classer sans suite après une décision du propriétaire du sol défavorable', () => {
    const { tree, etapes, machine } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2022-04-10', [ETES.demande.FAIT, ETES.classementSansSuite.FAIT])

    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                        (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE               (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR]",
        "FAIRE_CLASSEMENT_SANS_SUITE (confidentielle, classé sans suite      ) -> []",
      ]
    `)
    expect(machine.whoIsBlocking(etapes)).toStrictEqual([])
  })

  test('ne peut pas faire deux fois la même étape à la même date', () => {
    const etapes = [{ ...ETES.demande.FAIT }, { ...ETES.demande.FAIT }]
    expect(() => setDateAndOrderAndInterpretMachine(axmOctMachine, '2022-04-01', etapes)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Error: cannot execute step: '{"etapeTypeId":"mfr","etapeStatutId":"fai","date":"2022-04-03"}' after '["mfr_fai"]'. The event {"type":"FAIRE_DEMANDE","date":"2022-04-03","status":"fai"} should be one of 'ENREGISTRER_DEMANDE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR']`
    )
  })

  test('peut faire un octroi complet', () => {
    const actual = setDateAndOrderAndInterpretMachine(axmOctMachine, '2022-04-01', [
      ETES.demande.FAIT,
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
      ETES.receptionDeComplements_RecevabiliteDeLaDemande_.FAIT,
      ETES.recevabiliteDeLaDemande.DEFAVORABLE,
      ETES.modificationDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
      { ...ETES.rapportEtAvisDeLaDREAL.FAVORABLE, addDays: 31 },
      ETES.saisineDeLaCommissionDepartementaleDesMines_CDM_.FAIT,
      ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE,
      ETES.saisineDeLautoriteSignataire.FAIT,
      ETES.decisionDeLAutoriteAdministrative.ACCEPTE,
      ETES.notificationDesCollectivitesLocales.FAIT,
      ETES.publicationDansUnJournalLocalOuNational.FAIT,
      ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
      ETES.notificationAuDemandeur.FAIT,
    ])

    expect(actual.tree).toMatchInlineSnapshot(`
      [
        "RIEN                                                  (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                                         (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR]",
        "ENREGISTRER_DEMANDE                                   (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RENDRE_DECISION_IMPLICITE_REJET]",
        "DEMANDER_COMPLEMENTS_POUR_RECEVABILITE                (confidentielle, déposé                 ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE]",
        "RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE                (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RENDRE_DECISION_IMPLICITE_REJET]",
        "FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE                (confidentielle, déposé                 ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,MODIFIER_LA_DEMANDE]",
        "MODIFIER_LA_DEMANDE                                   (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RENDRE_DECISION_IMPLICITE_REJET]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE                  (publique      , en instruction         ) -> [DEMANDER_INFORMATION_POUR_AVIS_DREAL,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_AVIS_DES_COLLECTIVITES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_COLLECTIVITES                         (publique      , en instruction         ) -> [DEMANDER_INFORMATION_POUR_AVIS_DREAL,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES]",
        "RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES (publique      , en instruction         ) -> [DEMANDER_INFORMATION_POUR_AVIS_DREAL,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR]",
        "RENDRE_AVIS_DREAL                                     (publique      , en instruction         ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE]",
        "FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES     (publique      , en instruction         ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES,RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE]",
        "RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES       (publique      , en instruction         ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_SAISINE_AUTORITE_SIGNATAIRE,RENDRE_DECISION_ADMINISTRATION_ACCEPTE,RENDRE_DECISION_ADMINISTRATION_REJETE]",
        "FAIRE_SAISINE_AUTORITE_SIGNATAIRE                     (publique      , en instruction         ) -> [FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_DECISION_ADMINISTRATION_ACCEPTE,RENDRE_DECISION_ADMINISTRATION_REJETE]",
        "RENDRE_DECISION_ADMINISTRATION_ACCEPTE                (publique      , accepté                ) -> [NOTIFIER_COLLECTIVITES_LOCALES,NOTIFIER_DEMANDEUR,PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL,PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS,RENDRE_DECISION_ABROGATION,RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF]",
        "NOTIFIER_COLLECTIVITES_LOCALES                        (publique      , accepté                ) -> [NOTIFIER_DEMANDEUR,PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL,PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL             (publique      , accepté                ) -> [NOTIFIER_DEMANDEUR,PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS]",
        "PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS        (publique      , accepté                ) -> [NOTIFIER_DEMANDEUR]",
        "NOTIFIER_DEMANDEUR                                    (publique      , accepté                ) -> []",
      ]
    `)
  })

  test('peut rendre l’avis DREAL que 30 jours après la saisine des services', () => {
    const { machine, etapes } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2022-04-01', [
      ETES.demande.FAIT,
      ETES.enregistrementDeLaDemande.FAIT,
      ETES.recevabiliteDeLaDemande.FAVORABLE,
      ETES.avisDesCollectivites.FAIT,
      ETES.avisDesServicesEtCommissionsConsultatives.FAIT,
    ])
    expect(
      machine
        .possibleNextEtapes(etapes, toCaminoDate('2022-05-06'))
        .map(({ type }) => type)
        .filter(onlyUnique)
        .toSorted()
    ).toMatchInlineSnapshot(`
      [
        "DEMANDER_INFORMATION_POUR_AVIS_DREAL",
        "FAIRE_CLASSEMENT_SANS_SUITE",
        "FAIRE_DESISTEMENT_DEMANDEUR",
        "RENDRE_AVIS_DREAL",
      ]
    `)
    expect(
      machine
        .possibleNextEtapes(etapes, toCaminoDate('2022-05-05'))
        .map(({ type }) => type)
        .filter(onlyUnique)
        .toSorted()
    ).toMatchInlineSnapshot(`
      [
        "DEMANDER_INFORMATION_POUR_AVIS_DREAL",
        "FAIRE_CLASSEMENT_SANS_SUITE",
        "FAIRE_DESISTEMENT_DEMANDEUR",
      ]
    `)
  })

  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    axmOctMachine.interpretMachine(demarche.etapes)
    expect(axmOctMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
