import { assign, setup } from 'xstate'
import { CaminoMachine } from '../machine-helper'
import { CaminoCommonContext, DBEtat } from '../machine-common'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { CaminoDate, isBefore, toCaminoDate } from 'camino-common/src/date'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'
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
  | { type: 'DEPOSER_DEMANDE' }
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

type Event = ProcedureSimplifieeXStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: ETES.demande, mainStep: true },
  DEPOSER_DEMANDE: { db: ETES.depotDeLaDemande, mainStep: true },
  OUVRIR_PARTICIPATION_DU_PUBLIC: { db: ETES.participationDuPublic, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: { db: { ACCEPTE: ETES.decisionDeLadministration.ACCEPTE }, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_REJETEE: { db: { REJETE: ETES.decisionDeLadministration.REJETE }, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE: { db: { REJETE_DECISION_IMPLICITE: ETES.decisionDeLadministration.REJETE_DECISION_IMPLICITE }, mainStep: true },
  PUBLIER_DECISION_ACCEPTEE_AU_JORF: { db: { FAIT: ETES.publicationDeDecisionAuJORF.FAIT }, mainStep: true },
  PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: { db: ETES.publicationDeDecisionAuRecueilDesActesAdministratifs, mainStep: true },
  CLASSER_SANS_SUITE: { db: ETES.classementSansSuite, mainStep: false },
  DESISTER_PAR_LE_DEMANDEUR: { db: ETES.desistementDuDemandeur, mainStep: false },
  DEMANDER_INFORMATION: { db: ETES.demandeDinformations, mainStep: false },
  RECEVOIR_INFORMATION: { db: ETES.receptionDinformation, mainStep: false },
  FAIRE_ABROGATION: { db: ETES.abrogationDeLaDecision, mainStep: true },
  SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE: { db: ETES.informationsHistoriquesIncompletes, mainStep: false },
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
  depotDeLaDemandeFaite: boolean
  ouverturePublicStatut: EtapeStatutId | null
}
const defaultDemarcheStatut = DemarchesStatutsIds.EnConstruction
const procedureHistoriqueDateMax = toCaminoDate('2024-07-01')
const procedureIncompleteDateMax = toCaminoDate('2000-01-01')
const procedureSimplifieeMachine = setup({
  types: {} as { context: ProcedureSimplifieeContext; events: ProcedureSimplifieeXStateEvent },
  guards: {
    isProcedureHistorique: ({ context, event }) => 'date' in event && isBefore(event.date, procedureHistoriqueDateMax) && context.demarcheStatut === defaultDemarcheStatut,
    isProcedureIncomplete: ({ context, event }) => 'date' in event && isBefore(event.date, procedureIncompleteDateMax) && context.demarcheStatut === defaultDemarcheStatut,
    isDemarcheEnInstruction: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
  },
}).createMachine({
  id: 'ProcedureSimplifiee',
  initial: 'demandeAFaire',
  context: {
    demarcheStatut: defaultDemarcheStatut,
    visibilite: 'confidentielle',
    depotDeLaDemandeFaite: false,
    ouverturePublicStatut: null,
  },
  on: {
    RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: {
      guard: 'isProcedureHistorique',
      target: '.publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire',
      actions: assign({
        visibilite: 'publique',
        demarcheStatut: DemarchesStatutsIds.Accepte,
      }),
    },
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
      guard: 'isDemarcheEnInstruction',
      target: '.finDeMachine',
      actions: assign({
        demarcheStatut: DemarchesStatutsIds.ClasseSansSuite,
      }),
    },
    DESISTER_PAR_LE_DEMANDEUR: {
      guard: 'isDemarcheEnInstruction',
      target: '.finDeMachine',
      actions: assign({
        demarcheStatut: DemarchesStatutsIds.Desiste,
      }),
    },
    DEMANDER_INFORMATION: {
      guard: 'isDemarcheEnInstruction',
      actions: assign({}),
    },
    RECEVOIR_INFORMATION: {
      guard: 'isDemarcheEnInstruction',
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
        DEPOSER_DEMANDE: {
          guard: ({ context }) => !context.depotDeLaDemandeFaite && isNullOrUndefined(context.ouverturePublicStatut),
          target: 'receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire',
          actions: assign({
            depotDeLaDemandeFaite: true,
          }),
        },
        OUVRIR_PARTICIPATION_DU_PUBLIC: {
          guard: ({ context }) => isNullOrUndefined(context.ouverturePublicStatut),
          actions: assign({
            ouverturePublicStatut: ({ event }) => event.status,
            visibilite: ({ event }) => (event.status === ETAPES_STATUTS.PROGRAMME ? 'confidentielle' : 'publique'),
          }),
          target: 'receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire',
        },
        RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: {
          guard: ({ context }) => isNullOrUndefined(context.ouverturePublicStatut) || context.ouverturePublicStatut === ETAPES_STATUTS.TERMINE,
          actions: assign({
            visibilite: 'publique',
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
          target: 'publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire',
        },
        RENDRE_DECISION_ADMINISTRATION_REJETEE: {
          guard: ({ context }) => isNullOrUndefined(context.ouverturePublicStatut) || context.ouverturePublicStatut === ETAPES_STATUTS.TERMINE,
          actions: assign({
            visibilite: 'confidentielle',
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
          target: 'finDeMachine',
        },
        RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE: {
          guard: ({ context }) => isNullOrUndefined(context.ouverturePublicStatut) || context.ouverturePublicStatut === ETAPES_STATUTS.TERMINE,
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
            guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.Accepte,
            target: 'abrogationAFaire',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.AccepteEtPublie }),
          },
          {
            guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.AccepteEtPublie,
            target: 'finDeMachine',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.RejeteApresAbrogation }),
          },
        ],
        PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: [
          {
            guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.Accepte,
            target: 'abrogationAFaire',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.AccepteEtPublie }),
          },
          {
            guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.AccepteEtPublie,
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
        FAIRE_ABROGATION: 'publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire',
      },
    },
    finDeMachine: {
      type: 'final',
    },
  },
})
