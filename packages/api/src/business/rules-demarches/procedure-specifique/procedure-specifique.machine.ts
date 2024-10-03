import { and, assign, not, or, setup } from 'xstate'
import { CaminoMachine } from '../machine-helper'
import { CaminoCommonContext, Concurrence, DBEtat, DemarcheVisibilite, Etape, globalGuards } from '../machine-common'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { TITRES_TYPES_IDS, TitreTypeId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId, isDemarcheTypeProlongations } from 'camino-common/src/static/demarchesTypes'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { KM2, km2Validator } from 'camino-common/src/number'
import { CaminoDate } from 'camino-common/src/date'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'

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

type FaireMiseEnConcurrence = {
  status: EtapeStatutId
  type: 'FAIRE_MISE_EN_CONCURRENCE'
}

type FaireDemande = {
  concurrence: Concurrence
  hasTitreFrom: boolean
  type: 'FAIRE_DEMANDE'
}
type ProcedureSpecifiqueXStateEvent =
  | FaireDemande
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'FAIRE_RECEVABILITE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEFAVORABLE' }
  | { type: 'FAIRE_DEMANDE_DE_COMPLEMENTS' }
  | { type: 'RECEVOIR_COMPLEMENTS' }
  | { type: 'FAIRE_DECLARATION_IRRECEVABILITE' }
  | FaireMiseEnConcurrence
  | { type: 'RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE' }
  | { type: 'RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE' }
  | { type: 'NOTIFIER_DEMANDEUR' }
  | { type: 'RENDRE_AVIS_CGE_IGEDD' }
  | { type: 'FAIRE_LETTRE_SAISINE_PREFET' }
  | { type: 'RENDRE_AVIS_COLLECTIVITES' }
  | { type: 'RENDRE_AVIS_SERVICES_COMMISSIONS' }
  | { type: 'RENDRE_AVIS_PREFET' }
  | ParticipationDuPublic
  | EnqueteDuPublic
  | { type: 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_REJETEE' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE' }
  | { type: 'PUBLIER_DECISION_ACCEPTEE_AU_JORF' }
  | { type: 'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS' }
  | { type: 'FAIRE_ABROGATION' }
  | { type: 'FAIRE_ATTESTATION_DE_CONSTITUTION_DE_GARANTIES_FINANCIERES' }

type Event = ProcedureSpecifiqueXStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: ETES.demande, mainStep: true },
  DEPOSER_DEMANDE: { db: ETES.depotDeLaDemande, mainStep: true },
  FAIRE_RECEVABILITE_FAVORABLE: { db: { FAVORABLE: ETES.recevabiliteDeLaDemande.FAVORABLE }, mainStep: true },
  FAIRE_RECEVABILITE_DEFAVORABLE: { db: { DEFAVORABLE: ETES.recevabiliteDeLaDemande.DEFAVORABLE }, mainStep: false },
  FAIRE_DEMANDE_DE_COMPLEMENTS: { db: ETES.demandeDeComplements, mainStep: false },
  RECEVOIR_COMPLEMENTS: { db: ETES.receptionDeComplements, mainStep: false },
  FAIRE_DECLARATION_IRRECEVABILITE: { db: ETES.declarationDIrrecevabilite, mainStep: false },
  FAIRE_MISE_EN_CONCURRENCE: { db: ETES.avisDeMiseEnConcurrenceAuJORF, mainStep: true },
  RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE: { db: { ACCEPTE: ETES.resultatMiseEnConcurrence.ACCEPTE }, mainStep: true },
  RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE: { db: { REJETE: ETES.resultatMiseEnConcurrence.REJETE }, mainStep: true },
  NOTIFIER_DEMANDEUR: { db: ETES.notificationAuDemandeur, mainStep: false },
  RENDRE_AVIS_CGE_IGEDD: { db: ETES.avisDuConseilGeneralDeLeconomie_CGE_, mainStep: true },
  FAIRE_LETTRE_SAISINE_PREFET: { db: ETES.saisineDuPrefet, mainStep: true },
  RENDRE_AVIS_COLLECTIVITES: { db: ETES.avisDesCollectivites, mainStep: true },
  RENDRE_AVIS_SERVICES_COMMISSIONS: { db: ETES.avisDesServicesEtCommissionsConsultatives, mainStep: true },
  RENDRE_AVIS_PREFET: { db: ETES.avisDuPrefet, mainStep: true },
  OUVRIR_ENQUETE_PUBLIQUE: { db: ETES.enquetePublique, mainStep: true },
  OUVRIR_PARTICIPATION_DU_PUBLIC: { db: ETES.participationDuPublic, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: { db: { ACCEPTE: ETES.decisionDeLadministration.ACCEPTE }, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_REJETEE: { db: { REJETE: ETES.decisionDeLadministration.REJETE }, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE: { db: { REJETE_DECISION_IMPLICITE: ETES.decisionDeLadministration.REJETE_DECISION_IMPLICITE }, mainStep: true },
  PUBLIER_DECISION_ACCEPTEE_AU_JORF: { db: { FAIT: ETES.publicationDeDecisionAuJORF.FAIT }, mainStep: true },
  PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: { db: ETES.publicationDeDecisionAuRecueilDesActesAdministratifs, mainStep: true },
  FAIRE_ABROGATION: { db: ETES.abrogationDeLaDecision, mainStep: true },
  FAIRE_ATTESTATION_DE_CONSTITUTION_DE_GARANTIES_FINANCIERES: { db: ETES.attestationDeConstitutionDeGarantiesFinancieres, mainStep: true },
}

// basé sur https://drive.google.com/drive/u/1/folders/1U_in35zSb837xCp_fp31I0vOmb36QguL
export class ProcedureSpecifiqueMachine extends CaminoMachine<ProcedureSpecifiqueContext, ProcedureSpecifiqueXStateEvent> {
  constructor(titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) {
    super(procedureSpecifiqueMachine(titreTypeId, demarcheTypeId), trad)
  }

  override eventFromEntry(eventFromEntry: ProcedureSpecifiqueXStateEvent['type'], etape: Etape): ProcedureSpecifiqueXStateEvent {
    switch (eventFromEntry) {
      case 'FAIRE_DEMANDE': {
        if (isNullOrUndefined(etape.concurrence)) {
          throw new Error('La concurrence est obligatoire pour faire la demande')
        }
        if (isNullOrUndefined(etape.hasTitreFrom)) {
          throw new Error("L'attribut hasTitreFrom est obligatoire pour faire la demande")
        }
        return { type: eventFromEntry, concurrence: etape.concurrence, hasTitreFrom: etape.hasTitreFrom }
      }
      default:
        return super.eventFromEntry(eventFromEntry, etape)
    }
  }

  override toPotentialCaminoXStateEvent(event: ProcedureSpecifiqueXStateEvent['type'], date: CaminoDate): ProcedureSpecifiqueXStateEvent[] {
    switch (event) {
      case 'FAIRE_DEMANDE':
        return [{ type: event, concurrence: { amIFirst: false, demarcheConcurrenteVisibilite: 'publique' }, hasTitreFrom: false }]
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
      case 'FAIRE_MISE_EN_CONCURRENCE':
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

interface ProcedureSpecifiqueContext extends CaminoCommonContext {
  concurrence: 'inconnu' | { amIFirst: true } | { amIFirst: false; demarcheConcurrenteVisibilite: DemarcheVisibilite }
  hasTitreFrom: 'inconnu' | boolean
}
const defaultDemarcheStatut = DemarchesStatutsIds.EnConstruction
const procedureSpecifiqueMachine = (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) =>
  setup({
    types: {} as { context: ProcedureSpecifiqueContext; events: ProcedureSpecifiqueXStateEvent },
    guards: {
      isAxm: () => TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX === titreTypeId,
      isPerOuConcession: () => [TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES, TITRES_TYPES_TYPES_IDS.CONCESSION].includes(getTitreTypeType(titreTypeId)),
      canHaveMiseEnConcurrence: ({ context }) => {
        if (DEMARCHES_TYPES_IDS.ExtensionDePerimetre === demarcheTypeId) {
          return true
        } else if (DEMARCHES_TYPES_IDS.Octroi === demarcheTypeId) {
          if (context.hasTitreFrom === 'inconnu') {
            throw new Error("hasTitreFrom n'est pas initialisé")
          }
          return !context.hasTitreFrom
        } else {
          return false
        }
      },
      isPremiereDemandePourMiseEnConcurrence: ({ context }) => {
        if (context.concurrence === 'inconnu') {
          throw new Error("concurrence n'est pas initialisé")
        }
        return context.concurrence.amIFirst
      },
      isAxmOuAr: () => TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX === titreTypeId || TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE === getTitreTypeType(titreTypeId),
      // FIXMACHINE à vérifier et à tester
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
      ...globalGuards,
    },
  }).createMachine({
    id: 'ProcedureSpecifique',
    initial: 'demandeAFaire',
    context: {
      demarcheStatut: defaultDemarcheStatut,
      visibilite: 'confidentielle',
      concurrence: 'inconnu',
      hasTitreFrom: 'inconnu',
    },
    states: {
      demandeAFaire: {
        on: {
          FAIRE_DEMANDE: {
            target: 'depotDeLaDemandeAFaire',
            actions: assign({
              demarcheStatut: DemarchesStatutsIds.EnInstruction,
              concurrence: ({ event }) => event.concurrence,
              hasTitreFrom: ({ event }) => event.hasTitreFrom,
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
            target: 'avisCGE_IGEDD_AFaire',
            guard: and([not('canHaveMiseEnConcurrence')]),
          },
          {
            target: 'resultatMiseEnConcurrenceAFaire',
            guard: and(['canHaveMiseEnConcurrence', not('isPremiereDemandePourMiseEnConcurrence')]),
            actions: assign({
              visibilite: ({ context }) => ('inconnu' !== context.concurrence && !context.concurrence.amIFirst ? context.concurrence.demarcheConcurrenteVisibilite : context.visibilite),
            }),
          },
        ],
        on: {
          FAIRE_MISE_EN_CONCURRENCE: [
            {
              target: 'resultatMiseEnConcurrenceAFaire',
              guard: and(['canHaveMiseEnConcurrence', 'isPremiereDemandePourMiseEnConcurrence', ({ event }) => event.status === ETAPES_STATUTS.TERMINE]),
              actions: assign({ visibilite: 'publique' }),
            },
            {
              target: 'enAttente',
              guard: and(['canHaveMiseEnConcurrence', 'isPremiereDemandePourMiseEnConcurrence', ({ event }) => event.status === ETAPES_STATUTS.EN_COURS]),
              actions: assign({ visibilite: 'publique' }),
            },
          ],
          // FIXMACHINE à mettre autre part
          NOTIFIER_DEMANDEUR: {
            target: 'recevabiliteFavorableFaite',
            guard: 'isPerOuConcession',
          },
        },
      },
      enAttente: {},
      notificationAuDemandeurAFaire: {
        on: { NOTIFIER_DEMANDEUR: 'lettreDeSaisineDuPrefetOuReponseDuDemandeurAFaire' },
      },
      resultatMiseEnConcurrenceAFaire: {
        on: {
          RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE: 'avisCGE_IGEDD_AFaire',
          RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE: {
            target: 'finDeMachine',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.Rejete }),
          },
        },
      },
      avisCGE_IGEDD_AFaire: {
        always: {
          target: 'avisCollectivitesEtServicesEtCommissionsAFaireMachine',
          guard: 'isAxmOuAr',
        },
        on: {
          RENDRE_AVIS_CGE_IGEDD: {
            // FIXMACHINE ajouter la demande de modification de l'aes
            target: 'notificationAuDemandeurAFaire',
            guard: not('isAxmOuAr'),
          },
        },
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
                      actions: assign({ visibilite: 'publique' }),
                    },
                    {
                      target: 'enAttente',
                      guard: ({ event }) => event.status === ETAPES_STATUTS.EN_COURS,
                      actions: assign({ visibilite: 'publique' }),
                    },
                    {
                      target: 'enAttente',
                      guard: ({ event }) => event.status === ETAPES_STATUTS.PROGRAMME,
                    },
                  ],
                  OUVRIR_PARTICIPATION_DU_PUBLIC: [
                    {
                      target: 'fin',
                      guard: and([not('isEnquetePubliqueRequired'), ({ event }) => event.status === ETAPES_STATUTS.TERMINE]),
                      actions: assign({ visibilite: 'publique' }),
                    },
                    {
                      target: 'enAttente',
                      guard: ({ event }) => event.status === ETAPES_STATUTS.EN_COURS,
                      actions: assign({ visibilite: 'publique' }),
                    },
                    {
                      target: 'enAttente',
                      guard: ({ event }) => event.status === ETAPES_STATUTS.PROGRAMME,
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
          RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: {
            target: 'publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.Accepte, visibilite: 'publique' }),
          },
          RENDRE_DECISION_ADMINISTRATION_REJETEE: {
            target: 'notificationAuDemandeurApresDecisionRejetAFaire',
            actions: assign({ visibilite: 'confidentielle' }),
          },
          RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE: {
            target: 'finDeMachine',
            actions: assign({
              demarcheStatut: DemarchesStatutsIds.Rejete,
              visibilite: 'publique',
            }),
          },
        },
      },
      publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire: {
        on: {
          PUBLIER_DECISION_ACCEPTEE_AU_JORF: {
            target: 'abrogationOuNotificationAuDemandeurMachine',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.AccepteEtPublie }),
          },
          PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: {
            target: 'abrogationOuNotificationAuDemandeurMachine',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.AccepteEtPublie }),
          },
        },
      },
      abrogationOuNotificationAuDemandeurMachine: {
        type: 'parallel',
        states: {
          notificationAuDemandeurMachine: {
            initial: 'notificationAuDemandeurAFaire',
            states: {
              notificationAuDemandeurAFaire: {
                on: {
                  NOTIFIER_DEMANDEUR: 'attestationDeConstitutionDeGarantiesFinancieresAFaire',
                },
              },
              attestationDeConstitutionDeGarantiesFinancieresAFaire: {
                always: {
                  target: 'attestationDeConstitutionDeGarantiesFinancieresFait',
                  guard: not('isAxm'),
                },
                on: {
                  FAIRE_ATTESTATION_DE_CONSTITUTION_DE_GARANTIES_FINANCIERES: 'attestationDeConstitutionDeGarantiesFinancieresFait',
                },
              },

              attestationDeConstitutionDeGarantiesFinancieresFait: { type: 'final' },
            },
          },

          abrogationMachine: {
            initial: 'abrogationAFaire',
            states: {
              abrogationAFaire: {
                on: {
                  FAIRE_ABROGATION: 'publicationsAFaire',
                },
              },
              publicationsAFaire: {
                on: {
                  PUBLIER_DECISION_ACCEPTEE_AU_JORF: {
                    target: 'publicationsFaites',
                    actions: assign({ demarcheStatut: DemarchesStatutsIds.RejeteApresAbrogation }),
                  },
                  PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: {
                    target: 'publicationsFaites',
                    actions: assign({ demarcheStatut: DemarchesStatutsIds.RejeteApresAbrogation }),
                  },
                },
              },
              publicationsFaites: {
                type: 'final',
              },
            },
          },
        },
        onDone: 'finDeMachine',
      },

      notificationAuDemandeurApresDecisionRejetAFaire: {
        on: {
          NOTIFIER_DEMANDEUR: {
            target: 'finDeMachine',
            actions: assign({ demarcheStatut: DemarchesStatutsIds.Rejete }),
          },
        },
      },
      finDeMachine: {
        type: 'final',
      },
    },
  })

/**  FIXMACHINE questions POH
- L'irrecevabilité est faisable que après une demande de compléments ? -> OUI
- C'est une toute nouvelle étape « Information du préfet et des collectivités » ? Est-ce que ça serait pas une fusion d'anciennes étapes ? -> c'est tout nouveau
- Est-ce que l'information du préfet et des collectivités est faite 2 fois ? -> Non que une fois
- « avisDuConseilGeneralDeLeconomie_CGE_ » ça passe pour l'étape « avis du CGE et de l'IGEDD » ? => Renommer l'étape
- l'étape « avis du CGE et de l'IGEDD » n'a pas de statut favorable / défavorable ? => C'est une étape d'avis donc c'est FAIT
- comment on peut avoir une mise en concurrence si la démarche n'est pas publique ? => Modif du logigramme, ça devient publique dés que la mise en concurrence est « en cours »
- Pour l'enquête et la participation du public, la démarche est déjà publique => Heuuuu non, modif à faire dans le logigramme
- « Mesures de publicité» ça bloque tout ? -> NON
- Pour la mise en concurrence, si ce n'est pas la demande initiale. L'utilisateur a le choix entre 2 « Notification au demandeur », sachant que celle après la mise en concurrence est beaucoup plus complète, on ne peut pas renommer cette dernière ?
Si une démarche vient en concurrence d'une démarche existante, alors elle devient publique dès la recevabilité de la demande favorable ?
Notification au demandeur après la mise en concurrence devrait être renommée "Conclusion suite à la mise en concurrence" ?
Réecrire les conditions :
 - "octrois et extension de périmètres et prolongations de concessions"
 - "autres démarches et prolongations octroi de concessions suite à PER octroi d'AXM suite à ARM"
En une seule condition
- Pour « la mise en concurrence », c'est l'anf ?

**/
