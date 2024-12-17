import { and, assign, not, setup } from 'xstate'
import { CaminoMachine } from '../machine-helper'
import { CaminoCommonContext, DBEtat, globalGuards } from '../machine-common'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { CaminoDate, isBefore, toCaminoDate } from 'camino-common/src/date'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'

type SaisirInformationHistoriqueIncomplete = {
  date: CaminoDate
  type: 'SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE'
}
type RendreDecisionAdministrationAcceptee = {
  date: CaminoDate
  type: 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE'
}
type RendreDecisionAdministrationRejetee = {
  date: CaminoDate
  type: 'RENDRE_DECISION_ADMINISTRATION_REJETEE'
}
type RendreDecisionAdministrationRejeteeDecisionImplicite = {
  date: CaminoDate
  type: 'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE'
}
type PublierDecisionAccepteeAuJORF = {
  date: CaminoDate
  type: 'PUBLIER_DECISION_ACCEPTEE_AU_JORF'
}
type PublierDecisionAuRecueilDesActesAdministratifs = {
  date: CaminoDate
  type: 'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS'
}

type ParticipationDuPublic = {
  status: EtapeStatutId
  type: 'OUVRIR_PARTICIPATION_DU_PUBLIC'
}

type ProcedureSimplifieeXStateEvent =
  | { type: 'FAIRE_DEMANDE' }
  | { type: 'ENREGISTRER_DEMANDE' }
  | ParticipationDuPublic
  | RendreDecisionAdministrationAcceptee
  | RendreDecisionAdministrationRejetee
  | RendreDecisionAdministrationRejeteeDecisionImplicite
  | SaisirInformationHistoriqueIncomplete
  | PublierDecisionAccepteeAuJORF
  | PublierDecisionAuRecueilDesActesAdministratifs
  | { type: 'CLASSER_SANS_SUITE' }
  | { type: 'DESISTER_PAR_LE_DEMANDEUR' }
  | { type: 'DEMANDER_INFORMATION' }
  | { type: 'RECEVOIR_INFORMATION' }
  | { type: 'FAIRE_ABROGATION' }
  | { type: 'RENDRE_AVIS_COLLECTIVITES' }
  | { type: 'RENDRE_AVIS_SERVICES_COMMISSIONS' }
  | { type: 'RENDRE_AVIS_PREFET' }

type Event = ProcedureSimplifieeXStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: ETES.demande, mainStep: true },
  ENREGISTRER_DEMANDE: { db: ETES.enregistrementDeLaDemande, mainStep: true },
  OUVRIR_PARTICIPATION_DU_PUBLIC: { db: ETES.participationDuPublic, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: { db: { ACCEPTE: ETES.decisionDeLAutoriteAdministrative.ACCEPTE }, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_REJETEE: { db: { REJETE: ETES.decisionDeLAutoriteAdministrative.REJETE }, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE: { db: { REJETE_DECISION_IMPLICITE: ETES.decisionDeLAutoriteAdministrative.REJETE_DECISION_IMPLICITE }, mainStep: true },
  PUBLIER_DECISION_ACCEPTEE_AU_JORF: { db: { FAIT: ETES.publicationDeDecisionAuJORF.FAIT }, mainStep: true },
  PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: { db: ETES.publicationDeDecisionAuRecueilDesActesAdministratifs, mainStep: true },
  CLASSER_SANS_SUITE: { db: ETES.classementSansSuite, mainStep: false },
  DESISTER_PAR_LE_DEMANDEUR: { db: ETES.desistementDuDemandeur, mainStep: false },
  DEMANDER_INFORMATION: { db: ETES.demandeDinformations, mainStep: false },
  RECEVOIR_INFORMATION: { db: ETES.receptionDinformation, mainStep: false },
  FAIRE_ABROGATION: { db: ETES.abrogationDeLaDecision, mainStep: true },
  SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE: { db: ETES.informationsHistoriquesIncompletes, mainStep: false },
  RENDRE_AVIS_COLLECTIVITES: { db: ETES.avisDesCollectivites, mainStep: true },
  RENDRE_AVIS_SERVICES_COMMISSIONS: { db: ETES.avisDesServicesEtCommissionsConsultatives, mainStep: true },
  RENDRE_AVIS_PREFET: { db: ETES.avisDuPrefet, mainStep: true },
}

// basé sur https://drive.google.com/file/d/16lXyw3pcuiP-rHkBBM0U2Al9sWHKCBP9/view
export class ProcedureSimplifieeMachine extends CaminoMachine<ProcedureSimplifieeContext, ProcedureSimplifieeXStateEvent> {
  constructor() {
    super(procedureSimplifieeMachine, trad)
  }

  override toPotentialCaminoXStateEvent(event: ProcedureSimplifieeXStateEvent['type'], date: CaminoDate): ProcedureSimplifieeXStateEvent[] {
    switch (event) {
      case 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE':
      case 'RENDRE_DECISION_ADMINISTRATION_REJETEE':
      case 'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE':
      case 'SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE':
      case 'PUBLIER_DECISION_ACCEPTEE_AU_JORF':
      case 'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS':
        return [{ type: event, date }]
      case 'OUVRIR_PARTICIPATION_DU_PUBLIC':
        return [
          { type: event, status: ETAPES_STATUTS.PROGRAMME },
          { type: event, status: ETAPES_STATUTS.EN_COURS },
          { type: event, status: ETAPES_STATUTS.TERMINE },
        ]
      default:
        return super.toPotentialCaminoXStateEvent(event, date)
    }
  }
}

interface ProcedureSimplifieeContext extends CaminoCommonContext {
  enregistrementDeLaDemandeFaite: boolean
  ouverturePublicStatut: 'pas faite' | 'en cours' | 'terminée'
  avisDuPrefetStatut: 'pas fait' | 'à faire' | 'fait'
  avisDesCollectivitesFait: boolean
  avisDesServicesEtCommissionsFait: boolean
  abrogationFaite: boolean
}
const defaultDemarcheStatut = DemarchesStatutsIds.EnConstruction
const procedureHistoriqueDateMax = toCaminoDate('2024-07-01')
const procedureIncompleteDateMax = toCaminoDate('2000-01-01')
const procedureSimplifieeMachine = setup({
  types: {} as { context: ProcedureSimplifieeContext; events: ProcedureSimplifieeXStateEvent },
  guards: {
    isProcedureHistorique: ({ context, event }) => 'date' in event && isBefore(event.date, procedureHistoriqueDateMax) && context.demarcheStatut === defaultDemarcheStatut,
    isProcedureIncomplete: ({ context, event }) => 'date' in event && isBefore(event.date, procedureIncompleteDateMax) && context.demarcheStatut === defaultDemarcheStatut,
    enregistrementDeLaDemandeFaisable: ({ context }) => !context.enregistrementDeLaDemandeFaite && context.ouverturePublicStatut === 'pas faite' && context.avisDuPrefetStatut === 'pas fait',
    decisionAdministrativeFaisable: ({ context }) =>
      (context.ouverturePublicStatut === 'pas faite' || context.ouverturePublicStatut === 'terminée') && (context.avisDuPrefetStatut === 'pas fait' || context.avisDuPrefetStatut === 'fait'),
    avisDesCollectivitesAFaire: ({ context }) => context.avisDesCollectivitesFait === false && (context.avisDuPrefetStatut === 'pas fait' || context.avisDuPrefetStatut === 'à faire'),
    avisDesServicesEtCommissionsAFaire: ({ context }) => context.avisDesServicesEtCommissionsFait === false && (context.avisDuPrefetStatut === 'pas fait' || context.avisDuPrefetStatut === 'à faire'),
    avisDuPrefetARendre: ({ context }) => context.avisDuPrefetStatut === 'à faire',
    isDecisionAvantPremierJuillet2024: ({ event }) => 'date' in event && isBefore(event.date, procedureHistoriqueDateMax),
    isDecisionApresPremierJuillet2024: ({ event }) => 'date' in event && !isBefore(event.date, procedureHistoriqueDateMax),
    isAbrogationFaite: ({ context }) => context.abrogationFaite,
    ...globalGuards,
  },
}).createMachine({
  id: 'ProcedureSimplifiee',
  initial: 'demandeAFaire',
  context: {
    demarcheStatut: defaultDemarcheStatut,
    visibilite: 'confidentielle',
    enregistrementDeLaDemandeFaite: false,
    ouverturePublicStatut: 'pas faite',
    abrogationFaite: false,
    avisDuPrefetStatut: 'pas fait',
    avisDesCollectivitesFait: false,
    avisDesServicesEtCommissionsFait: false,
  },
  on: {
    RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: [
      {
        guard: 'isProcedureHistorique',
        target: '.publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire',
        actions: assign({
          visibilite: 'publique',
          demarcheStatut: DemarchesStatutsIds.AccepteEtPublie,
        }),
      },
      {
        guard: and(['isDecisionApresPremierJuillet2024', 'isDemarcheStatutEnConstruction']),
        target: '.publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire',
        actions: assign({
          visibilite: 'publique',
          demarcheStatut: DemarchesStatutsIds.Accepte,
        }),
      },
    ],
    PUBLIER_DECISION_ACCEPTEE_AU_JORF: {
      guard: 'isProcedureIncomplete',
      target: '.abrogationAFaire',
      actions: assign({
        visibilite: 'publique',
        demarcheStatut: DemarchesStatutsIds.AccepteEtPublie,
      }),
    },
    PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: {
      guard: 'isProcedureIncomplete',
      target: '.abrogationAFaire',
      actions: assign({
        visibilite: 'publique',
        demarcheStatut: DemarchesStatutsIds.AccepteEtPublie,
      }),
    },
    SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE: {
      guard: 'isProcedureIncomplete',
      target: '.finDeMachine',
      actions: assign({
        visibilite: 'confidentielle',
        demarcheStatut: DemarchesStatutsIds.Accepte,
      }),
    },
    RENDRE_DECISION_ADMINISTRATION_REJETEE: {
      guard: 'isProcedureHistorique',
      target: '.publicationAuJorfApresRejetAFaire',
      actions: assign({
        visibilite: 'confidentielle',
        demarcheStatut: DemarchesStatutsIds.Rejete,
      }),
    },
    RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE: {
      guard: 'isProcedureHistorique',
      target: '.finDeMachine',
      actions: assign({
        visibilite: 'publique',
        demarcheStatut: DemarchesStatutsIds.Rejete,
      }),
    },
    CLASSER_SANS_SUITE: {
      guard: 'isDemarcheStatutEnInstruction',
      target: '.finDeMachine',
      actions: assign({
        demarcheStatut: DemarchesStatutsIds.ClasseSansSuite,
      }),
    },
    DESISTER_PAR_LE_DEMANDEUR: {
      guard: 'isDemarcheStatutEnInstruction',
      target: '.finDeMachine',
      actions: assign({
        demarcheStatut: DemarchesStatutsIds.Desiste,
      }),
    },
    DEMANDER_INFORMATION: {
      guard: 'isDemarcheStatutEnInstruction',
      actions: assign({}),
    },
    RECEVOIR_INFORMATION: {
      guard: 'isDemarcheStatutEnInstruction',
      actions: assign({}),
    },
  },
  states: {
    demandeAFaire: {
      on: {
        FAIRE_DEMANDE: {
          target: 'receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.EnInstruction,
          }),
        },
      },
    },
    receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire: {
      on: {
        ENREGISTRER_DEMANDE: {
          guard: 'enregistrementDeLaDemandeFaisable',
          target: 'receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire',
          actions: assign({
            enregistrementDeLaDemandeFaite: true,
          }),
        },
        OUVRIR_PARTICIPATION_DU_PUBLIC: {
          guard: ({ context }) => context.ouverturePublicStatut === 'pas faite',
          actions: assign({
            ouverturePublicStatut: ({ event }) => (event.status === ETAPES_STATUTS.TERMINE ? 'terminée' : 'en cours'),
            visibilite: ({ event }) => (event.status === ETAPES_STATUTS.PROGRAMME ? 'confidentielle' : 'publique'),
          }),
          target: 'receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire',
        },
        RENDRE_AVIS_COLLECTIVITES: {
          guard: 'avisDesCollectivitesAFaire',
          target: 'receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire',
          actions: assign({
            avisDesCollectivitesFait: true,
            avisDuPrefetStatut: 'à faire',
          }),
        },
        RENDRE_AVIS_SERVICES_COMMISSIONS: {
          guard: 'avisDesServicesEtCommissionsAFaire',
          target: 'receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire',
          actions: assign({
            avisDesServicesEtCommissionsFait: true,
            avisDuPrefetStatut: 'à faire',
          }),
        },
        RENDRE_AVIS_PREFET: {
          guard: 'avisDuPrefetARendre',
          target: 'receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire',
          actions: assign({
            avisDuPrefetStatut: 'fait',
          }),
        },
        RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: [
          {
            guard: and(['decisionAdministrativeFaisable', 'isDecisionApresPremierJuillet2024']),
            actions: assign({
              visibilite: 'publique',
              demarcheStatut: DemarchesStatutsIds.Accepte,
            }),
            target: 'publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire',
          },
          {
            guard: and(['decisionAdministrativeFaisable', 'isDecisionAvantPremierJuillet2024']),
            actions: assign({
              visibilite: 'publique',
              demarcheStatut: DemarchesStatutsIds.AccepteEtPublie,
            }),
            target: 'publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire',
          },
        ],
        RENDRE_DECISION_ADMINISTRATION_REJETEE: {
          guard: 'decisionAdministrativeFaisable',
          actions: assign({
            visibilite: 'confidentielle',
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
          target: 'finDeMachine',
        },
        RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE: {
          guard: 'decisionAdministrativeFaisable',
          actions: assign({
            visibilite: 'publique',
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
          target: 'finDeMachine',
        },
      },
    },
    publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire: {
      on: {
        PUBLIER_DECISION_ACCEPTEE_AU_JORF: [
          {
            guard: not('isAbrogationFaite'),
            target: 'abrogationAFaire',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.AccepteEtPublie }),
          },
          {
            guard: 'isAbrogationFaite',
            target: 'finDeMachine',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.RejeteApresAbrogation }),
          },
        ],
        PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: [
          {
            guard: not('isAbrogationFaite'),
            target: 'abrogationAFaire',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.AccepteEtPublie }),
          },
          {
            guard: 'isAbrogationFaite',
            target: 'finDeMachine',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.RejeteApresAbrogation }),
          },
        ],
      },
    },
    publicationAuJorfApresRejetAFaire: {
      on: {
        PUBLIER_DECISION_ACCEPTEE_AU_JORF: 'finDeMachine',
      },
    },
    abrogationAFaire: {
      on: {
        FAIRE_ABROGATION: {
          actions: assign({ abrogationFaite: true }),
          target: 'publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire',
        },
      },
    },
    finDeMachine: {
      type: 'final',
    },
  },
})
