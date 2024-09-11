import { and, assign, not, or, setup } from 'xstate'
import { CaminoMachine } from '../machine-helper'
import { CaminoCommonContext, DBEtat } from '../machine-common'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { TITRES_TYPES_IDS, TitreTypeId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId, isDemarcheTypeProlongations } from 'camino-common/src/static/demarchesTypes'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { KM2, km2Validator } from 'camino-common/src/number'
import { CaminoDate } from 'camino-common/src/date'
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

type ParticipationDuPublic = {
  surface: KM2
  status: EtapeStatutId
  type: 'OUVRIR_PARTICIPATION_DU_PUBLIC'
}

type EnqueteDuPublic = {
  surface: KM2
  status: EtapeStatutId
  type: 'OUVRIR_ENQUETE_PUBLIQUE'
}
type ProcedureSpecifiqueXStateEvent =
  | { type: 'FAIRE_DEMANDE' }
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'FAIRE_RECEVABILITE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEFAVORABLE' }
  | { type: 'FAIRE_DEMANDE_DE_COMPLEMENTS' }
  | { type: 'RECEVOIR_COMPLEMENTS' }
  | { type: 'FAIRE_DECLARATION_IRRECEVABILITE' }
  | { type: 'NOTIFIER_DEMANDEUR' }
  | { type: 'RENDRE_AVIS_CGE_IGEDD' }
  | { type: 'FAIRE_LETTRE_SAISINE_PREFET' }
  | { type: 'RENDRE_AVIS_COLLECTIVITES' }
  | { type: 'RENDRE_AVIS_SERVICES_COMMISSIONS' }
  | { type: 'RENDRE_AVIS_PREFET' }
  | ParticipationDuPublic
  | EnqueteDuPublic
  | { type: 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE' }
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
  RENDRE_AVIS_CGE_IGEDD: { db: ETES.avisDuConseilGeneralDeLeconomie_CGE_, mainStep: true },
  FAIRE_LETTRE_SAISINE_PREFET: { db: ETES.saisineDuPrefet, mainStep: true },
  RENDRE_AVIS_COLLECTIVITES: { db: ETES.avisDesCollectivites, mainStep: true },
  RENDRE_AVIS_SERVICES_COMMISSIONS: { db: ETES.avisDesServicesEtCommissionsConsultatives, mainStep: true },
  RENDRE_AVIS_PREFET: { db: ETES.avisDuPrefet, mainStep: true },
  OUVRIR_ENQUETE_PUBLIQUE: { db: ETES.ouvertureDeLenquetePublique, mainStep: true },
  OUVRIR_PARTICIPATION_DU_PUBLIC: { db: ETES.participationDuPublic, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: { db: { ACCEPTE: ETES.decisionDeLadministration.ACCEPTE }, mainStep: true },
  // RECEVOIR_REPONSE_DEMANDEUR: {db: ETES.demandeur}

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

  override toPotentialCaminoXStateEvent(event: ProcedureSpecifiqueXStateEvent['type'], date: CaminoDate): ProcedureSpecifiqueXStateEvent[] {
    switch (event) {
      // case 'FAIRE_DEMANDE':
      // case 'NOTIFIER_DEMANDEUR':
      //   return [
      //     { type: event, titreTypeId: 'cxm', demarcheTypeId: 'oct' },
      //     { type: event, titreTypeId: 'arm', demarcheTypeId: 'oct' },
      //   ]
      // case 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE':
      // case 'RENDRE_DECISION_ADMINISTRATION_REJETEE':
      // case 'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE':
      // case 'SAISIR_INFORMATION_HISTORIQUE_INCOMPLETE':
      // case 'PUBLIER_DECISION_ACCEPTEE_AU_JORF':
      // case 'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS':
      //   return [{ type: event, date }]
      case 'OUVRIR_ENQUETE_PUBLIQUE':
      case 'OUVRIR_PARTICIPATION_DU_PUBLIC':
        return [
          { type: event, status: ETAPES_STATUTS.PROGRAMME, surface: km2Validator.parse(0.24) },
          { type: event, status: ETAPES_STATUTS.EN_COURS, surface: km2Validator.parse(0.24) },
          { type: event, status: ETAPES_STATUTS.TERMINE, surface: km2Validator.parse(0.24) },
          { type: event, status: ETAPES_STATUTS.PROGRAMME, surface: km2Validator.parse(0.26) },
          { type: event, status: ETAPES_STATUTS.EN_COURS, surface: km2Validator.parse(0.26) },
          { type: event, status: ETAPES_STATUTS.TERMINE, surface: km2Validator.parse(0.26) },
        ]
      default:
        return super.toPotentialCaminoXStateEvent(event, date)
    }
  }
}

interface ProcedureSpecifiqueContext extends CaminoCommonContext {}
const defaultDemarcheStatut = DemarchesStatutsIds.EnConstruction
const procedureSpecifiqueMachine = (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) =>
  setup({
    types: {} as { context: ProcedureSpecifiqueContext; events: ProcedureSpecifiqueXStateEvent },
    guards: {
      isPublique: ({ context }) => context.visibilite === 'publique',
      isPerOuConcession: () => [TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES, TITRES_TYPES_TYPES_IDS.CONCESSION].includes(getTitreTypeType(titreTypeId)),
      hasMiseEnConcurrence: () =>
        [DEMARCHES_TYPES_IDS.Octroi, DEMARCHES_TYPES_IDS.ExtensionDePerimetre].includes(demarcheTypeId) ||
        (isDemarcheTypeProlongations(demarcheTypeId) && getTitreTypeType(titreTypeId) === TITRES_TYPES_TYPES_IDS.CONCESSION),
      isAxmOuAr: () => TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX === titreTypeId || TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE === getTitreTypeType(titreTypeId),
      // FIXMACHINE à vérifier
      isEnquetePubliqueRequired: ({ event }) =>
        ((DEMARCHES_TYPES_IDS.Octroi === demarcheTypeId || isDemarcheTypeProlongations(demarcheTypeId)) &&
          [
            TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS,
            TITRES_TYPES_IDS.CONCESSION_METAUX,
            TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS,
            TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE,
            TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN,
            TITRES_TYPES_IDS.CONCESSION_GEOTHERMIE,
          ].includes(titreTypeId)) ||
        (titreTypeId === TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX && (event.type === 'OUVRIR_PARTICIPATION_DU_PUBLIC' || event.type === 'OUVRIR_ENQUETE_PUBLIQUE') && event.surface > 0.25),
      isEnquetePubliquePossible: ({ event }) =>
        titreTypeId === TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX && (event.type === 'OUVRIR_PARTICIPATION_DU_PUBLIC' || event.type === 'OUVRIR_ENQUETE_PUBLIQUE') && event.surface <= 0.25,
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
          // FIXMACHINE
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
      // FIXMACHINE brouillonable
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
        always: [
          {
            guard: and([not('hasMiseEnConcurrence'), not('isPublique')]),
            actions: assign({ visibilite: 'publique' }),
          },
          {
            target: 'avisCollectivitesEtServicesEtCommissionsAFaireMachine',
            guard: and([not('hasMiseEnConcurrence'), 'isAxmOuAr']),
          },
        ],
        on: {
          // FIXMACHINE ajouter la mise en concurrence
          RENDRE_AVIS_CGE_IGEDD: {
            // FIXMACHINE ajouter la demande de modification de l'aes
            target: 'notificationAuDemandeurAFaire',
            guard: and([not('hasMiseEnConcurrence'), not('isAxmOuAr')]),
          },
          NOTIFIER_DEMANDEUR: {
            target: 'recevabiliteFavorableFaite',
            guard: 'isPerOuConcession',
          },
        },
      },

      notificationAuDemandeurAFaire: {
        on: { NOTIFIER_DEMANDEUR: 'lettreDeSaisineDuPrefetOuReponseDuDemandeurAFaire' },
      },
      lettreDeSaisineDuPrefetOuReponseDuDemandeurAFaire: {
        on: {
          // FIXMACHINE brouillon
          // FIXMACHINE 'RECEVOIR_REPONSE_DEMANDEUR': 'lettreDeSaisineDuPrefetOuReponseDuDemandeurAFaire',
          FAIRE_LETTRE_SAISINE_PREFET: 'avisCollectivitesEtServicesEtCommissionsAFaireMachine',
        },
      },

      avisCollectivitesEtServicesEtCommissionsAFaireMachine: {
        type: 'parallel',
        states: {
          avisARendreMachine: {
            initial: 'avisARendre',
            states: {
              avisARendre: {
                type: 'parallel',

                states: {
                  avisCollectivitesARendreMachine: {
                    initial: 'avisCollectivitesARendre',
                    states: {
                      avisCollectivitesARendre: {
                        // FIXMACHINE brouillon
                        on: { RENDRE_AVIS_COLLECTIVITES: 'fin' },
                      },
                      fin: { type: 'final' },
                    },
                  },
                  avisServicesEtCommissionsRendreMachine: {
                    initial: 'avisServicesEtCommissionsRendre',
                    states: {
                      avisServicesEtCommissionsRendre: {
                        // FIXMACHINE brouillon
                        on: { RENDRE_AVIS_SERVICES_COMMISSIONS: 'fin' },
                      },
                      fin: { type: 'final' },
                    },
                  },
                },
                onDone: 'avisDuPrefetARendre',
              },
              avisDuPrefetARendre: {
                // FIXMACHINE gérer l'avis de la commission CDM
                on: { RENDRE_AVIS_PREFET: 'fin' },
              },
              fin: {
                type: 'final',
              },
            },
          },
          participationOuEnqueteDuPublicMachine: {
            initial: 'participationOuEnquetePublicAFaire',
            states: {
              participationOuEnquetePublicAFaire: {
                on: {
                  OUVRIR_ENQUETE_PUBLIQUE: [
                    {
                      target: 'fin',
                      guard: and([or(['isEnquetePubliqueRequired', 'isEnquetePubliquePossible']), ({ event }) => event.status === ETAPES_STATUTS.TERMINE]),
                    },
                    {
                      target: 'enAttente',
                      guard: ({ event }) => event.status !== ETAPES_STATUTS.TERMINE,
                    },
                  ],
                  OUVRIR_PARTICIPATION_DU_PUBLIC: [
                    {
                      target: 'fin',
                      guard: and([not('isEnquetePubliqueRequired'), ({ event }) => event.status === ETAPES_STATUTS.TERMINE]),
                    },
                    {
                      target: 'enAttente',
                      guard: ({ event }) => event.status !== ETAPES_STATUTS.TERMINE,
                    },
                  ],
                },
              },
              enAttente: {},
              fin: {
                type: 'final',
              },
            },
          },
        },
        onDone: 'decisionAdministrationAFaire',
      },
      decisionAdministrationAFaire: {
        on: {
          RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: 'finDeMachine',
        },
      },
      finDeMachine: {
        type: 'final',
      },
    },
  })

// FIXMACHINE questions POH
// - L'irrecevabilité est faisable que après une demande de compléments ? -> OUI
// - C'est une toute nouvelle étape « Information du préfet et des collectivités » ? Est-ce que ça serait pas une fusion d'anciennes étapes ? -> c'est tout nouveau
// - Est-ce que l'information du préfet et des collectivités est faite 2 fois ? -> Non que une fois
//
// - « avisDuConseilGeneralDeLeconomie_CGE_ » ça passe pour l'étape « avis du CGE et de l'IGEDD » ? => Renommer l'étape
// - l'étape « avis du CGE et de l'IGEDD » n'a pas de statut favorable / défavorable ? => C'est une étape d'avis donc c'est FAIT
// - comment on peut avoir une mise en concurrence si la démarche n'est pas publique ? => Modif du logigramme, ça devient publique dés que la mise en concurrence est « en cours »
// - Pour l'enquête et la participation du public, la démarche est déjà publique => Heuuuu non, modif à faire dans le logigramme
