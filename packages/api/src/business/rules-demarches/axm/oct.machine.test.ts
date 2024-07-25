import { interpretMachine, orderAndInterpretMachine, setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { AxmOctMachine } from './oct.machine'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { toCaminoDate } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'
const etapesProd = require('./2020-09-30-oct.cas.json')

describe('vérifie l’arbre d’octroi d’AXM', () => {
  const axmOctMachine = new AxmOctMachine()
  test('peut créer une "mdp" après une "mfr", "dae" et "asl"', () => {
    const etapes = [ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE, ETES.decisionDuProprietaireDuSol.FAVORABLE, ETES.demande.FAIT, ETES.depotDeLaDemande.FAIT]
    const { service, dateFin, etapes: fullEtapes } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2020-01-01', etapes)
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: dateFin }, [
      'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE',
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE',
      'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE',
      'RENDRE_DECISION_IMPLICITE_REJET',
    ])
    expect(axmOctMachine.whoIsBlocking(fullEtapes)).toStrictEqual([ADMINISTRATION_IDS['DGTM - GUYANE']])
  })

  test('peut créer une "mdp" après une "mfr", "asl", "dae" requise', () => {
    const etapes = [
      ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.REQUIS,
      ETES.decisionDuProprietaireDuSol.FAVORABLE,
      ETES.modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.FAIT,
      ETES.demande.FAIT,
      ETES.depotDeLaDemande.FAIT,
    ]
    const { service, dateFin, etapes: fullEtapes } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2020-01-01', etapes)
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: dateFin }, [
      'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE',
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE',
      'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE',
      'RENDRE_DECISION_IMPLICITE_REJET',
    ])
    expect(axmOctMachine.whoIsBlocking(fullEtapes)).toStrictEqual([ADMINISTRATION_IDS['DGTM - GUYANE']])
  })

  test('ne peut pas créer une "mdp" avec une "dae" requise', () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2020-01-01', [
      ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.REQUIS,
      ETES.decisionDuProprietaireDuSol.FAVORABLE,
      ETES.demande.FAIT,
    ])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: dateFin }, [
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'MODIFIER_DEMANDE_APRES_DAE',
    ])
  })

  test('peut faire l’avis du DREAL sans aucun autre avis 30 jours après la saisine des services', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      {
        ...ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
        date: toCaminoDate('2020-01-01'),
      },
      {
        ...ETES.decisionDuProprietaireDuSol.FAVORABLE,
        date: toCaminoDate('2020-01-01'),
      },
      { ...ETES.demande.FAIT, date: toCaminoDate('2022-04-14') },
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
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2020-02-06', [
      { etapeTypeId: 'mfr', etapeStatutId: 'fai' },
      { etapeTypeId: 'dae', etapeStatutId: 'req' },
      { etapeTypeId: 'asl', etapeStatutId: 'def' },
      { etapeTypeId: 'des', etapeStatutId: 'fai' },
    ])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: dateFin }, [])
  })

  test('peut faire uniquement une decision annulation par le juge administratif après une décision implicite', () => {
    const { service, dateFin } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2020-01-01', [
      ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
      ETES.decisionDuProprietaireDuSol.FAVORABLE,
      ETES.demande.FAIT,
      ETES.noteInterneSignalee.FAIT,
      ETES.depotDeLaDemande.FAIT,
      ETES.decisionImplicite.REJETE,
    ])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: dateFin }, ['FAIRE_NOTE_INTERNE_SIGNALEE', 'RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF'])
  })

  test('peut classer sans suite après une décision du propriétaire du sol défavorable', () => {
    const { service, etapes, dateFin } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2022-04-10', [ETES.decisionDuProprietaireDuSol.DEFAVORABLE, ETES.classementSansSuite.FAIT])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: dateFin }, [])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([])
  })

  test('après une décision du propriétaire du sol défavorable, la DGTM est en attente', () => {
    const { service, dateFin, etapes } = setDateAndOrderAndInterpretMachine(axmOctMachine, '2020-01-01', [ETES.decisionDuProprietaireDuSol.DEFAVORABLE])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: dateFin }, ['FAIRE_CLASSEMENT_SANS_SUITE'])
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
      { ...ETES.avisDesCollectivites.FAIT, date: toCaminoDate('2022-04-17') },
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
      'RENDRE_AVIS_DES_COLLECTIVITES',
    ])
    expect(service).canOnlyTransitionTo({ machine: axmOctMachine, date: toCaminoDate('2022-05-17') }, [
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'DEMANDER_INFORMATION_POUR_AVIS_DREAL',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'RENDRE_AVIS_DES_COLLECTIVITES',
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
