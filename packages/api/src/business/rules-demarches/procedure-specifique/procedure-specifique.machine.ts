import { assign, setup } from 'xstate'
import { CaminoMachine } from '../machine-helper'
import { CaminoCommonContext, DBEtat } from '../machine-common'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { TitreTypeId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes'
// type SaisirInformationHistoriqueIncomplete = {
//   date: CaminoDate
//   type: 'SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE'
// }
// type RendreDecisionAdministrationAcceptee = {
//   date: CaminoDate
//   type: 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE'
// }
// type RendreDecisionAdministrationRejetee = {
//   date: CaminoDate
//   type: 'RENDRE_DECISION_ADMINISTRATION_REJETEE'
// }
// type RendreDecisionAdministrationRejeteeDecisionImplicite = {
//   date: CaminoDate
//   type: 'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE'
// }
// type PublierDecisionAccepteeAuJORF = {
//   date: CaminoDate
//   type: 'PUBLIER_DECISION_ACCEPTEE_AU_JORF'
// }
// type PublierDecisionAuRecueilDesActesAdministratifs = {
//   date: CaminoDate
//   type: 'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS'
// }

// type ParticipationDuPublic = {
//   status: EtapeStatutId
//   type: 'OUVRIR_PARTICIPATION_DU_PUBLIC'
// }

type ProcedureSpecifiqueXStateEvent =
  | { type: 'FAIRE_DEMANDE' }
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'FAIRE_RECEVABILITE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEFAVORABLE' }
  | { type: 'FAIRE_DEMANDE_DE_COMPLEMENTS' }
  | { type: 'RECEVOIR_COMPLEMENTS' }
  | { type: 'FAIRE_DECLARATION_IRRECEVABILITE' }
  | { type: 'NOTIFIER_DEMANDEUR' }

// | ParticipationDuPublic
// | RendreDecisionAdministrationAcceptee
// | RendreDecisionAdministrationRejetee
// | RendreDecisionAdministrationRejeteeDecisionImplicite
// | SaisirInformationHistoriqueIncomplete
// | PublierDecisionAccepteeAuJORF
// | PublierDecisionAuRecueilDesActesAdministratifs
// | { type: 'CLASSER_SANS_SUITE' }
// | { type: 'DESISTER_PAR_LE_DEMANDEUR' }
// | { type: 'DEMANDER_INFORMATION' }
// | { type: 'RECEVOIR_INFORMATION' }
// | { type: 'FAIRE_ABROGATION' }

type Event = ProcedureSpecifiqueXStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: ETES.demande, mainStep: true },
  DEPOSER_DEMANDE: { db: ETES.depotDeLaDemande, mainStep: true },
  FAIRE_RECEVABILITE_FAVORABLE: { db: { FAVORABLE: ETES.recevabiliteDeLaDemande.FAVORABLE }, mainStep: true },
  FAIRE_RECEVABILITE_DEFAVORABLE: { db: { DEFAVORABLE: ETES.recevabiliteDeLaDemande.DEFAVORABLE }, mainStep: false },
  FAIRE_DEMANDE_DE_COMPLEMENTS: { db: ETES.demandeDeComplements, mainStep: false },
  RECEVOIR_COMPLEMENTS: { db: ETES.receptionDeComplements, mainStep: false },
  FAIRE_DECLARATION_IRRECEVABILITE: { db: ETES.declarationDIrrecevabilite, mainStep: false },
  NOTIFIER_DEMANDEUR: { db: ETES.notificationAuDemandeur, mainStep: false },
  // OUVRIR_PARTICIPATION_DU_PUBLIC: { db: ETES.participationDuPublic, mainStep: true },
  // RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: { db: { ACCEPTE: ETES.decisionDeLadministration.ACCEPTE }, mainStep: true },
  // RENDRE_DECISION_ADMINISTRATION_REJETEE: { db: { REJETE: ETES.decisionDeLadministration.REJETE }, mainStep: true },
  // RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE: { db: { REJETE_DECISION_IMPLICITE: ETES.decisionDeLadministration.REJETE_DECISION_IMPLICITE }, mainStep: true },
  // PUBLIER_DECISION_ACCEPTEE_AU_JORF: { db: { FAIT: ETES.publicationDeDecisionAuJORF.FAIT }, mainStep: true },
  // PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: { db: ETES.publicationDeDecisionAuRecueilDesActesAdministratifs, mainStep: true },
  // CLASSER_SANS_SUITE: { db: ETES.classementSansSuite, mainStep: false },
  // DESISTER_PAR_LE_DEMANDEUR: { db: ETES.desistementDuDemandeur, mainStep: false },
  // DEMANDER_INFORMATION: { db: ETES.demandeDinformations, mainStep: false },
  // RECEVOIR_INFORMATION: { db: ETES.receptionDinformation, mainStep: false },
  // FAIRE_ABROGATION: { db: ETES.abrogationDeLaDecision, mainStep: true },
  // SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE: { db: ETES.informationsHistoriquesIncompletes, mainStep: false },
}

// basé sur https://drive.google.com/drive/u/1/folders/1U_in35zSb837xCp_fp31I0vOmb36QguL
export class ProcedureSpecifiqueMachine extends CaminoMachine<ProcedureSpecifiqueContext, ProcedureSpecifiqueXStateEvent> {
  constructor(titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) {
    super(procedureSpecifiqueMachine(titreTypeId, demarcheTypeId), trad)
  }

  // override toPotentialCaminoXStateEvent(event: ProcedureSpecifiqueXStateEvent['type'], date: CaminoDate): ProcedureSpecifiqueXStateEvent[] {
  //   switch (event) {
  //     case 'FAIRE_DEMANDE':
  //     case 'NOTIFIER_DEMANDEUR':
  //       return [
  //         { type: event, titreTypeId: 'cxm', demarcheTypeId: 'oct' },
  //         { type: event, titreTypeId: 'arm', demarcheTypeId: 'oct' },
  //       ]
  //     // case 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE':
  //     // case 'RENDRE_DECISION_ADMINISTRATION_REJETEE':
  //     // case 'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE':
  //     // case 'SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE':
  //     // case 'PUBLIER_DECISION_ACCEPTEE_AU_JORF':
  //     // case 'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS':
  //     //   return [{ type: event, date }]
  //     // case 'OUVRIR_PARTICIPATION_DU_PUBLIC':
  //     //   return [
  //     //     { type: event, status: ETAPES_STATUTS.PROGRAMME },
  //     //     { type: event, status: ETAPES_STATUTS.EN_COURS },
  //     //     { type: event, status: ETAPES_STATUTS.TERMINE },
  //     //   ]
  //     default:
  //       return [{ type: event  }]
  //   }
  // }
}

interface ProcedureSpecifiqueContext extends CaminoCommonContext {}
const defaultDemarcheStatut = DemarchesStatutsIds.EnConstruction
const procedureSpecifiqueMachine = (titreTypeId: TitreTypeId, _demarcheTypeId: DemarcheTypeId) =>
  setup({
    types: {} as { context: ProcedureSpecifiqueContext; events: ProcedureSpecifiqueXStateEvent },
    guards: {
      isPerOuConcession: () => [TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES, TITRES_TYPES_TYPES_IDS.CONCESSION].includes(getTitreTypeType(titreTypeId)),
    },
  }).createMachine({
    id: 'ProcedureSpecifique',
    initial: 'demandeAFaire',
    context: {
      demarcheStatut: defaultDemarcheStatut,
      visibilite: 'confidentielle',
    },
    states: {
      demandeAFaire: {
        on: {
          FAIRE_DEMANDE: {
            target: 'depotDeLaDemandeAFaire',
            actions: assign({
              demarcheStatut: DemarchesStatutsIds.EnInstruction,
            }),
          },
        },
      },
      depotDeLaDemandeAFaire: {
        on: {
          DEPOSER_DEMANDE: 'recevabiliteOuInformationDuPrefetEtCollectivitesAFaire',
        },
      },

      recevabiliteOuInformationDuPrefetEtCollectivitesAFaire: {
        on: {
          // FIXME
          // RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES: {
          //   target: 'recevabiliteOuInformationDuPrefetEtCollectivitesAFaire',
          // guard: 'isPerOuConcession'
          // },
          FAIRE_RECEVABILITE_FAVORABLE: 'recevabiliteFavorableFaite',
          FAIRE_RECEVABILITE_DEFAVORABLE: 'demandeDeComplementsAFaire',
        },
      },
      demandeDeComplementsAFaire: {
        on: {
          FAIRE_DEMANDE_DE_COMPLEMENTS: 'reponseALaDemandeDeComplements',
        },
      },
      // FIXME brouillonable
      reponseALaDemandeDeComplements: {
        on: {
          RECEVOIR_COMPLEMENTS: 'recevabiliteOuIrrecevabiliteAFaire',
        },
      },
      recevabiliteOuIrrecevabiliteAFaire: {
        on: {
          FAIRE_RECEVABILITE_FAVORABLE: 'recevabiliteFavorableFaite',
          FAIRE_RECEVABILITE_DEFAVORABLE: 'demandeDeComplementsAFaire',
          FAIRE_DECLARATION_IRRECEVABILITE: {
            target: 'finDeMachine',
            actions: assign({
              demarcheStatut: DemarchesStatutsIds.Rejete,
            }),
          },
        },
      },
      recevabiliteFavorableFaite: {
        on: {
          NOTIFIER_DEMANDEUR: {
            target: 'recevabiliteFavorableFaite',
            guard: 'isPerOuConcession',
          },
        },
      },
      finDeMachine: {
        type: 'final',
      },
    },
  })

// FIXME questions POH
// - Information historique incomplète pas possible -> on vire
// - L'irrecevabilité est faisable que après une demande de compléments ? -> OUI
// - Recevabilité, on peut garder les statuts favorable et defavorable ? -> OUI
// - C'est une toute nouvelle étape « Information du préfet et des collectivités » ? Est-ce que ça serait pas une fusion d'anciennes étapes ? -> c'est tout nouveau
// - Est-ce que l'information du préfet et des collectivités est faite 2 fois ? -> Non que une fois
