import { assign, createMachine } from 'xstate'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { CaminoMachine } from '../machine-helper'
import { CaminoCommonContext, DBEtat, Etape } from '../machine-common'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { CaminoDate, dateAddMonths, daysBetween } from 'camino-common/src/date'
import { PAYS_IDS, PaysId, isGuyane, isMetropole, isOutreMer } from 'camino-common/src/static/pays'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'

type RendreAvisMiseEnConcurrentJORF = {
  date: CaminoDate
  type: 'RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF'
}

type OuvrirParticipationDuPublic = {
  date: CaminoDate
  status: EtapeStatutId
  type: 'OUVRIR_PARTICIPATION_DU_PUBLIC'
}

type RendreAvisServicesEtCommissionsConsultatives = {
  date: CaminoDate
  type: 'RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES'
}

type RendreAvisCDM = {
  date: CaminoDate
  type: 'RENDRE_AVIS_CDM'
}

type RendreRapportDREAL = {
  date: CaminoDate
  type: 'RENDRE_RAPPORT_DREAL'
}

type FaireDemande = {
  type: 'FAIRE_DEMANDE'
  paysId: PaysId
  surface: number
}

type XStateEvent =
  | FaireDemande
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'FAIRE_SAISINE_PREFET' }
  | { type: 'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE' }
  | RendreAvisMiseEnConcurrentJORF
  | { type: 'DEPOSER_DEMANDE_CONCURRENTE' }
  | OuvrirParticipationDuPublic
  | RendreAvisServicesEtCommissionsConsultatives
  | { type: 'RENDRE_AVIS_POLICE_EAU' }
  | RendreAvisCDM
  | RendreRapportDREAL
  | { type: 'RENDRE_AVIS_PREFET' }
  | { type: 'FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES' }
  | { type: 'RENDRE_AVIS_DES_COLLECTIVITES' }
  | { type: 'FAIRE_SAISINE_CONSEIL_GENERAL_CHARGE_DES_MINES' }
  | { type: 'FAIRE_RAPPORT_CONSEIL_GENERAL_CHARGE_DES_MINES' }
  | { type: 'RENDRE_AVIS_CONSEIL_GENERAL_CHARGE_DES_MINES' }
  | { type: 'FAIRE_SAISINE_AUTORITE_SIGNATAIRE' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_ACCEPTE' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_REJETE' }
  | { type: 'FAIRE_PUBLICATION_AU_JORF' }
  | { type: 'NOTIFIER_PREFET' }
  | { type: 'NOTIFIER_DEMANDEUR' }
  | { type: 'PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS' }
  | { type: 'PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL' }
  | { type: 'NOTIFIER_COLLECTIVITES_LOCALES' }
  | { type: 'RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF' }
  | { type: 'RENDRE_DECISION_ABROGATION' }
  | { type: 'DESISTER_PAR_LE_DEMANDEUR' }
  | { type: 'CLASSER_SANS_SUITE' }
  | { type: 'MODIFIER_DEMANDE' }
  | { type: 'DEMANDER_INFORMATIONS' }
  | { type: 'RECEVOIR_INFORMATIONS' }

type Event = XStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: EtapesTypesEtapesStatuts.demande, mainStep: true },
  DEPOSER_DEMANDE: { db: EtapesTypesEtapesStatuts.depotDeLaDemande, mainStep: true },
  FAIRE_SAISINE_PREFET: { db: EtapesTypesEtapesStatuts.saisineDuPrefet, mainStep: true },
  DEMANDER_COMPLEMENTS_POUR_RECEVABILITE: { db: EtapesTypesEtapesStatuts.demandeDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE: { db: EtapesTypesEtapesStatuts.receptionDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
    db: {
      FAVORABLE: EtapesTypesEtapesStatuts.recevabiliteDeLaDemande.FAVORABLE,
    },
    mainStep: true,
  },
  FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE: {
    db: {
      DEFAVORABLE: EtapesTypesEtapesStatuts.recevabiliteDeLaDemande.DEFAVORABLE,
    },
    mainStep: true,
  },
  RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF: { db: EtapesTypesEtapesStatuts.avisDeMiseEnConcurrenceAuJORF, mainStep: true },
  DEPOSER_DEMANDE_CONCURRENTE: { db: EtapesTypesEtapesStatuts.avisDeDemandeConcurrente, mainStep: false },
  OUVRIR_PARTICIPATION_DU_PUBLIC: { db: EtapesTypesEtapesStatuts.participationDuPublic, mainStep: true },
  RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES: { db: EtapesTypesEtapesStatuts.avisDesServicesEtCommissionsConsultatives, mainStep: true },
  RENDRE_AVIS_POLICE_EAU: { db: EtapesTypesEtapesStatuts.expertiseDREALOuDGTMServiceEau, mainStep: false },

  RENDRE_AVIS_CDM: { db: EtapesTypesEtapesStatuts.avisDeLaCommissionDepartementaleDesMines_CDM_, mainStep: true },
  RENDRE_RAPPORT_DREAL: { db: EtapesTypesEtapesStatuts.rapportEtAvisDeLaDREAL, mainStep: true },
  RENDRE_AVIS_PREFET: { db: EtapesTypesEtapesStatuts.avisDuPrefet, mainStep: true },
  FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES: { db: EtapesTypesEtapesStatuts.saisineDesCollectivitesLocales, mainStep: true },
  RENDRE_AVIS_DES_COLLECTIVITES: { db: EtapesTypesEtapesStatuts.avisDesCollectivites, mainStep: true },
  FAIRE_SAISINE_CONSEIL_GENERAL_CHARGE_DES_MINES: { db: EtapesTypesEtapesStatuts.saisineDuConseilGeneralDeLeconomie_CGE_, mainStep: true },
  FAIRE_RAPPORT_CONSEIL_GENERAL_CHARGE_DES_MINES: { db: EtapesTypesEtapesStatuts.rapportDuConseilGeneralDeLeconomie_CGE_, mainStep: true },
  RENDRE_AVIS_CONSEIL_GENERAL_CHARGE_DES_MINES: { db: EtapesTypesEtapesStatuts.avisDuConseilGeneralDeLeconomie_CGE_, mainStep: true },
  FAIRE_SAISINE_AUTORITE_SIGNATAIRE: { db: EtapesTypesEtapesStatuts.saisineDeLautoriteSignataire, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_ACCEPTE: { db: { ACCEPTE: EtapesTypesEtapesStatuts.decisionDeLadministration.ACCEPTE }, mainStep: true },
  RENDRE_DECISION_ADMINISTRATION_REJETE: { db: { REJETE: EtapesTypesEtapesStatuts.decisionDeLadministration.REJETE }, mainStep: true },
  FAIRE_PUBLICATION_AU_JORF: { db: EtapesTypesEtapesStatuts.publicationDeDecisionAuJORF, mainStep: true },
  NOTIFIER_PREFET: { db: EtapesTypesEtapesStatuts.notificationAuPrefet, mainStep: true },
  NOTIFIER_DEMANDEUR: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur, mainStep: true },
  PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS: { db: EtapesTypesEtapesStatuts.publicationDeDecisionAuRecueilDesActesAdministratifs, mainStep: true },
  PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL: { db: EtapesTypesEtapesStatuts.publicationDansUnJournalLocalOuNational, mainStep: true },
  NOTIFIER_COLLECTIVITES_LOCALES: { db: EtapesTypesEtapesStatuts.notificationDesCollectivitesLocales, mainStep: true },
  RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF: { db: { REJETE: EtapesTypesEtapesStatuts.decisionDuJugeAdministratif.REJETE }, mainStep: true },
  RENDRE_DECISION_ABROGATION: { db: EtapesTypesEtapesStatuts.abrogationDeLaDecision, mainStep: true },
  DESISTER_PAR_LE_DEMANDEUR: { db: EtapesTypesEtapesStatuts.desistementDuDemandeur, mainStep: false },
  CLASSER_SANS_SUITE: { db: EtapesTypesEtapesStatuts.classementSansSuite, mainStep: false },
  MODIFIER_DEMANDE: { db: EtapesTypesEtapesStatuts.modificationDeLaDemande, mainStep: false },
  DEMANDER_INFORMATIONS: { db: EtapesTypesEtapesStatuts.demandeDinformations, mainStep: false },
  RECEVOIR_INFORMATIONS: { db: EtapesTypesEtapesStatuts.receptionDinformation, mainStep: false },
} as const

const SUPERFICIE_MAX_POUR_EXONERATION_AVIS_MISE_EN_CONCURRENCE_AU_JORF = 50

export class PrmOctMachine extends CaminoMachine<PrmOctContext, XStateEvent> {
  constructor() {
    super(prmOctMachine, trad)
  }

  override toPotentialCaminoXStateEvent(event: XStateEvent['type'], date: CaminoDate): XStateEvent[] {
    switch (event) {
      case 'RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF':
      case 'RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES':
      case 'RENDRE_AVIS_CDM':
      case 'RENDRE_RAPPORT_DREAL':
        return [{ type: event, date }]
      case 'OUVRIR_PARTICIPATION_DU_PUBLIC':
        return [
          { type: event, status: ETAPES_STATUTS.PROGRAMME, date },
          { type: event, status: ETAPES_STATUTS.EN_COURS, date },
          { type: event, status: ETAPES_STATUTS.TERMINE, date },
        ]
      case 'FAIRE_DEMANDE':
        return [
          { type: event, paysId: PAYS_IDS['Département de la Guyane'], surface: SUPERFICIE_MAX_POUR_EXONERATION_AVIS_MISE_EN_CONCURRENCE_AU_JORF + 1 },
          { type: event, paysId: PAYS_IDS['Département de la Guyane'], surface: SUPERFICIE_MAX_POUR_EXONERATION_AVIS_MISE_EN_CONCURRENCE_AU_JORF - 1 },
          { type: event, paysId: PAYS_IDS['Wallis-et-Futuna'], surface: 0 },
          { type: event, paysId: PAYS_IDS['République Française'], surface: 0 },
        ]
      default:
        // related to https://github.com/microsoft/TypeScript/issues/46497  https://github.com/microsoft/TypeScript/issues/40803 :(

        // @ts-ignore
        return [{ type: event }]
    }
  }

  override eventFromEntry(eventType: XStateEvent['type'], etape: Etape): XStateEvent {
    switch (eventType) {
      case 'FAIRE_DEMANDE':
        if (!etape.paysId) {
          console.info(`paysId is mandatory in etape ${JSON.stringify(etape)}, defaulting to FR.`)

          return { type: eventType, paysId: 'FR', surface: etape.surface ?? 0 }
        }

        if (etape.paysId === 'GF' && etape.surface === null && etape.surface === undefined) {
          throw new Error(`la surface pour la demande est obligatoire quand la demande est en Guyane  ${JSON.stringify(etape)}`)
        }

        return { type: eventType, paysId: etape.paysId, surface: etape.surface ?? 0 }
      default:
        return super.eventFromEntry(eventType, etape)
    }
  }
}

interface PrmOctContext extends CaminoCommonContext {
  dateAvisMiseEnConcurrentJorf: CaminoDate | null
  dateAvisDesServicesEtCommissionsConsultatives: CaminoDate | null
  paysId: PaysId | null
  surface: number | null
  participationPublicStatutId: EtapeStatutId | null
}

const peutOuvrirParticipationDuPublic = ({ context, event }: { context: PrmOctContext; event: OuvrirParticipationDuPublic }): boolean => {
  return estExempteDeLaMiseEnConcurrence({ context }) || (context.dateAvisMiseEnConcurrentJorf !== null && daysBetween(dateAddMonths(context.dateAvisMiseEnConcurrentJorf, 1), event.date) >= 0)
}

const peutRendreRapportDREAL = ({ context, event }: { context: PrmOctContext; event: RendreRapportDREAL }): boolean => {
  return !!context.dateAvisDesServicesEtCommissionsConsultatives && daysBetween(dateAddMonths(context.dateAvisDesServicesEtCommissionsConsultatives, 1), event.date) >= 0
}

const peutRendreAvisCDM = ({ context, event }: { context: PrmOctContext; event: RendreAvisCDM }): boolean => {
  return isOutreMer(context.paysId) && !!context.dateAvisDesServicesEtCommissionsConsultatives && daysBetween(dateAddMonths(context.dateAvisDesServicesEtCommissionsConsultatives, 1), event.date) >= 0
}

const estExempteDeLaMiseEnConcurrence = ({ context }: { context: PrmOctContext }): boolean => {
  if (isGuyane(context.paysId)) {
    if (context.surface === null) {
      throw new Error('la surface est obligatoire quand on est en Guyane')
    }

    return context.surface < SUPERFICIE_MAX_POUR_EXONERATION_AVIS_MISE_EN_CONCURRENCE_AU_JORF
  }

  return false
}

const prmOctMachine = createMachine({
  types: {} as { context: PrmOctContext; events: XStateEvent },
  id: 'oct',
  initial: 'demandeAFaire',
  context: {
    dateAvisMiseEnConcurrentJorf: null,
    dateAvisDesServicesEtCommissionsConsultatives: null,
    visibilite: 'confidentielle',
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
    paysId: null,
    surface: null,
    participationPublicStatutId: null,
  },
  on: {
    MODIFIER_DEMANDE: {
      actions: () => ({}),
      guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
    },
    DEMANDER_INFORMATIONS: {
      actions: () => ({}),
      guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
    },
    RECEVOIR_INFORMATIONS: {
      actions: () => ({}),
      guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
    },
    DESISTER_PAR_LE_DEMANDEUR: {
      target: '.done',
      guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
      actions: assign({
        demarcheStatut: DemarchesStatutsIds.Desiste,
        visibilite: 'publique',
      }),
    },
    CLASSER_SANS_SUITE: {
      target: '.done',
      guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
      actions: assign({
        demarcheStatut: DemarchesStatutsIds.ClasseSansSuite,
        visibilite: 'publique',
      }),
    },
  },
  states: {
    demandeAFaire: {
      on: {
        FAIRE_DEMANDE: {
          target: 'depotDeLaDemandeAFaire',
          actions: assign({
            paysId: ({ event }) => {
              return event.paysId
            },
            surface: ({ event }) => {
              return event.surface
            },
          }),
        },
      },
    },
    depotDeLaDemandeAFaire: {
      on: {
        DEPOSER_DEMANDE: {
          target: 'saisineDuPrefetAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Depose,
          }),
        },
      },
    },
    saisineDuPrefetAFaire: {
      on: {
        FAIRE_SAISINE_PREFET: 'recevabiliteDeLaDemandeAFaire',
      },
    },
    recevabiliteDeLaDemandeAFaire: {
      on: {
        DEMANDER_COMPLEMENTS_POUR_RECEVABILITE: 'complementsPourRecevabiliteAFaire',
        FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
          target: 'avisDeMiseEnConcurrenceAuJORFAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.EnInstruction,
            visibilite: 'publique',
          }),
        },
        FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE: 'recevabiliteDeLaDemandeAFaire',
      },
    },
    complementsPourRecevabiliteAFaire: {
      on: {
        RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE: 'recevabiliteDeLaDemandeAFaire',
        FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
          target: 'avisDeMiseEnConcurrenceAuJORFAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.EnInstruction,
            visibilite: 'publique',
          }),
        },
        FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE: 'complementsPourRecevabiliteAFaire',
      },
    },
    avisDeMiseEnConcurrenceAuJORFAFaire: {
      always: {
        guard: estExempteDeLaMiseEnConcurrence,
        target: 'saisinesEtMiseEnConcurrence',
      },
      on: {
        RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF: {
          target: 'saisinesEtMiseEnConcurrence',
          actions: assign({
            dateAvisMiseEnConcurrentJorf: ({ event }) => {
              return event.date
            },
          }),
        },
      },
    },
    saisinesEtMiseEnConcurrence: {
      type: 'parallel',
      states: {
        saisinesEtAvisAFaire: {
          initial: 'saisinesMachine',
          states: {
            saisinesMachine: {
              type: 'parallel',
              states: {
                saisineDesCollectivitesLocalesMachine: {
                  initial: 'saisineDesCollectivitesLocalesAFaire',
                  states: {
                    saisineDesCollectivitesLocalesAFaire: {
                      always: {
                        guard: ({ context }) => !isGuyane(context.paysId),
                        target: 'done',
                      },
                      on: {
                        FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES: 'avisDesCollectivitesARendre',
                      },
                    },
                    avisDesCollectivitesARendre: {
                      on: {
                        RENDRE_AVIS_DES_COLLECTIVITES: 'done',
                      },
                    },
                    done: { type: 'final' },
                  },
                },
                avisDesServicesEtCommissionsConsultativesMachine: {
                  initial: 'avisDesServicesEtCommissionsConsultativesAFaire',
                  states: {
                    avisDesServicesEtCommissionsConsultativesAFaire: {
                      on: {
                        RENDRE_AVIS_SERVICES_ET_COMMISSIONS_CONSULTATIVES: {
                          target: 'avisDesServicesRendus',
                          actions: assign({
                            dateAvisDesServicesEtCommissionsConsultatives: ({ event }) => event.date,
                          }),
                        },
                      },
                    },
                    avisDesServicesRendus: {
                      type: 'final',
                      on: {
                        RENDRE_AVIS_CDM: { target: '#rapportDREALAFaire', guard: peutRendreAvisCDM },
                        RENDRE_RAPPORT_DREAL: { target: '#avisPrefetARendre', guard: peutRendreRapportDREAL },
                      },
                    },
                  },
                },
              },
              onDone: 'avisCommissionDepartementaleDesMinesEnGuyaneEtOutreMerOuRapportDeLaDREALARendre',
            },
            avisCommissionDepartementaleDesMinesEnGuyaneEtOutreMerOuRapportDeLaDREALARendre: {
              always: [
                {
                  target: 'avisCommissionDepartementaleDesMinesEnGuyaneEtOutreMerARendre',
                  guard: ({ context }) => isOutreMer(context.paysId),
                },
                {
                  target: 'rapportDREALAFaire',
                  guard: ({ context }) => isMetropole(context.paysId),
                },
              ],
            },
            avisCommissionDepartementaleDesMinesEnGuyaneEtOutreMerARendre: {
              on: {
                RENDRE_AVIS_CDM: {
                  target: 'rapportDREALAFaire',
                  guard: peutRendreAvisCDM,
                },
              },
            },
            rapportDREALAFaire: {
              id: 'rapportDREALAFaire',
              on: {
                RENDRE_RAPPORT_DREAL: {
                  target: 'avisPrefetARendre',
                  guard: peutRendreRapportDREAL,
                },
              },
            },
            avisPrefetARendre: {
              id: 'avisPrefetARendre',
              on: {
                RENDRE_AVIS_PREFET: 'done',
              },
            },
            done: { type: 'final' },
          },
        },
        miseEnConcurrenceMachine: {
          initial: 'participationDuPublicPasEncorePossible',
          states: {
            participationDuPublicPasEncorePossible: {
              on: {
                DEPOSER_DEMANDE_CONCURRENTE: { target: 'participationDuPublicPasEncorePossible', guard: value => !estExempteDeLaMiseEnConcurrence(value) },
                OUVRIR_PARTICIPATION_DU_PUBLIC: {
                  target: 'clotureParticipationDuPublicAFaire',
                  guard: peutOuvrirParticipationDuPublic,
                  actions: assign({
                    participationPublicStatutId: ({ event }) => event.status,
                  }),
                },
              },
            },
            clotureParticipationDuPublicAFaire: {
              always: {
                target: 'done',
                guard: ({ context }) => context.participationPublicStatutId === ETAPES_STATUTS.TERMINE,
              },
            },
            done: { type: 'final' },
          },
        },
      },
      onDone: 'saisineDuConseilGeneralChargeDesMinesAFaire',
    },
    saisineDuConseilGeneralChargeDesMinesAFaire: {
      on: {
        FAIRE_SAISINE_CONSEIL_GENERAL_CHARGE_DES_MINES: 'rapportDuConseilGeneralDesMinesAFaire',
      },
    },
    rapportDuConseilGeneralDesMinesAFaire: {
      on: {
        FAIRE_RAPPORT_CONSEIL_GENERAL_CHARGE_DES_MINES: 'avisDuConseilGeneralDesMinesARendre',
      },
    },
    avisDuConseilGeneralDesMinesARendre: {
      on: {
        RENDRE_AVIS_CONSEIL_GENERAL_CHARGE_DES_MINES: 'saisineDeLAutoriteSignataireAFaire',
      },
    },
    saisineDeLAutoriteSignataireAFaire: {
      on: {
        FAIRE_SAISINE_AUTORITE_SIGNATAIRE: 'decisionDeLAdministrationARendre',
      },
    },
    decisionDeLAdministrationARendre: {
      on: {
        RENDRE_DECISION_ADMINISTRATION_ACCEPTE: 'publicationAuJORFAFaire',
        RENDRE_DECISION_ADMINISTRATION_REJETE: {
          target: 'decisionsEtNotificationsRejetAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
        },
      },
    },
    publicationAuJORFAFaire: {
      on: {
        FAIRE_PUBLICATION_AU_JORF: {
          target: 'notificationsAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
      },
    },
    notificationsAFaire: {
      type: 'parallel',
      states: {
        notificationDuPrefetMachine: {
          initial: 'notificationDuPrefetAFaire',
          states: {
            notificationDuPrefetAFaire: {
              on: { NOTIFIER_PREFET: 'notificationDuPrefetFaite' },
            },
            notificationDuPrefetFaite: { type: 'final' },
          },
        },
        notificationDuDemandeurMachine: {
          initial: 'notificationDuDemandeurAFaire',
          states: {
            notificationDuDemandeurAFaire: {
              on: { NOTIFIER_DEMANDEUR: 'notificationDuDemandeurFaite' },
            },
            notificationDuDemandeurFaite: { type: 'final' },
          },
        },
        publicationDecisionsRecueilActesAdministratifsMachine: {
          initial: 'publicationDecisionsRecueilActesAdministratifsAFaire',
          states: {
            publicationDecisionsRecueilActesAdministratifsAFaire: {
              on: {
                PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS: 'publicationDecisionsRecueilActesAdministratifsFaite',
              },
            },
            publicationDecisionsRecueilActesAdministratifsFaite: {
              type: 'final',
            },
          },
        },
        publicationDansUnJournalLocalOuNationalMachine: {
          initial: 'publicationDansUnJournalLocalOuNationalAFaire',
          states: {
            publicationDansUnJournalLocalOuNationalAFaire: {
              on: {
                PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL: 'publicationDansUnJournalLocalOuNationalFaite',
              },
            },
            publicationDansUnJournalLocalOuNationalFaite: { type: 'final' },
          },
        },
        notificationDesCollectivitesLocalesMachine: {
          initial: 'notificationDesCollectivitesLocalesAFaire',
          states: {
            notificationDesCollectivitesLocalesAFaire: {
              on: {
                NOTIFIER_COLLECTIVITES_LOCALES: 'notificationDesCollectivitesLocalesFaite',
              },
            },
            notificationDesCollectivitesLocalesFaite: { type: 'final' },
          },
        },
      },
      onDone: 'done',
    },
    decisionsEtNotificationsRejetAFaire: {
      type: 'parallel',
      states: {
        notificationsMachine: {
          initial: 'notificationDuPrefetAFaire',
          states: {
            notificationDuPrefetAFaire: {
              on: { NOTIFIER_PREFET: 'notificationDuDemandeurAFaire' },
            },
            notificationDuDemandeurAFaire: {
              on: { NOTIFIER_DEMANDEUR: 'notificationDuDemandeurFaite' },
            },
            notificationDuDemandeurFaite: { type: 'final' },
          },
        },
        decisionsMachine: {
          initial: 'decisionARendre',
          states: {
            decisionARendre: {
              on: {
                RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF: 'done',
                RENDRE_DECISION_ABROGATION: 'publicationAuJORFAFaireSuiteAuRejet',
              },
            },
            publicationAuJORFAFaireSuiteAuRejet: {
              on: {
                FAIRE_PUBLICATION_AU_JORF: 'done',
              },
            },
            done: { type: 'final' },
          },
        },
      },
      onDone: 'done',
    },
    done: { type: 'final' },
  },
})
