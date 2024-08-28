import { assign, createMachine } from 'xstate'
import { CaminoMachine } from '../machine-helper'
import { CaminoCommonContext, DBEtat, Etape, tags } from '../machine-common'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { CaminoDate, dateAddMonths, daysBetween } from 'camino-common/src/date'

type RendreAvisDesServicesEtCommissionsConsultatives = {
  date: CaminoDate
  type: 'RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES'
}

type RendreAvisDreal = {
  date: CaminoDate
  type: 'RENDRE_AVIS_DREAL'
}

type AXMOctXStateEvent =
  | { type: 'FAIRE_DEMANDE' }
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'RENDRE_DAE_EXEMPTEE' }
  | { type: 'RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_FAVORABLE' }
  | { type: 'RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_FAVORABLE_AVEC_RESERVE' }
  | { type: 'RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_DEFAVORABLE' }
  | { type: 'RENDRE_DAE_REQUISE' }
  | { type: 'MODIFIER_DEMANDE_APRES_DAE' }
  | { type: 'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE' }
  | { type: 'MODIFIER_LA_DEMANDE' }
  | { type: 'FAIRE_SAISINE_COLLECTIVITES_LOCALES' }
  | { type: 'RENDRE_AVIS_DES_COLLECTIVITES' }
  | RendreAvisDreal
  | RendreAvisDesServicesEtCommissionsConsultatives
  | { type: 'FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES' }
  | { type: 'RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES' }
  | { type: 'RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE' }
  | { type: 'FAIRE_SAISINE_AUTORITE_SIGNATAIRE' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_ACCEPTE' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_REJETE' }
  | { type: 'NOTIFIER_DEMANDEUR' }
  | { type: 'PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS' }
  | { type: 'PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL' }
  | { type: 'NOTIFIER_COLLECTIVITES_LOCALES' }
  | { type: 'RENDRE_DECISION_ABROGATION' }
  | { type: 'DEMANDER_INFORMATION_POUR_AVIS_DREAL' }
  | { type: 'RECEVOIR_INFORMATION_POUR_AVIS_DREAL' }
  | { type: 'RENDRE_DECISION_IMPLICITE_REJET' }
  | { type: 'RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF' }
  | { type: 'FAIRE_DESISTEMENT_DEMANDEUR' }
  | { type: 'FAIRE_CLASSEMENT_SANS_SUITE' }

type Event = AXMOctXStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  RENDRE_DAE_EXEMPTEE: {
    db: {
      EXEMPTE: ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
    },
    mainStep: true,
  },
  RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_FAVORABLE: {
    db: {
      FAVORABLE: ETES.decisionDuProprietaireDuSol.FAVORABLE,
    },
    mainStep: true,
  },
  RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_FAVORABLE_AVEC_RESERVE: {
    db: {
      FAVORABLE_AVEC_RESERVE: ETES.decisionDuProprietaireDuSol.FAVORABLE_AVEC_RESERVE,
    },
    mainStep: false,
  },
  RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_DEFAVORABLE: {
    db: {
      DEFAVORABLE: ETES.decisionDuProprietaireDuSol.DEFAVORABLE,
    },
    mainStep: false,
  },
  RENDRE_DAE_REQUISE: {
    db: {
      REQUIS: ETES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.REQUIS,
    },
    mainStep: false,
  },
  FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
    db: {
      FAVORABLE: ETES.recevabiliteDeLaDemande.FAVORABLE,
    },
    mainStep: true,
  },
  FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE: {
    db: {
      DEFAVORABLE: ETES.recevabiliteDeLaDemande.DEFAVORABLE,
    },
    mainStep: false,
  },
  RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE: {
    db: {
      AJOURNE: ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.AJOURNE,
    },
    mainStep: false,
  },
  RENDRE_DECISION_ADMINISTRATION_ACCEPTE: {
    db: {
      ACCEPTE: ETES.decisionDeLadministration.ACCEPTE,
    },
    mainStep: true,
  },
  RENDRE_DECISION_ADMINISTRATION_REJETE: {
    db: {
      REJETE: ETES.decisionDeLadministration.REJETE,
    },
    mainStep: false,
  },
  RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES: {
    db: {
      FAVORABLE: ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE,
      FAVORABLE_AVEC_RESERVE: ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.FAVORABLE_AVEC_RESERVE,
      DEFAVORABLE: ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.DEFAVORABLE,
      DEFAVORABLE_AVEC_RESERVES: ETES.avisDeLaCommissionDepartementaleDesMines_CDM_.DEFAVORABLE_AVEC_RESERVES,
    },
    mainStep: true,
  },
  FAIRE_DEMANDE: { db: ETES.demande, mainStep: true },
  DEPOSER_DEMANDE: { db: ETES.depotDeLaDemande, mainStep: true },
  MODIFIER_DEMANDE_APRES_DAE: { db: ETES.modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, mainStep: true },
  DEMANDER_COMPLEMENTS_POUR_RECEVABILITE: { db: ETES.demandeDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE: { db: ETES.receptionDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  MODIFIER_LA_DEMANDE: { db: ETES.modificationDeLaDemande, mainStep: true },
  FAIRE_SAISINE_COLLECTIVITES_LOCALES: { db: ETES.saisineDesCollectivitesLocales, mainStep: true },
  RENDRE_AVIS_DES_COLLECTIVITES: { db: ETES.avisDesCollectivites, mainStep: false },
  RENDRE_AVIS_DREAL: { db: ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement, mainStep: true },
  RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES: { db: ETES.avisDesServicesEtCommissionsConsultatives, mainStep: true },
  FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES: { db: ETES.saisineDeLaCommissionDepartementaleDesMines_CDM_, mainStep: false },
  FAIRE_SAISINE_AUTORITE_SIGNATAIRE: { db: ETES.saisineDeLautoriteSignataire, mainStep: false },
  NOTIFIER_DEMANDEUR: { db: ETES.notificationAuDemandeur, mainStep: true },
  PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS: { db: ETES.publicationDeDecisionAuRecueilDesActesAdministratifs, mainStep: true },
  PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL: { db: ETES.publicationDansUnJournalLocalOuNational, mainStep: true },
  NOTIFIER_COLLECTIVITES_LOCALES: { db: ETES.notificationDesCollectivitesLocales, mainStep: true },
  RENDRE_DECISION_ABROGATION: { db: ETES.abrogationDeLaDecision, mainStep: false },
  DEMANDER_INFORMATION_POUR_AVIS_DREAL: { db: ETES.demandeDinformations_AvisDuDREALDEALOuDGTM_, mainStep: false },
  RECEVOIR_INFORMATION_POUR_AVIS_DREAL: { db: ETES.receptionDinformation_AvisDuDREALDEALOuDGTM_, mainStep: false },
  // TODO 2023-04-19 RENDRE_DECISION_IMPLICITE_REJET est une étape principale le jour où on gère le délai entre la mdp et le rejet implicite
  RENDRE_DECISION_IMPLICITE_REJET: { db: { REJETE: ETES.decisionImplicite.REJETE }, mainStep: false },
  RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF: { db: ETES.decisionDuJugeAdministratif, mainStep: false },
  FAIRE_DESISTEMENT_DEMANDEUR: { db: ETES.desistementDuDemandeur, mainStep: false },
  FAIRE_CLASSEMENT_SANS_SUITE: { db: ETES.classementSansSuite, mainStep: false },
}

// Related to https://github.com/Microsoft/TypeScript/issues/12870
const EVENTS = Object.keys(trad) as Array<Extract<keyof typeof trad, string>>

// basé sur https://cacoo.com/diagrams/iUPEVBYNBjsiirfE/249D0
export class AxmOctMachine extends CaminoMachine<AxmContext, AXMOctXStateEvent> {
  constructor() {
    super(axmOctMachine, trad)
  }

  toPotentialCaminoXStateEvent(event: AXMOctXStateEvent['type'], date: CaminoDate): AXMOctXStateEvent[] {
    switch (event) {
      case 'RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES':
      case 'RENDRE_AVIS_DREAL':
        return [{ type: event, date }]
      default:
        // related to https://github.com/microsoft/TypeScript/issues/46497  https://github.com/microsoft/TypeScript/issues/40803 :(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return [{ type: event }]
    }
  }

  eventFrom(etape: Etape): AXMOctXStateEvent {
    const entries = Object.entries(trad).filter((entry): entry is [Event, { db: DBEtat; mainStep: boolean }] => EVENTS.includes(entry[0]))

    const entry = entries.find(([_key, { db: dbEtat }]) => {
      return Object.values(dbEtat).some(dbEtatSingle => dbEtatSingle.etapeTypeId === etape.etapeTypeId && dbEtatSingle.etapeStatutId === etape.etapeStatutId)
    })

    if (entry) {
      const eventFromEntry = entry[0]
      switch (eventFromEntry) {
        case 'RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES':
        case 'RENDRE_AVIS_DREAL': {
          return { type: eventFromEntry, date: etape.date }
        }
        default:
          // related to https://github.com/microsoft/TypeScript/issues/46497  https://github.com/microsoft/TypeScript/issues/40803 :(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return { type: eventFromEntry }
      }
    }
    throw new Error(`no event from ${JSON.stringify(etape)}`)
  }
}

type RendreAvisDesServicesEtCommissonsConsultatives = { faite: false } | { faite: true; date: CaminoDate }
interface AxmContext extends CaminoCommonContext {
  demandeFaite: boolean
  notificationDuDemandeurFaite: boolean
  notificationDesCollectivitesLocalesFaite: boolean
  publicationDecisionsRecueilActesAdministratifsFaite: boolean
  publicationDansUnJournalLocalOuNationalFaite: boolean
  daeRequiseOuDemandeDeposee: boolean
  saisineDesCollectivitesLocalesFaite: boolean
  avisDesServicesEtCommissionsConsultatives: RendreAvisDesServicesEtCommissonsConsultatives
}

const peutRendreAvisDREAL = ({ context, event }: { context: AxmContext; event: RendreAvisDreal }): boolean => {
  return context.avisDesServicesEtCommissionsConsultatives.faite && daysBetween(dateAddMonths(context.avisDesServicesEtCommissionsConsultatives.date, 1), event.date) >= 0
}

const axmOctMachine = createMachine({
  types: {} as { context: AxmContext; events: AXMOctXStateEvent },

  id: 'AXMOct',
  initial: 'demandeAFaireEtDecisionsARendre',
  context: {
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
    demandeFaite: false,
    notificationDuDemandeurFaite: false,
    notificationDesCollectivitesLocalesFaite: false,
    publicationDecisionsRecueilActesAdministratifsFaite: false,
    publicationDansUnJournalLocalOuNationalFaite: false,
    saisineDesCollectivitesLocalesFaite: false,
    avisDesServicesEtCommissionsConsultatives: { faite: false },
    daeRequiseOuDemandeDeposee: false,
    visibilite: 'confidentielle',
  },
  on: {
    FAIRE_DESISTEMENT_DEMANDEUR: {
      guard: ({ context }) => context.demandeFaite && [DemarchesStatutsIds.EnConstruction, DemarchesStatutsIds.Depose, DemarchesStatutsIds.EnInstruction].includes(context.demarcheStatut),
      target: '.desistementDuDemandeurRendu',
    },
    FAIRE_CLASSEMENT_SANS_SUITE: {
      guard: ({ context }) =>
        context.daeRequiseOuDemandeDeposee && [DemarchesStatutsIds.EnConstruction, DemarchesStatutsIds.Depose, DemarchesStatutsIds.EnInstruction].includes(context.demarcheStatut),
      target: '.classementSansSuiteRendu',
    },
  },
  states: {
    demandeAFaireEtDecisionsARendre: {
      type: 'parallel',
      states: {
        demandeMachine: {
          initial: 'demandeAFaire',
          states: {
            demandeAFaire: {
              on: {
                FAIRE_DEMANDE: 'demandeFaite',
              },
            },
            demandeFaite: {
              type: 'final',
              entry: assign({ demandeFaite: true }),
            },
          },
        },
        decisionAutoriteEnvironnementaleMachine: {
          initial: 'decisionARendre',
          states: {
            decisionARendre: {
              on: {
                RENDRE_DAE_REQUISE: {
                  target: 'demandeAModifier',
                  actions: assign({
                    daeRequiseOuDemandeDeposee: true,
                  }),
                },
                RENDRE_DAE_EXEMPTEE: 'demandeExemptee',
              },
            },
            demandeAModifier: {
              on: { MODIFIER_DEMANDE_APRES_DAE: 'demandeModifiee' },
            },
            demandeExemptee: { type: 'final' },
            demandeModifiee: { type: 'final' },
          },
        },
        decisionDuProprietaireDuSolMachine: {
          initial: 'decisionARendre',
          states: {
            decisionARendre: {
              on: {
                RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_FAVORABLE: 'decisionRendue',
                RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_FAVORABLE_AVEC_RESERVE: 'decisionRendue',
                RENDRE_DECISION_DU_PROPRIETAIRE_DU_SOL_DEFAVORABLE: '#classementSansSuiteAFaire',
              },
            },
            decisionRendue: { type: 'final' },
          },
        },
      },

      onDone: {
        target: 'depotDeLaDemandeAFaire',
      },
    },
    depotDeLaDemandeAFaire: {
      tags: [tags.responsable[ADMINISTRATION_IDS['DGTM - GUYANE']]],
      on: {
        DEPOSER_DEMANDE: {
          target: 'recevabiliteDeLaDemandeAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Depose,
            daeRequiseOuDemandeDeposee: true,
          }),
        },
      },
    },
    recevabiliteDeLaDemandeAFaire: {
      tags: [tags.responsable[ADMINISTRATION_IDS['DGTM - GUYANE']]],
      on: {
        DEMANDER_COMPLEMENTS_POUR_RECEVABILITE: 'complementsPourRecevabiliteAFaire',
        FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
          target: 'saisinesAFairePuisRendreAvisDREAL',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.EnInstruction,
            visibilite: 'publique',
          }),
        },
        FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE: 'modificationDeLaDemandeAFaire',
        RENDRE_DECISION_IMPLICITE_REJET: {
          target: 'decisionAnnulationParJugeAdministratifAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Rejete,
            visibilite: 'publique',
          }),
        },
      },
    },
    complementsPourRecevabiliteAFaire: {
      on: {
        RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE: 'recevabiliteDeLaDemandeAFaire',
        FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
          target: 'saisinesAFairePuisRendreAvisDREAL',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.EnInstruction,
            visibilite: 'publique',
          }),
        },
        FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE: 'modificationDeLaDemandeAFaire',
      },
    },
    modificationDeLaDemandeAFaire: {
      on: {
        MODIFIER_LA_DEMANDE: 'recevabiliteDeLaDemandeAFaire',
      },
    },
    saisinesAFairePuisRendreAvisDREAL: {
      type: 'parallel',
      states: {
        rendreAvisDrealMachine: {
          initial: 'rendreAvisDrealPasEncorePossible',
          states: {
            rendreAvisDrealPasEncorePossible: {
              always: {
                target: 'rendreAvisDrealAFaire',
                guard: ({ context }) => context.avisDesServicesEtCommissionsConsultatives.faite && context.saisineDesCollectivitesLocalesFaite,
              },
            },
            rendreAvisDrealAFaire: {
              tags: [tags.responsable[ADMINISTRATION_IDS['DGTM - GUYANE']]],
              on: {
                RENDRE_AVIS_DREAL: {
                  guard: peutRendreAvisDREAL,
                  target: '#saisineOuAvisCommissionDepartementaleDesMinesARendre',
                },
              },
            },
          },
        },
        demandeInformationPourAvisDREALMachine: {
          initial: 'demandeInformationPourAvisDREALAFaire',
          states: {
            demandeInformationPourAvisDREALAFaire: {
              on: {
                DEMANDER_INFORMATION_POUR_AVIS_DREAL: 'receptionInformationPourAvisDREALAFaire',
              },
            },
            receptionInformationPourAvisDREALAFaire: {
              on: {
                RECEVOIR_INFORMATION_POUR_AVIS_DREAL: 'demandeInformationPourAvisDREALAFaire',
              },
            },
          },
        },
        saisineCollectivitesLocalesMachine: {
          initial: 'saisineCollectivitesLocalesAFaire',
          states: {
            saisineCollectivitesLocalesAFaire: {
              on: {
                FAIRE_SAISINE_COLLECTIVITES_LOCALES: {
                  target: 'avisDesCollectivitesARendre',
                  guard: ({ context }) => !context.saisineDesCollectivitesLocalesFaite,
                  actions: assign({
                    saisineDesCollectivitesLocalesFaite: true,
                  }),
                },
              },
            },
            avisDesCollectivitesARendre: {
              on: { RENDRE_AVIS_DES_COLLECTIVITES: 'avisDesCollectivitesRendu' },
            },
            avisDesCollectivitesRendu: { type: 'final' },
          },
        },
        avisDesServicesEtCommissionsConsultativesMachine: {
          initial: 'avisDesServicesEtCommissionsConsultativesAFaire',
          states: {
            avisDesServicesEtCommissionsConsultativesAFaire: {
              on: {
                RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES: {
                  target: 'avisDesServicesEtCommissionsConsultativesRendu',
                  guard: ({ context }) => !context.avisDesServicesEtCommissionsConsultatives.faite,
                  actions: assign({
                    avisDesServicesEtCommissionsConsultatives: ({ event }) => {
                      return {
                        faite: true,
                        date: event.date,
                      }
                    },
                  }),
                },
              },
            },
            avisDesServicesEtCommissionsConsultativesRendu: { type: 'final' },
          },
        },
      },
    },
    avisDREALARendre: {
      tags: [tags.responsable[ADMINISTRATION_IDS['DGTM - GUYANE']]],
      on: {
        RENDRE_AVIS_DREAL: {
          guard: peutRendreAvisDREAL,
          target: 'saisineOuAvisCommissionDepartementaleDesMinesARendre',
        },
      },
    },
    saisineOuAvisCommissionDepartementaleDesMinesARendre: {
      id: 'saisineOuAvisCommissionDepartementaleDesMinesARendre',
      on: {
        FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES: 'avisCommissionDepartementaleDesMinesARendre',
        RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE: 'avisDREALARendre',
        RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES: 'saisineAutoriteSignataireOuDecisionAdministrationARendre',
      },
    },
    avisCommissionDepartementaleDesMinesARendre: {
      on: {
        RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES_AJOURNE: 'avisDREALARendre',
        RENDRE_AVIS_COMMISSION_DEPARTEMENTALE_DES_MINES: 'saisineAutoriteSignataireOuDecisionAdministrationARendre',
      },
    },
    saisineAutoriteSignataireOuDecisionAdministrationARendre: {
      on: {
        FAIRE_SAISINE_AUTORITE_SIGNATAIRE: 'decisionAdministrationARendre',
        RENDRE_DECISION_ADMINISTRATION_ACCEPTE: {
          target: 'decisionAdministrationRendue',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
        RENDRE_DECISION_ADMINISTRATION_REJETE: {
          target: 'decisionAdministrationRendue',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
        },
      },
    },
    decisionAdministrationARendre: {
      on: {
        RENDRE_DECISION_ADMINISTRATION_ACCEPTE: {
          target: 'decisionAdministrationRendue',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
        RENDRE_DECISION_ADMINISTRATION_REJETE: {
          target: 'decisionAdministrationRendue',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
        },
      },
    },
    decisionAdministrationRendue: {
      on: {
        RENDRE_DECISION_ABROGATION: 'decisionAbrogationFaite',
        RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF: {
          target: 'decisionAnnulationParJugeAdministratifRendu',
        },
        NOTIFIER_DEMANDEUR: { target: 'publicationsEtNotificationsMachine', actions: assign({ notificationDuDemandeurFaite: true }) },
        PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS: { target: 'publicationsEtNotificationsMachine', actions: assign({ publicationDecisionsRecueilActesAdministratifsFaite: true }) },
        PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL: { target: 'publicationsEtNotificationsMachine', actions: assign({ publicationDansUnJournalLocalOuNationalFaite: true }) },
        NOTIFIER_COLLECTIVITES_LOCALES: { target: 'publicationsEtNotificationsMachine', actions: assign({ notificationDesCollectivitesLocalesFaite: true }) },
      },
    },
    publicationsEtNotificationsMachine: {
      type: 'parallel',
      states: {
        notificationDuDemandeurMachine: {
          initial: 'notificationDuDemandeurAFaire',
          states: {
            notificationDuDemandeurAFaire: {
              always: {
                target: 'notificationDuDemandeurFaite',
                guard: ({ context }) => {
                  return context.notificationDuDemandeurFaite
                },
              },
              on: { NOTIFIER_DEMANDEUR: { target: 'notificationDuDemandeurFaite', actions: assign({ notificationDuDemandeurFaite: true }) } },
            },
            notificationDuDemandeurFaite: { type: 'final' },
          },
        },
        publicationDecisionsRecueilActesAdministratifsMachine: {
          initial: 'publicationDecisionsRecueilActesAdministratifsAFaire',
          states: {
            publicationDecisionsRecueilActesAdministratifsAFaire: {
              always: {
                target: 'publicationDecisionsRecueilActesAdministratifsFaite',
                guard: ({ context }) => {
                  return context.publicationDecisionsRecueilActesAdministratifsFaite
                },
              },
              on: {
                PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS: {
                  target: 'publicationDecisionsRecueilActesAdministratifsFaite',
                  actions: assign({ publicationDecisionsRecueilActesAdministratifsFaite: true }),
                },
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
              always: {
                target: 'publicationDansUnJournalLocalOuNationalFaite',
                guard: ({ context }) => {
                  return context.publicationDansUnJournalLocalOuNationalFaite
                },
              },
              on: {
                PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL: { target: 'publicationDansUnJournalLocalOuNationalFaite', actions: assign({ publicationDansUnJournalLocalOuNationalFaite: true }) },
              },
            },
            publicationDansUnJournalLocalOuNationalFaite: { type: 'final' },
          },
        },
        notificationDesCollectivitesLocalesMachine: {
          initial: 'notificationDesCollectivitesLocalesAFaire',
          states: {
            notificationDesCollectivitesLocalesAFaire: {
              always: {
                target: 'notificationDesCollectivitesLocalesFaite',
                guard: ({ context }) => {
                  return context.notificationDesCollectivitesLocalesFaite
                },
              },
              on: {
                NOTIFIER_COLLECTIVITES_LOCALES: { target: 'notificationDesCollectivitesLocalesFaite', actions: assign({ notificationDesCollectivitesLocalesFaite: true }) },
              },
            },
            notificationDesCollectivitesLocalesFaite: { type: 'final' },
          },
        },
      },
    },
    decisionAnnulationParJugeAdministratifAFaire: {
      on: {
        RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF: 'decisionAnnulationParJugeAdministratifRendu',
      },
    },
    classementSansSuiteAFaire: {
      id: 'classementSansSuiteAFaire',
      tags: [tags.responsable[ADMINISTRATION_IDS['DGTM - GUYANE']]],
      on: {
        FAIRE_CLASSEMENT_SANS_SUITE: 'classementSansSuiteRendu',
      },
    },
    decisionAbrogationFaite: { type: 'final' },
    decisionAnnulationParJugeAdministratifRendu: {
      type: 'final',
      entry: assign({ demarcheStatut: DemarchesStatutsIds.Rejete }),
    },
    desistementDuDemandeurRendu: {
      type: 'final',
      entry: assign({
        demarcheStatut: DemarchesStatutsIds.Desiste,
        visibilite: 'publique',
      }),
    },
    classementSansSuiteRendu: {
      type: 'final',
      entry: assign({
        demarcheStatut: DemarchesStatutsIds.ClasseSansSuite,
        visibilite: 'publique',
      }),
    },
  },
})
