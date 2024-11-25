import { and, assign, not, or, setup } from 'xstate'
import { CaminoMachine } from '../machine-helper'
import { CaminoCommonContext, Concurrence, DBEtat, Etape, globalGuards } from '../machine-common'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { TITRES_TYPES_IDS, TitreTypeId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId, isDemarcheTypeProlongations } from 'camino-common/src/static/demarchesTypes'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { hectareToKm2, hectareValidator, KM2, km2Validator } from 'camino-common/src/number'
import { CaminoDate } from 'camino-common/src/date'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { canHaveMiseEnConcurrence } from 'camino-common/src/demarche'
import { Consentement, DemarcheVisibilite } from 'camino-common/src/etape-form'
import { PAYS_IDS, PaysId } from 'camino-common/src/static/pays'

type ParticipationDuPublic = {
  status: EtapeStatutId
  type: 'OUVRIR_PARTICIPATION_DU_PUBLIC'
}

type EnqueteDuPublic = {
  status: EtapeStatutId
  type: 'OUVRIR_ENQUETE_PUBLIQUE'
}

type FaireMiseEnConcurrence = {
  status: EtapeStatutId
  type: 'FAIRE_MISE_EN_CONCURRENCE'
}

type FaireDemande = {
  concurrence: Concurrence
  consentement: Consentement
  hasTitreFrom: boolean
  paysId: PaysId
  surface: KM2
  type: 'FAIRE_DEMANDE'
}
type ProcedureSpecifiqueXStateEvent =
  | FaireDemande
  | { type: 'ENREGISTRER_DEMANDE' }
  | { type: 'FAIRE_RECEVABILITE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEFAVORABLE' }
  | { type: 'FAIRE_DEMANDE_DE_COMPLEMENTS' }
  | { type: 'RECEVOIR_COMPLEMENTS' }
  | { type: 'FAIRE_DECLARATION_IRRECEVABILITE' }
  | FaireMiseEnConcurrence
  | { type: 'RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE' }
  | { type: 'RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE' }
  | { type: 'NOTIFIER_DEMANDEUR' }
  | { type: 'RECEVOIR_REPONSE_DEMANDEUR' }
  | { type: 'RENDRE_AVIS_CGE_IGEDD' }
  | { type: 'FAIRE_DEMANDE_MODIFICATION_AES' }
  | { type: 'FAIRE_LETTRE_SAISINE_PREFET' }
  | { type: 'RENDRE_AVIS_COLLECTIVITES' }
  | { type: 'RENDRE_AVIS_SERVICES_COMMISSIONS' }
  | { type: 'RENDRE_AVIS_PREFET' }
  | { type: 'RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES' }
  | ParticipationDuPublic
  | EnqueteDuPublic
  | { type: 'FAIRE_CONSULTATION_DES_ADMINISTRATIONS_CENTRALES' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_ACCEPTEE' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_REJETEE' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE' }
  | { type: 'PUBLIER_DECISION_ACCEPTEE_AU_JORF' }
  | { type: 'PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS' }
  | { type: 'RENDRE_MESURES_DE_PUBLICITE' }
  | { type: 'FAIRE_ABROGATION' }
  | { type: 'FAIRE_ATTESTATION_DE_CONSTITUTION_DE_GARANTIES_FINANCIERES' }
  | { type: 'CLASSER_SANS_SUITE' }
  | { type: 'DESISTER_PAR_LE_DEMANDEUR' }
  | { type: 'DEMANDER_INFORMATION' }
  | { type: 'RECEVOIR_INFORMATION' }
  | { type: 'FAIRE_DEMANDE_DE_CONSENTEMENT' }
  | { type: 'RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES' }

type Event = ProcedureSpecifiqueXStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: ETES.demande, mainStep: true },
  ENREGISTRER_DEMANDE: { db: ETES.enregistrementDeLaDemande, mainStep: true },
  FAIRE_RECEVABILITE_FAVORABLE: { db: { FAVORABLE: ETES.recevabiliteDeLaDemande.FAVORABLE }, mainStep: true },
  FAIRE_RECEVABILITE_DEFAVORABLE: { db: { DEFAVORABLE: ETES.recevabiliteDeLaDemande.DEFAVORABLE }, mainStep: false },
  FAIRE_DEMANDE_DE_COMPLEMENTS: { db: ETES.demandeDeComplements, mainStep: true },
  RECEVOIR_COMPLEMENTS: { db: ETES.receptionDeComplements, mainStep: true },
  FAIRE_DECLARATION_IRRECEVABILITE: { db: ETES.declarationDIrrecevabilite, mainStep: true },
  FAIRE_MISE_EN_CONCURRENCE: { db: ETES.avisDeMiseEnConcurrenceAuJORF, mainStep: true },
  RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE: { db: { ACCEPTE: ETES.resultatMiseEnConcurrence.ACCEPTE }, mainStep: true },
  RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE: { db: { REJETE: ETES.resultatMiseEnConcurrence.REJETE }, mainStep: true },
  NOTIFIER_DEMANDEUR: { db: ETES.notificationAuDemandeur, mainStep: true },
  RECEVOIR_REPONSE_DEMANDEUR: { db: ETES.reponseDuDemandeur, mainStep: false },
  RENDRE_AVIS_CGE_IGEDD: { db: { FAIT: ETES.avisDuConseilGeneralDeLeconomie_CGE_.FAIT }, mainStep: true },
  FAIRE_DEMANDE_MODIFICATION_AES: { db: ETES.demandeDeModificationAES, mainStep: false },
  FAIRE_LETTRE_SAISINE_PREFET: { db: ETES.saisineDuPrefet, mainStep: true },
  RENDRE_AVIS_COLLECTIVITES: { db: ETES.avisDesCollectivites, mainStep: true },
  RENDRE_AVIS_SERVICES_COMMISSIONS: { db: ETES.avisDesServicesEtCommissionsConsultatives, mainStep: true },
  RENDRE_AVIS_PREFET: { db: ETES.avisDuPrefet, mainStep: true },
  RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES: { db: { FAIT: ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAIT }, mainStep: true },
  OUVRIR_ENQUETE_PUBLIQUE: { db: ETES.enquetePublique, mainStep: true },
  OUVRIR_PARTICIPATION_DU_PUBLIC: { db: ETES.participationDuPublic, mainStep: true },
  FAIRE_CONSULTATION_DES_ADMINISTRATIONS_CENTRALES: { db: ETES.consultationDesAdministrationsCentrales, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: { db: { ACCEPTE: ETES.decisionDeLAutoriteAdministrative.ACCEPTE }, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_REJETEE: { db: { REJETE: ETES.decisionDeLAutoriteAdministrative.REJETE }, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_REJETEE_DECISION_IMPLICITE: { db: { REJETE_DECISION_IMPLICITE: ETES.decisionDeLAutoriteAdministrative.REJETE_DECISION_IMPLICITE }, mainStep: true },
  PUBLIER_DECISION_ACCEPTEE_AU_JORF: { db: { FAIT: ETES.publicationDeDecisionAuJORF.FAIT }, mainStep: true },
  PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: { db: ETES.publicationDeDecisionAuRecueilDesActesAdministratifs, mainStep: true },
  RENDRE_MESURES_DE_PUBLICITE: { db: ETES.mesuresDePublicite, mainStep: false },
  FAIRE_ABROGATION: { db: ETES.abrogationDeLaDecision, mainStep: true },
  FAIRE_ATTESTATION_DE_CONSTITUTION_DE_GARANTIES_FINANCIERES: { db: ETES.attestationDeConstitutionDeGarantiesFinancieres, mainStep: true },
  CLASSER_SANS_SUITE: { db: ETES.classementSansSuite, mainStep: false },
  DESISTER_PAR_LE_DEMANDEUR: { db: ETES.desistementDuDemandeur, mainStep: false },
  DEMANDER_INFORMATION: { db: ETES.demandeDinformations, mainStep: false },
  RECEVOIR_INFORMATION: { db: ETES.receptionDinformation, mainStep: false },
  FAIRE_DEMANDE_DE_CONSENTEMENT: { db: ETES.demandeDeConsentement, mainStep: true },
  RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES: { db: ETES.informationDuPrefetEtDesCollectivites, mainStep: true },
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
        if (isNullOrUndefined(etape.consentement)) {
          throw new Error('Le consentement est obligatoire pour faire la demande')
        }
        if (isNullOrUndefined(etape.hasTitreFrom)) {
          throw new Error("L'attribut hasTitreFrom est obligatoire pour faire la demande")
        }
        if (isNullOrUndefined(etape.paysId)) {
          throw new Error("L'attribut paysId est obligatoire pour faire la demande")
        }
        if (isNullOrUndefined(etape.surface)) {
          throw new Error("L'attribut surface est obligatoire pour faire la demande")
        }
        return { type: eventFromEntry, concurrence: etape.concurrence, consentement: etape.consentement, hasTitreFrom: etape.hasTitreFrom, paysId: etape.paysId, surface: etape.surface }
      }
      default:
        return super.eventFromEntry(eventFromEntry, etape)
    }
  }

  override toPotentialCaminoXStateEvent(event: ProcedureSpecifiqueXStateEvent['type'], date: CaminoDate): ProcedureSpecifiqueXStateEvent[] {
    switch (event) {
      case 'FAIRE_DEMANDE':
        return [
          {
            type: event,
            concurrence: { amIFirst: false, demarcheConcurrenteVisibilite: 'publique' },
            consentement: 'non-applicable',
            hasTitreFrom: false,
            paysId: 'FR',
            surface: km2Validator.parse(12),
          },
          {
            type: event,
            concurrence: { amIFirst: false, demarcheConcurrenteVisibilite: 'publique' },
            consentement: 'non-applicable',
            hasTitreFrom: false,
            paysId: 'GF',
            surface: km2Validator.parse(12),
          },
        ]
      case 'OUVRIR_ENQUETE_PUBLIQUE':
      case 'OUVRIR_PARTICIPATION_DU_PUBLIC':
        return [
          { type: event, status: ETAPES_STATUTS.PROGRAMME },
          { type: event, status: ETAPES_STATUTS.EN_COURS },
          { type: event, status: ETAPES_STATUTS.TERMINE },
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
  demandeInformationEnCours: boolean
  paysId: 'inconnu' | PaysId
  surface: 'inconnu' | KM2
  consentement: 'inconnu' | Consentement
}
const LIMITE_SURFACE_AXM = hectareValidator.parse(25)
const defaultDemarcheStatut = DemarchesStatutsIds.EnConstruction
const procedureSpecifiqueMachine = (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) =>
  setup({
    types: {} as { context: ProcedureSpecifiqueContext; events: ProcedureSpecifiqueXStateEvent },
    guards: {
      isARM: () => TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX === titreTypeId,
      isAxm: () => TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX === titreTypeId,
      isPerOuConcession: () => [TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES, TITRES_TYPES_TYPES_IDS.CONCESSION].includes(getTitreTypeType(titreTypeId)),
      isPerOuConcessionGranulatsMarins: () => [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS, TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS].includes(titreTypeId),
      canHaveMiseEnConcurrence: ({ context }) => {
        if (context.hasTitreFrom === 'inconnu') {
          throw new Error("hasTitreFrom n'est pas initialisé")
        }
        return canHaveMiseEnConcurrence(demarcheTypeId, context.hasTitreFrom)
      },
      consentementAFaire: ({ context }) => context.consentement === 'à faire',
      isDemarcheEnInstruction: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
      isDemandeInformationEnCours: ({ context }) => context.demandeInformationEnCours,
      isPremiereDemandePourMiseEnConcurrence: ({ context }) => {
        if (context.concurrence === 'inconnu') {
          throw new Error("concurrence n'est pas initialisé")
        }
        return context.concurrence.amIFirst
      },
      isAxmOuAr: () => TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX === titreTypeId || TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE === getTitreTypeType(titreTypeId),
      isOutreMer: ({ context }) => {
        if (context.paysId === 'inconnu') {
          throw new Error("Le paysId n'est pas présent")
        }
        return context.paysId !== PAYS_IDS['République Française']
      },
      isEnquetePubliqueRequired: ({ context }) =>
        ((DEMARCHES_TYPES_IDS.Octroi === demarcheTypeId || isDemarcheTypeProlongations(demarcheTypeId)) &&
          [
            TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS,
            TITRES_TYPES_IDS.CONCESSION_METAUX,
            TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS,
            TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE,
            TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN,
            TITRES_TYPES_IDS.CONCESSION_GEOTHERMIE,
          ].includes(titreTypeId)) ||
        (titreTypeId === TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX && context.surface !== 'inconnu' && context.surface > hectareToKm2(LIMITE_SURFACE_AXM)),
      isEnquetePubliquePossible: ({ context }) =>
        titreTypeId === TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX && context.surface !== 'inconnu' && context.surface <= hectareToKm2(LIMITE_SURFACE_AXM),
      ...globalGuards,
    },
  }).createMachine({
    id: 'ProcedureSpecifique',
    initial: 'demandeAFaire',
    context: {
      surface: 'inconnu',
      demarcheStatut: defaultDemarcheStatut,
      visibilite: 'confidentielle',
      concurrence: 'inconnu',
      hasTitreFrom: 'inconnu',
      paysId: 'inconnu',
      demandeInformationEnCours: false,
      consentement: 'inconnu',
    },
    on: {
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
        guard: and(['isDemarcheEnInstruction', not('isDemandeInformationEnCours')]),
        actions: assign({ demandeInformationEnCours: true }),
      },
      RECEVOIR_INFORMATION: {
        guard: and(['isDemarcheEnInstruction', 'isDemandeInformationEnCours']),
        actions: assign({ demandeInformationEnCours: false }),
      },
    },
    states: {
      demandeAFaire: {
        on: {
          FAIRE_DEMANDE: {
            target: 'enregistrementDeLaDemandeAFaire',
            actions: assign({
              demarcheStatut: DemarchesStatutsIds.EnInstruction,
              concurrence: ({ event }) => event.concurrence,
              hasTitreFrom: ({ event }) => event.hasTitreFrom,
              paysId: ({ event }) => event.paysId,
              consentement: ({ event }) => event.consentement,
              surface: ({ event }) => event.surface,
            }),
          },
        },
      },
      enregistrementDeLaDemandeAFaire: {
        on: {
          ENREGISTRER_DEMANDE: 'recevabiliteOuInformationDuPrefetEtCollectivitesAFaire',
        },
      },
      recevabiliteOuInformationDuPrefetEtCollectivitesAFaire: {
        type: 'parallel',
        states: {
          recevabiliteAFaireMachine: {
            initial: 'recevabiliteAFaire',
            states: {
              recevabiliteAFaire: {
                on: {
                  FAIRE_RECEVABILITE_FAVORABLE: 'recevabiliteFavorableFaite',
                  FAIRE_RECEVABILITE_DEFAVORABLE: 'demandeDeComplementsAFaire',
                },
              },
              demandeDeComplementsAFaire: {
                on: {
                  FAIRE_DEMANDE_DE_COMPLEMENTS: 'reponseALaDemandeDeComplements',
                },
              },
              reponseALaDemandeDeComplements: {
                on: {
                  FAIRE_DECLARATION_IRRECEVABILITE: '#finDeMachineIrrecevable',
                  RECEVOIR_COMPLEMENTS: 'recevabiliteOuIrrecevabiliteAFaire',
                },
              },
              recevabiliteOuIrrecevabiliteAFaire: {
                on: {
                  FAIRE_RECEVABILITE_FAVORABLE: 'recevabiliteFavorableFaite',
                  FAIRE_RECEVABILITE_DEFAVORABLE: 'demandeDeComplementsAFaire',
                  FAIRE_DECLARATION_IRRECEVABILITE: '#finDeMachineIrrecevable',
                },
              },
              recevabiliteFavorableFaite: {
                type: 'final',
              },
            },
          },
          informationDuPrefetEtCollectivitesAFaireMachine: {
            initial: 'informationDuPrefetEtCollectivitesAFaire',
            states: {
              informationDuPrefetEtCollectivitesAFaire: {
                always: {
                  target: 'fin',
                  guard: not('isPerOuConcession'),
                },
                on: {
                  RENDRE_INFORMATION_DU_PREFET_ET_DES_COLLECTIVITES: 'fin',
                },
              },
              fin: {
                type: 'final',
              },
            },
          },
        },
        onDone: 'recevabiliteFavorableEtInformationDuPrefetEtDeCollectivitesFaite',
      },
      recevabiliteFavorableEtInformationDuPrefetEtDeCollectivitesFaite: {
        type: 'parallel',
        states: {
          avisCGEouResultatMiseEnConcurrenceAFaireMachine: {
            initial: 'avisCGEouResultatMiseEnConcurrenceAFaire',
            states: {
              avisCGEouResultatMiseEnConcurrenceAFaire: {
                always: [
                  {
                    target: 'fin',
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
                    {
                      target: 'enAttente',
                      guard: and(['canHaveMiseEnConcurrence', 'isPremiereDemandePourMiseEnConcurrence', ({ event }) => event.status === ETAPES_STATUTS.PROGRAMME]),
                    },
                  ],
                },
              },
              enAttente: {},
              resultatMiseEnConcurrenceAFaire: {
                on: {
                  RENDRE_RESULTAT_MISE_EN_CONCURRENCE_ACCEPTEE: 'fin',
                  RENDRE_RESULTAT_MISE_EN_CONCURRENCE_REJETEE: {
                    target: '#finDeMachine',
                    actions: assign({ demarcheStatut: DemarchesStatutsIds.Rejete }),
                  },
                },
              },

              fin: {
                type: 'final',
              },
            },
          },

          notificationAuDemandeurAFaireMachine: {
            initial: 'notificationAuDemandeurAFaire',

            states: {
              notificationAuDemandeurAFaire: {
                always: {
                  guard: not('isPerOuConcession'),
                  target: 'fin',
                },
                on: {
                  NOTIFIER_DEMANDEUR: 'fin',
                },
              },
              fin: {
                type: 'final',
              },
            },
          },

          demandeDeConsentementAFaireMachine: {
            initial: 'demandeDeConsentementAFaire',

            states: {
              demandeDeConsentementAFaire: {
                always: {
                  guard: not('consentementAFaire'),
                  target: 'fin',
                },
                on: {
                  FAIRE_DEMANDE_DE_CONSENTEMENT: 'fin',
                },
              },
              fin: {
                type: 'final',
              },
            },
          },
        },
        onDone: 'avisCGE_IGEDD_AFaire',
      },
      notificationAuDemandeurOuDemandeDeModificationAESAFaire: {
        on: {
          FAIRE_DEMANDE_MODIFICATION_AES: 'avisCGE_IGEDD_AFaire',
          NOTIFIER_DEMANDEUR: 'lettreDeSaisineDuPrefetOuReponseDuDemandeurAFaire',
        },
      },
      avisCGE_IGEDD_AFaire: {
        always: {
          target: 'avisCollectivitesEtServicesEtCommissionsAFaireMachine',
          guard: 'isAxmOuAr',
        },
        on: {
          RENDRE_AVIS_CGE_IGEDD: {
            target: 'notificationAuDemandeurOuDemandeDeModificationAESAFaire',
            guard: not('isAxmOuAr'),
          },
        },
      },
      lettreDeSaisineDuPrefetOuReponseDuDemandeurAFaire: {
        on: {
          RECEVOIR_REPONSE_DEMANDEUR: 'lettreDeSaisineDuPrefetOuReponseDuDemandeurAFaire',
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
                on: {
                  RENDRE_AVIS_PREFET: [
                    { target: 'fin', guard: not('isOutreMer') },
                    {
                      target: 'avisCommissionDepartementaleDesMinesARendre',
                      guard: 'isOutreMer',
                    },
                  ],
                },
              },
              avisCommissionDepartementaleDesMinesARendre: {
                on: {
                  RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES: 'fin',
                },
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
                always: {
                  guard: 'isARM',
                  target: 'fin',
                },
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
                      guard: and([not('isEnquetePubliqueRequired'), ({ event }) => event.status === ETAPES_STATUTS.EN_COURS]),
                      actions: assign({ visibilite: 'publique' }),
                    },
                    {
                      target: 'enAttente',
                      guard: and([not('isEnquetePubliqueRequired'), ({ event }) => event.status === ETAPES_STATUTS.PROGRAMME]),
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
        onDone: 'consultationDesAdministrationsCentralesOuDecisionAdministrationAFaire',
      },
      consultationDesAdministrationsCentralesOuDecisionAdministrationAFaire: {
        always: {
          target: 'decisionAdministrationAFaire',
          guard: not('isPerOuConcessionGranulatsMarins'),
        },
        on: {
          FAIRE_CONSULTATION_DES_ADMINISTRATIONS_CENTRALES: 'decisionAdministrationAFaire',
        },
      },
      decisionAdministrationAFaire: {
        on: {
          RENDRE_DECISION_ADMINISTRATION_ACCEPTEE: {
            target: 'publicationAuRecueilDesActesAdministratifsOupublicationAuJORFOuMesuresDePubliciteMachine',
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
      publicationAuRecueilDesActesAdministratifsOupublicationAuJORFOuMesuresDePubliciteMachine: {
        type: 'parallel',
        states: {
          mesuresDePubliciteMachine: {
            initial: 'mesuresDePubliciteAFaire',
            states: {
              mesuresDePubliciteAFaire: {
                on: { RENDRE_MESURES_DE_PUBLICITE: 'finMesuresDePublicite' },
              },
              finMesuresDePublicite: { type: 'final' },
            },
          },
          publicationAuRecueilDesActesAdministratifsOupublicationAuJORFMachine: {
            initial: 'publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire',
            states: {
              publicationAuRecueilDesActesAdministratifsOupublicationAuJORFAFaire: {
                on: {
                  PUBLIER_DECISION_ACCEPTEE_AU_JORF: {
                    target: 'fin',
                    actions: assign({ demarcheStatut: DemarchesStatutsIds.AccepteEtPublie }),
                  },
                  PUBLIER_DECISION_AU_RECUEIL_DES_ACTES_ADMINISTRATIFS: {
                    target: 'fin',
                    actions: assign({ demarcheStatut: DemarchesStatutsIds.AccepteEtPublie }),
                  },
                },
              },
              fin: { type: 'final' },
            },
          },
        },
        onDone: 'abrogationOuNotificationAuDemandeurMachine',
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
          NOTIFIER_DEMANDEUR: 'finDeMachineIrrecevable',
        },
      },
      finDeMachineIrrecevable: {
        id: 'finDeMachineIrrecevable',
        always: {
          target: 'finDeMachine',
          actions: assign({ demarcheStatut: DemarchesStatutsIds.Rejete }),
        },
      },
      finDeMachine: {
        id: 'finDeMachine',
        type: 'final',
      },
    },
  })
