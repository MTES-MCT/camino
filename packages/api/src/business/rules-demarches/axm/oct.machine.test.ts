import { interpretMachine, orderAndInterpretMachine } from '../machine-test-helper.js'
import { AxmOctMachine } from './oct.machine.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
const etapesProd = require('./2020-09-30-oct.cas.json')

describe('vérifie l’arbre d’octroi d’AXM', () => {
  const axmOctMachine = new AxmOctMachine()
  test('peut créer une "mdp" après une "mfr", "dae" et "asl"', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      {
        ...ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
        date: toCaminoDate('2020-01-01'),
      },
      {
        ...ETES.decisionDuProprietaireDuSol.FAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-04-15') }, [
      'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE',
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE',
      'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE',
      'RENDRE_DECISION_IMPLICITE_REJET',
    ])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([ADMINISTRATION_IDS['DGTM - GUYANE']])
  })

  test('peut créer une "mdp" après une "mfr", "asl", "dae" requise', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      {
        ...ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.REQUIS,
        date: toCaminoDate('2020-01-01'),
      },
      {
        ...ETES.modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.FAIT,
        date: toCaminoDate('2020-01-02'),
      },
      {
        ...ETES.decisionDuProprietaireDuSol.FAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-04-15') }, [
      'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE',
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE',
      'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE',
      'RENDRE_DECISION_IMPLICITE_REJET',
    ])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([ADMINISTRATION_IDS['DGTM - GUYANE']])
  })

  test('ne peut pas créer une "mdp" avec une "dae" requise', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      {
        ...ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.REQUIS,
        date: toCaminoDate('2020-01-01'),
      },
      {
        ...ETES.decisionDuProprietaireDuSol.FAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
    ])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-04-14') }, [
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'MODIFIER_DEMANDE_APRES_DAE',
    ])
  })

  test('peut faire l’avis du DREAL sans aucun autre avis 30 jours après la saisine des services', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      {
        ...ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
        date: toCaminoDate('2020-01-01'),
      },
      {
        ...ETES.decisionDuProprietaireDuSol.FAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      {
        ...ETES.recevabiliteDeLaDemande.FAVORABLE,
        date: toCaminoDate('2022-04-15'),
      },
      {
        ...ETES.saisineDesCollectivitesLocales.FAIT,
        date: toCaminoDate('2022-04-15'),
      },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-15') },
      {
        ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE,
        date: toCaminoDate('2022-06-15'),
      },
    ])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-06-15') }, [
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES',
      'RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES',
      'RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE',
    ])
  })
  test('peut ajourner l’avis de la commission départementale des mines', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
      {
        ...ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
        date: toCaminoDate('2020-01-01'),
      },
      {
        ...ETES.decisionDuProprietaireDuSol.FAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-15') },
      {
        ...ETES.recevabiliteDeLaDemande.FAVORABLE,
        date: toCaminoDate('2022-04-15'),
      },
      {
        ...ETES.saisineDesCollectivitesLocales.FAIT,
        date: toCaminoDate('2022-04-15'),
      },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-15') },
      {
        ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE,
        date: toCaminoDate('2022-06-15'),
      },
      {
        ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.AJOURNE,
        date: toCaminoDate('2022-06-16'),
      },
      {
        ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE,
        date: toCaminoDate('2022-06-17'),
      },
      {
        ...ETES.saisineDeLaCommissionDepartementaleDesMines_CDM_.FAIT,
        date: toCaminoDate('2022-06-18'),
      },
      {
        ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE,
        date: toCaminoDate('2022-06-18'),
      },
    ])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-06-18') }, [
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'FAIRE_SAISINE_AUTORITE_SIGNATAIRE',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTE',
      'RENDRE_DECISION_ADMINISTRATION_REJETE',
    ])
  })

  test('ne peut pas faire de note interne signalée avant une demande', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-04-16') }, [
      'RENDRE_DAE_REQUISE',
      'RENDRE_DAE_EXEMPTEE',
      'FAIRE_DEMANDE',
      'RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_DEFAVORABLE',
      'RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_FAVORABLE',
      'RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_FAVORABLE_AVEC_RESERVE',
    ])
  })

  test('ne peut plus rien faire après un désistement', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', date: toCaminoDate('2020-02-06') },
      { etapeTypeId: 'dae', etapeStatutId: 'req', date: toCaminoDate('2021-03-23') },
      { etapeTypeId: 'asl', etapeStatutId: 'def', date: toCaminoDate('2021-05-07') },
      { etapeTypeId: 'des', etapeStatutId: 'fai', date: toCaminoDate('2021-06-21') },
    ])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-04-16') }, [])
  })

  test('peut faire uniquement une decision annulation par le juge administratif après une décision implicite', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-01') },
      {
        ...ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
        date: toCaminoDate('2020-01-01'),
      },
      {
        ...ETES.decisionDuProprietaireDuSol.FAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
      { ...ETES.noteInterneSignalee.FAIT, date: toCaminoDate('2022-04-10') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-11') },
      { ...ETES.decisionImplicite.REJETE, date: toCaminoDate('2022-04-12') },
    ])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-04-12') }, ['FAIRE_NOTE_INTERNE_SIGNALEE', 'RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF'])
  })

  test('peut classer sans suite après une décision du propriétaire du sol défavorable', () => {
    const etapes = [
      {
        ...ETES.decisionDuProprietaireDuSol.DEFAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
      { ...ETES.classementSansSuite.FAIT, date: toCaminoDate('2022-04-10') },
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-04-10') }, [])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([])
  })

  test('après une décision du propriétaire du sol défavorable, la DGTM est en attente', () => {
    const etapes = [
      {
        ...ETES.decisionDuProprietaireDuSol.DEFAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2020-01-01') }, ['FAIRE_CLASSEMENT_SANS_SUITE'])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([ADMINISTRATION_IDS['DGTM - GUYANE']])
  })

  test('ne peut pas faire deux fois la même étape à la même date', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-01') },
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-01') },
    ]
    expect(() => orderAndInterpretMachine(axmOctMachine, etapes)).toThrowErrorMatchingSnapshot()
  })

  test('peut faire un octroi complet', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-01') },
      {
        ...ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
        date: toCaminoDate('2020-01-01'),
      },
      {
        ...ETES.decisionDuProprietaireDuSol.FAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
      { ...ETES.noteInterneSignalee.FAIT, date: toCaminoDate('2022-04-10') },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-11') },
      {
        ...ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: toCaminoDate('2022-04-11'),
      },
      {
        ...ETES.receptionDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: toCaminoDate('2022-04-11'),
      },
      {
        ...ETES.recevabiliteDeLaDemande.DEFAVORABLE,
        date: toCaminoDate('2022-04-12'),
      },
      {
        ...ETES.modificationDeLaDemande.FAIT,
        date: toCaminoDate('2022-04-13'),
      },
      {
        ...ETES.recevabiliteDeLaDemande.FAVORABLE,
        date: toCaminoDate('2022-04-15'),
      },
      {
        ...ETES.saisineDesCollectivitesLocales.FAIT,
        date: toCaminoDate('2022-04-16'),
      },
      { ...ETES.avisDunMaire.FAVORABLE, date: toCaminoDate('2022-04-17') },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-18') },
      {
        ...ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement.FAVORABLE,
        date: toCaminoDate('2022-05-20'),
      },
      {
        ...ETES.saisineDeLaCommissionDepartementaleDesMines_CDM_.FAIT,
        date: toCaminoDate('2022-05-21'),
      },
      {
        ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE,
        date: toCaminoDate('2022-05-22'),
      },
      {
        ...ETES.saisineDeLautoriteSignataire.FAIT,
        date: toCaminoDate('2022-05-23'),
      },
      {
        ...ETES.decisionDeLadministration.ACCEPTE,
        date: toCaminoDate('2022-05-24'),
      },
      {
        ...ETES.notificationDesCollectivitesLocales.FAIT,
        date: toCaminoDate('2022-05-25'),
      },
      {
        ...ETES.publicationDansUnJournalLocalOuNational.FAIT,
        date: toCaminoDate('2022-05-26'),
      },
      {
        ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
        date: toCaminoDate('2022-05-27'),
      },
      { ...ETES.notificationAuDemandeur.FAIT, date: toCaminoDate('2022-05-28') },
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-08-28') }, ['FAIRE_NOTE_INTERNE_SIGNALEE'])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([])
  })

  test('peut rendre l’avis DREAL que 30 jours après la saisine des services', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-01') },
      {
        ...ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
        date: toCaminoDate('2020-01-01'),
      },
      {
        ...ETES.decisionDuProprietaireDuSol.FAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
      { ...ETES.depotDeLaDemande.FAIT, date: toCaminoDate('2022-04-11') },
      {
        ...ETES.recevabiliteDeLaDemande.FAVORABLE,
        date: toCaminoDate('2022-04-15'),
      },
      {
        ...ETES.saisineDesCollectivitesLocales.FAIT,
        date: toCaminoDate('2022-04-16'),
      },
      { ...ETES.avisDesServicesEtCommissionsConsultatives.FAIT, date: toCaminoDate('2022-04-18') },
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-05-18') }, [
      'RENDRE_AVIS_DREAL',
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'DEMANDER_INFORMATION_POUR_AVIS_DREAL',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'RENDRE_AVIS_DUN_MAIRE',
    ])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-05-17') }, [
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'DEMANDER_INFORMATION_POUR_AVIS_DREAL',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'RENDRE_AVIS_DUN_MAIRE',
    ])
  })

  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    interpretMachine(axmOctMachine, demarche.etapes)
    expect(axmOctMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique,
    })
  })
})
