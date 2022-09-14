import {
  interpretMachine,
  orderAndInterpretMachine
} from '../machine-test-helper'
import { AxmOctMachine } from './oct.machine'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
const etapesProd = require('./oct.cas.json')

describe('vérifie l’arbre d’octroi d’AXM', () => {
  const axmOctMachine = new AxmOctMachine()
  test('peut créer une "mdp" après une "mfr", "dae" et "asl"', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: '2022-04-14' },
      {
        ...ETES
          .decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_
          .EXEMPTE,
        date: '2020-01-01'
      },
      { ...ETES.decisionDuProprietaireDuSol.FAVORABLE, date: '2020-01-01' },
      { ...ETES.depotDeLaDemande.FAIT, date: '2022-04-15' }
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo(axmOctMachine, [
      'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE',
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE',
      'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE',
      'RENDRE_DECISION_IMPLICITE_REJET'
    ])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([
      ADMINISTRATION_IDS['DGTM - GUYANE']
    ])
  })

  test('peut créer une "mdp" après une "mfr", "asl", "dae" requise', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: '2022-04-14' },
      {
        ...ETES
          .decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_
          .REQUIS,
        date: '2020-01-01'
      },
      {
        ...ETES
          .modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_
          .FAIT,
        date: '2020-01-02'
      },
      { ...ETES.decisionDuProprietaireDuSol.FAVORABLE, date: '2020-01-01' },
      { ...ETES.depotDeLaDemande.FAIT, date: '2022-04-15' }
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo(axmOctMachine, [
      'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE',
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE',
      'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE',
      'RENDRE_DECISION_IMPLICITE_REJET'
    ])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([
      ADMINISTRATION_IDS['DGTM - GUYANE']
    ])
  })

  test('ne peut pas créer une "mdp" avec une "dae" requise', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      { ...ETES.demande.FAIT, date: '2022-04-14' },
      {
        ...ETES
          .decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_
          .REQUIS,
        date: '2020-01-01'
      },
      { ...ETES.decisionDuProprietaireDuSol.FAVORABLE, date: '2020-01-01' }
    ])
    expect(service).canOnlyTransitionTo(axmOctMachine, [
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'MODIFIER_DEMANDE_APRES_DAE'
    ])
  })

  test('peut faire l’avis du DREAL sans aucun autre avis', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      { ...ETES.demande.FAIT, date: '2022-04-14' },
      {
        ...ETES
          .decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_
          .EXEMPTE,
        date: '2020-01-01'
      },
      { ...ETES.decisionDuProprietaireDuSol.FAVORABLE, date: '2020-01-01' },
      { ...ETES.depotDeLaDemande.FAIT, date: '2022-04-15' },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: '2022-04-15' },
      { ...ETES.saisineDesCollectivitesLocales.FAIT, date: '2022-04-15' },
      { ...ETES.saisineDesServices.FAIT, date: '2022-04-15' },
      {
        ...ETES
          .avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement
          .FAVORABLE,
        date: '2022-04-15'
      }
    ])
    expect(service).canOnlyTransitionTo(axmOctMachine, [
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES',
      'RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES',
      'RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE'
    ])
  })
  test('peut ajourner l’avis de la commission départementale des mines', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      { ...ETES.demande.FAIT, date: '2022-04-14' },
      {
        ...ETES
          .decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_
          .EXEMPTE,
        date: '2020-01-01'
      },
      { ...ETES.decisionDuProprietaireDuSol.FAVORABLE, date: '2020-01-01' },
      { ...ETES.depotDeLaDemande.FAIT, date: '2022-04-15' },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: '2022-04-15' },
      { ...ETES.saisineDesCollectivitesLocales.FAIT, date: '2022-04-15' },
      { ...ETES.saisineDesServices.FAIT, date: '2022-04-15' },
      {
        ...ETES
          .avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement
          .FAVORABLE,
        date: '2022-04-15'
      },
      {
        ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.AJOURNE,
        date: '2022-04-16'
      },
      {
        ...ETES
          .avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement
          .FAVORABLE,
        date: '2022-04-17'
      },
      {
        ...ETES.saisineDeLaCommissionDepartementaleDesMines_CDM_.FAIT,
        date: '2022-04-18'
      },
      {
        ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE,
        date: '2022-04-18'
      }
    ])
    expect(service).canOnlyTransitionTo(axmOctMachine, [
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'FAIRE_SAISINE_AUTORITE_SIGNATAIRE',
      'RENDRE_DECISION_ADMINISTRATION_ACCEPTE',
      'RENDRE_DECISION_ADMINISTRATION_REJETE'
    ])
  })
  test('après une saisine des services avec un accord du propriétaire du sol AVEC réserves, la confirmation de l’accord est obligatoire', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      { ...ETES.demande.FAIT, date: '2022-04-14' },
      {
        ...ETES
          .decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_
          .EXEMPTE,
        date: '2020-01-01'
      },
      {
        ...ETES.decisionDuProprietaireDuSol.FAVORABLE_AVEC_RESERVE,
        date: '2020-01-01'
      },
      { ...ETES.depotDeLaDemande.FAIT, date: '2022-04-15' },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: '2022-04-15' },
      { ...ETES.saisineDesCollectivitesLocales.FAIT, date: '2022-04-15' },
      { ...ETES.avisDunMaire.FAVORABLE, date: '2022-04-15' },
      { ...ETES.saisineDesServices.FAIT, date: '2022-04-15' },
      {
        ...ETES.avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_
          .FAVORABLE,
        date: '2022-04-15'
      },
      {
        ...ETES.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_
          .FAVORABLE,
        date: '2022-04-16'
      },
      {
        ...ETES
          .avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi
          .FAVORABLE,
        date: '2022-04-16'
      },
      {
        ...ETES.avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet
          .FAVORABLE,
        date: '2022-04-16'
      },
      {
        ...ETES.avisDeDirectionRegionaleDesAffairesCulturelles.FAVORABLE,
        date: '2022-04-16'
      },
      { ...ETES.avisDeLagenceRegionaleDeSante.FAVORABLE, date: '2022-04-16' },
      {
        ...ETES.avisDeLaDirectionRegionaleDesFinancesPubliques.FAVORABLE,
        date: '2022-04-16'
      },
      {
        ...ETES.avisDeLaCaisseGeneraleDeSecuriteSociale.FAVORABLE,
        date: '2022-04-16'
      },
      { ...ETES.avisDeLOfficeNationalDesForets.FAVORABLE, date: '2022-04-16' },
      {
        ...ETES.avisDeLetatMajorOrpaillageEtPecheIllicite_EMOPI_.FAVORABLE,
        date: '2022-04-16'
      },
      { ...ETES.avisDeLaGendarmerieNationale.FAVORABLE, date: '2022-04-16' }
    ])

    expect(service).canOnlyTransitionTo(axmOctMachine, [
      'DEMANDER_INFORMATION_POUR_AVIS_DREAL',
      'FAIRE_CLASSEMENT_SANS_SUITE',
      'FAIRE_CONFIRMATION_PROPRIETAIRE_DU_SOL',
      'FAIRE_DESISTEMENT_DEMANDEUR',
      'FAIRE_NOTE_INTERNE_SIGNALEE'
    ])
  })

  test('ne peut pas faire de note interne signalée avant une demande', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [])
    expect(service).canOnlyTransitionTo(axmOctMachine, [
      'RENDRE_DAE_REQUISE',
      'RENDRE_DAE_EXEMPTEE',
      'FAIRE_DEMANDE',
      'RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_DEFAVORABLE',
      'RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_FAVORABLE',
      'RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_FAVORABLE_AVEC_RESERVE'
    ])
  })

  test('peut faire uniquement une decision annulation par le juge administratif après une décision implicite', () => {
    const service = orderAndInterpretMachine(axmOctMachine, [
      { ...ETES.demande.FAIT, date: '2022-04-01' },
      {
        ...ETES
          .decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_
          .EXEMPTE,
        date: '2020-01-01'
      },
      { ...ETES.decisionDuProprietaireDuSol.FAVORABLE, date: '2020-01-01' },
      { ...ETES.noteInterneSignalee.FAIT, date: '2022-04-10' },
      { ...ETES.depotDeLaDemande.FAIT, date: '2022-04-11' },
      { ...ETES.decisionImplicite.REJETE, date: '2022-04-12' }
    ])
    expect(service).canOnlyTransitionTo(axmOctMachine, [
      'FAIRE_NOTE_INTERNE_SIGNALEE',
      'RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF'
    ])
  })

  test('peut classer sans suite après une décision du propriétaire du sol défavorable', () => {
    const etapes = [
      { ...ETES.decisionDuProprietaireDuSol.DEFAVORABLE, date: '2020-01-01' },
      { ...ETES.classementSansSuite.FAIT, date: '2022-04-10' }
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo(axmOctMachine, [])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([])
  })

  test('après une décision du propriétaire du sol défavorable, la DGTM est en attente', () => {
    const etapes = [
      { ...ETES.decisionDuProprietaireDuSol.DEFAVORABLE, date: '2020-01-01' }
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo(axmOctMachine, [
      'FAIRE_CLASSEMENT_SANS_SUITE'
    ])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([
      ADMINISTRATION_IDS['DGTM - GUYANE']
    ])
  })

  test('peut faire un octroi complet', () => {
    const etapes = [
      { ...ETES.demande.FAIT, date: '2022-04-01' },
      {
        ...ETES
          .decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_
          .EXEMPTE,
        date: '2020-01-01'
      },
      { ...ETES.decisionDuProprietaireDuSol.FAVORABLE, date: '2020-01-01' },
      { ...ETES.noteInterneSignalee.FAIT, date: '2022-04-10' },
      { ...ETES.depotDeLaDemande.FAIT, date: '2022-04-11' },
      {
        ...ETES.demandeDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: '2022-04-11'
      },
      {
        ...ETES.receptionDeComplements_RecevabiliteDeLaDemande_.FAIT,
        date: '2022-04-11'
      },
      { ...ETES.recevabiliteDeLaDemande.DEFAVORABLE, date: '2022-04-12' },
      { ...ETES.modificationDeLaDemande.FAIT, date: '2022-04-13' },
      { ...ETES.recevabiliteDeLaDemande.FAVORABLE, date: '2022-04-15' },
      { ...ETES.saisineDesCollectivitesLocales.FAIT, date: '2022-04-16' },
      { ...ETES.avisDunMaire.FAVORABLE, date: '2022-04-17' },
      { ...ETES.saisineDesServices.FAIT, date: '2022-04-18' },
      {
        ...ETES.avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_
          .FAVORABLE,
        date: '2022-04-19'
      },
      {
        ...ETES
          .avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement
          .FAVORABLE,
        date: '2022-04-20'
      },
      {
        ...ETES.saisineDeLaCommissionDepartementaleDesMines_CDM_.FAIT,
        date: '2022-04-21'
      },
      {
        ...ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE,
        date: '2022-04-22'
      },
      {
        ...ETES.saisineDeLautoriteSignataire.FAIT,
        date: '2022-04-23'
      },
      {
        ...ETES.decisionDeLadministration.ACCEPTE,
        date: '2022-04-24'
      },
      { ...ETES.notificationDesCollectivitesLocales.FAIT, date: '2022-04-25' },
      {
        ...ETES.publicationDansUnJournalLocalOuNational.FAIT,
        date: '2022-04-26'
      },
      {
        ...ETES.publicationDeDecisionAuRecueilDesActesAdministratifs.FAIT,
        date: '2022-04-27'
      },
      { ...ETES.notificationAuDemandeur.FAIT, date: '2022-04-28' }
    ]
    const service = orderAndInterpretMachine(axmOctMachine, etapes)
    expect(service).canOnlyTransitionTo(axmOctMachine, [
      'FAIRE_NOTE_INTERNE_SIGNALEE'
    ])
    expect(axmOctMachine.whoIsBlocking(etapes)).toStrictEqual([])
  })

  // pour regénérer le oct.cas.json: `npm run test:generate-data -w packages/api`
  test.each(etapesProd as any[])('cas réel N°$id', demarche => {
    // ici les étapes sont déjà ordonnées
    interpretMachine(axmOctMachine, demarche.etapes)
    expect(axmOctMachine.demarcheStatut(demarche.etapes)).toStrictEqual({
      demarcheStatut: demarche.demarcheStatutId,
      publique: demarche.demarchePublique
    })
  })
})
