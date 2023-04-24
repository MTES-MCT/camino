import { assign, createMachine } from 'xstate'
import { CaminoMachine } from '../machine-helper.js'
import { CaminoCommonContext, DBEtat, Etape, tags } from '../machine-common.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { CaminoDate, dateAddMonths, daysBetween } from 'camino-common/src/date.js'

type FaireSaisineDesServices = {
  date: CaminoDate
  type: 'FAIRE_SAISINE_DES_SERVICES'
}

type RendreAvisDreal = {
  date: CaminoDate
  type: 'RENDRE_AVIS_DREAL'
}

export type AXMProXStateEvent =
  | { type: 'FAIRE_DEMANDE' }
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE' }
  | { type: 'MODIFIER_LA_DEMANDE' }
  | { type: 'FAIRE_SAISINE_COLLECTIVITES_LOCALES' }
  | { type: 'RENDRE_AVIS_DUN_MAIRE' }
  | RendreAvisDreal
  | FaireSaisineDesServices
  | { type: 'RENDRE_AVIS_DGTM_MNBST' }
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
  | { type: 'RENDRE_DECISION_RETRAIT' }
  | { type: 'RENDRE_AVIS_DGTMAUCL' }
  | {
      type: 'RENDRE_AVIS_DIRECTION_ENTREPRISE_CONCURRENCE_CONSOMMATION_TRAVAIL_EMPLOI'
    }
  | { type: 'RENDRE_AVIS_DIRECTION_ALIMENTATION_AGRICULTURE_FORET' }
  | { type: 'RENDRE_AVIS_DIRECTION_REGIONALE_AFFAIRES_CULTURELLES' }
  | { type: 'RENDRE_AVIS_AGENCE_REGIONALE_SANTE' }
  | { type: 'RENDRE_AVIS_DIRECTION_REGIONALE_FINANCES_PUBLIQUES' }
  | { type: 'RENDRE_AVIS_CAISSE_GENERALE_DE_SECURITE_SOCIALE' }
  | { type: 'RENDRE_AVIS_OFFICE_NATIONAL_DES_FORETS' }
  | { type: 'RENDRE_AVIS_ETAT_MAJOR_ORPAILLAGE_ET_PECHE_ILLICITE' }
  | { type: 'RENDRE_AVIS_GENDARMERIE_NATIONALE' }
  | { type: 'DEMANDER_INFORMATION_POUR_AVIS_DREAL' }
  | { type: 'RECEVOIR_INFORMATION_POUR_AVIS_DREAL' }
  | { type: 'RENDRE_DECISION_IMPLICITE_REJET' }
  | { type: 'RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF' }
  | { type: 'FAIRE_DESISTEMENT_DEMANDEUR' }
  | { type: 'FAIRE_CLASSEMENT_SANS_SUITE' }

type Event = AXMProXStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: ETES.demande, mainStep: true },
  DEPOSER_DEMANDE: { db: ETES.depotDeLaDemande, mainStep: true },
  DEMANDER_COMPLEMENTS_POUR_RECEVABILITE: { db: ETES.demandeDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE: { db: ETES.receptionDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  MODIFIER_LA_DEMANDE: { db: ETES.modificationDeLaDemande, mainStep: true },
  FAIRE_SAISINE_COLLECTIVITES_LOCALES: { db: ETES.saisineDesCollectivitesLocales, mainStep: true },
  RENDRE_AVIS_DUN_MAIRE: { db: ETES.avisDunMaire, mainStep: false },
  RENDRE_AVIS_DREAL: { db: ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement, mainStep: true },
  FAIRE_SAISINE_DES_SERVICES: { db: ETES.saisineDesServices, mainStep: true },
  RENDRE_AVIS_DGTM_MNBST: { db: ETES.avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_, mainStep: false },
  FAIRE_SAISINE_COMMISSION_DEPARTEMENTALE_DES_MINES: { db: ETES.saisineDeLaCommissionDepartementaleDesMines_CDM_, mainStep: false },
  NOTIFIER_DEMANDEUR: { db: ETES.notificationAuDemandeur, mainStep: true },
  PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS: { db: ETES.publicationDeDecisionAuRecueilDesActesAdministratifs, mainStep: true },
  PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL: { db: ETES.publicationDansUnJournalLocalOuNational, mainStep: true },
  NOTIFIER_COLLECTIVITES_LOCALES: { db: ETES.notificationDesCollectivitesLocales, mainStep: true },
  RENDRE_DECISION_ABROGATION: { db: ETES.abrogationDeLaDecision, mainStep: false },
  RENDRE_DECISION_RETRAIT: { db: ETES.retraitDeLaDecision, mainStep: false },
  RENDRE_AVIS_DGTMAUCL: { db: ETES.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_, mainStep: false },
  RENDRE_AVIS_DIRECTION_ENTREPRISE_CONCURRENCE_CONSOMMATION_TRAVAIL_EMPLOI: { db: ETES.avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi, mainStep: false },
  RENDRE_AVIS_DIRECTION_ALIMENTATION_AGRICULTURE_FORET: { db: ETES.avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet, mainStep: false },
  RENDRE_AVIS_DIRECTION_REGIONALE_AFFAIRES_CULTURELLES: { db: ETES.avisDeDirectionRegionaleDesAffairesCulturelles, mainStep: false },
  RENDRE_AVIS_AGENCE_REGIONALE_SANTE: { db: ETES.avisDeLagenceRegionaleDeSante, mainStep: false },
  RENDRE_AVIS_DIRECTION_REGIONALE_FINANCES_PUBLIQUES: { db: ETES.avisDeLaDirectionRegionaleDesFinancesPubliques, mainStep: false },
  RENDRE_AVIS_CAISSE_GENERALE_DE_SECURITE_SOCIALE: { db: ETES.avisDeLaCaisseGeneraleDeSecuriteSociale, mainStep: false },
  RENDRE_AVIS_OFFICE_NATIONAL_DES_FORETS: { db: ETES.avisDeLOfficeNationalDesForets, mainStep: false },
  RENDRE_AVIS_ETAT_MAJOR_ORPAILLAGE_ET_PECHE_ILLICITE: { db: ETES.avisDeLetatMajorOrpaillageEtPecheIllicite_EMOPI_, mainStep: false },
  RENDRE_AVIS_GENDARMERIE_NATIONALE: { db: ETES.avisDeLaGendarmerieNationale, mainStep: false },
  DEMANDER_INFORMATION_POUR_AVIS_DREAL: { db: ETES.demandeDinformations_AvisDuDREALDEALOuDGTM_, mainStep: false },
  RECEVOIR_INFORMATION_POUR_AVIS_DREAL: { db: ETES.receptionDinformation_AvisDuDREALDEALOuDGTM_, mainStep: false },
  RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF: { db: ETES.decisionDuJugeAdministratif, mainStep: false },
  FAIRE_DESISTEMENT_DEMANDEUR: { db: ETES.desistementDuDemandeur, mainStep: false },
  FAIRE_CLASSEMENT_SANS_SUITE: { db: ETES.classementSansSuite, mainStep: false },
  FAIRE_SAISINE_AUTORITE_SIGNATAIRE: { db: ETES.saisineDeLautoriteSignataire, mainStep: false },
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
  // TODO 2023-04-19 RENDRE_DECISION_IMPLICITE_REJET est une étape principale le jour où on gère le délai entre la mdp et le rejet implicite
  RENDRE_DECISION_IMPLICITE_REJET: {
    db: {
      REJETE: ETES.decisionImplicite.REJETE,
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
}

// Related to https://github.com/Microsoft/TypeScript/issues/12870
export const EVENTS = Object.keys(trad) as Array<Extract<keyof typeof trad, string>>

// basé sur TODO 2023-04-17 mettre le lien vers le bon cacoo
// TODO 2023-04-17 mettre à jour le cacoo quand on a de nouveau accès avec :
// - modification de la demande comme pour l'octroi d'AXM
export class AxmProMachine extends CaminoMachine<AxmProContext, AXMProXStateEvent> {
  constructor() {
    super(axmProMachine, trad)
  }

  toPotentialCaminoXStateEvent(event: AXMProXStateEvent['type'], date: CaminoDate): AXMProXStateEvent[] {
    switch (event) {
      case 'FAIRE_SAISINE_DES_SERVICES':
      case 'RENDRE_AVIS_DREAL':
        return [{ type: event, date }]
      default:
        // related to https://github.com/microsoft/TypeScript/issues/46497  https://github.com/microsoft/TypeScript/issues/40803 :(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return [{ type: event }]
    }
  }

  eventFrom(etape: Etape): AXMProXStateEvent {
    const entries = Object.entries(trad).filter((entry): entry is [Event, { db: DBEtat; mainStep: boolean }] => EVENTS.includes(entry[0]))

    const entry = entries.find(([_key, { db: dbEtat }]) => {
      return Object.values(dbEtat).some(dbEtatSingle => dbEtatSingle.etapeTypeId === etape.etapeTypeId && dbEtatSingle.etapeStatutId === etape.etapeStatutId)
    })

    if (entry) {
      const eventFromEntry = entry[0]
      switch (eventFromEntry) {
        case 'FAIRE_SAISINE_DES_SERVICES':
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

type SaisineDesServices = { faite: false } | { faite: true; date: CaminoDate }
interface AxmProContext extends CaminoCommonContext {
  saisineDesCollectivitesLocalesFaite: boolean
  saisineDesServices: SaisineDesServices
}

const peutRendreAvisDREAL = (context: AxmProContext, event: RendreAvisDreal): boolean => {
  return context.saisineDesServices.faite && daysBetween(dateAddMonths(context.saisineDesServices.date, 1), event.date) >= 0
}

const axmProMachine = createMachine<AxmProContext, AXMProXStateEvent>({
  predictableActionArguments: true,
  id: 'AXMPro',
  initial: 'demandeAFaire',
  context: {
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
    saisineDesCollectivitesLocalesFaite: false,
    saisineDesServices: { faite: false },
    visibilite: 'confidentielle',
  },
  on: {
    FAIRE_DESISTEMENT_DEMANDEUR: {
      cond: context => [DemarchesStatutsIds.Depose, DemarchesStatutsIds.EnInstruction].includes(context.demarcheStatut),
      target: 'desistementDuDemandeurRendu',
    },
    FAIRE_CLASSEMENT_SANS_SUITE: {
      cond: context => [DemarchesStatutsIds.Depose, DemarchesStatutsIds.EnInstruction].includes(context.demarcheStatut),
      target: 'classementSansSuiteRendu',
    },
    RENDRE_DECISION_IMPLICITE_REJET: {
      cond: context => [DemarchesStatutsIds.Depose, DemarchesStatutsIds.EnInstruction].includes(context.demarcheStatut),
      target: 'decisionAnnulationParJugeAdministratifAFaire',
      actions: assign<AxmProContext, { type: 'RENDRE_DECISION_IMPLICITE_REJET' }>({
        demarcheStatut: DemarchesStatutsIds.Rejete,
        visibilite: 'publique',
      }),
    },
  },
  states: {
    demandeAFaire: {
      on: {
        FAIRE_DEMANDE: 'depotDeLaDemandeAFaire',
      },
    },
    depotDeLaDemandeAFaire: {
      tags: [tags.responsable[ADMINISTRATION_IDS['DGTM - GUYANE']]],
      on: {
        DEPOSER_DEMANDE: {
          target: 'recevabiliteDeLaDemandeAFaire',
          actions: assign<AxmProContext, { type: 'DEPOSER_DEMANDE' }>({
            demarcheStatut: DemarchesStatutsIds.Depose,
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
          actions: assign<AxmProContext, { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }>({
            demarcheStatut: DemarchesStatutsIds.EnInstruction,
            visibilite: 'publique',
          }),
        },
        FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE: 'modificationDeLaDemandeAFaire',
      },
    },
    complementsPourRecevabiliteAFaire: {
      on: {
        RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE: 'recevabiliteDeLaDemandeAFaire',
        FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
          target: 'saisinesAFairePuisRendreAvisDREAL',
          actions: assign<AxmProContext, { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }>({
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
                cond: (context: AxmProContext) => context.saisineDesServices.faite && context.saisineDesCollectivitesLocalesFaite,
              },
            },
            rendreAvisDrealAFaire: {
              tags: [tags.responsable[ADMINISTRATION_IDS['DGTM - GUYANE']]],
              on: {
                RENDRE_AVIS_DREAL: {
                  cond: peutRendreAvisDREAL,
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
                  target: 'avisDunMaireARendre',
                  cond: context => !context.saisineDesCollectivitesLocalesFaite,
                  actions: assign<AxmProContext, { type: 'FAIRE_SAISINE_COLLECTIVITES_LOCALES' }>({
                    saisineDesCollectivitesLocalesFaite: true,
                  }),
                },
              },
            },
            avisDunMaireARendre: {
              on: { RENDRE_AVIS_DUN_MAIRE: 'avisDunMaireRendu' },
            },
            avisDunMaireRendu: { type: 'final' },
          },
        },
        saisineDesServicesMachine: {
          initial: 'saisineDesServicesAFaire',
          states: {
            saisineDesServicesAFaire: {
              on: {
                FAIRE_SAISINE_DES_SERVICES: {
                  target: 'avisDesServicesARendre',
                  cond: context => !context.saisineDesServices.faite,
                  actions: assign<AxmProContext, FaireSaisineDesServices>({
                    saisineDesServices: (context, event) => {
                      return {
                        faite: true,
                        date: event.date,
                      }
                    },
                  }),
                },
              },
            },
            avisDesServicesARendre: {
              type: 'parallel',

              states: {
                avisDgtmMNBSTMachine: {
                  initial: 'avisDgtmMNBSTARendre',
                  states: {
                    avisDgtmMNBSTARendre: {
                      on: { RENDRE_AVIS_DGTM_MNBST: 'avisDgtmMNBSTRendu' },
                    },
                    avisDgtmMNBSTRendu: { type: 'final' },
                  },
                },
                avisDGTMAUCLMachine: {
                  initial: 'avisDGTMAUCLARendre',
                  states: {
                    avisDGTMAUCLARendre: {
                      on: { RENDRE_AVIS_DGTMAUCL: 'avisDGTMAUCLRendu' },
                    },
                    avisDGTMAUCLRendu: { type: 'final' },
                  },
                },
                avisDirectionEntrepriseConcurrenceConsommationTravailEmploiMachine: {
                  initial: 'avisDirectionEntrepriseConcurrenceConsommationTravailEmploiARendre',
                  states: {
                    avisDirectionEntrepriseConcurrenceConsommationTravailEmploiARendre: {
                      on: {
                        RENDRE_AVIS_DIRECTION_ENTREPRISE_CONCURRENCE_CONSOMMATION_TRAVAIL_EMPLOI: 'avisDirectionEntrepriseConcurrenceConsommationTravailEmploiRendu',
                      },
                    },
                    avisDirectionEntrepriseConcurrenceConsommationTravailEmploiRendu: { type: 'final' },
                  },
                },
                avisDirectionAlimentationAgricultureForetMachine: {
                  initial: 'avisDirectionAlimentationAgricultureForetARendre',
                  states: {
                    avisDirectionAlimentationAgricultureForetARendre: {
                      on: {
                        RENDRE_AVIS_DIRECTION_ALIMENTATION_AGRICULTURE_FORET: 'avisDirectionAlimentationAgricultureForetRendu',
                      },
                    },
                    avisDirectionAlimentationAgricultureForetRendu: {
                      type: 'final',
                    },
                  },
                },
                avisDirectionRegionaleAffairesCulturellesMachine: {
                  initial: 'avisDirectionRegionaleAffairesCulturellesARendre',
                  states: {
                    avisDirectionRegionaleAffairesCulturellesARendre: {
                      on: {
                        RENDRE_AVIS_DIRECTION_REGIONALE_AFFAIRES_CULTURELLES: 'avisDirectionRegionaleAffairesCulturellesRendu',
                      },
                    },
                    avisDirectionRegionaleAffairesCulturellesRendu: {
                      type: 'final',
                    },
                  },
                },
                avisAgenceRegionaleSanteMachine: {
                  initial: 'avisAgenceRegionaleSanteARendre',
                  states: {
                    avisAgenceRegionaleSanteARendre: {
                      on: {
                        RENDRE_AVIS_AGENCE_REGIONALE_SANTE: 'avisAgenceRegionaleSanteRendu',
                      },
                    },
                    avisAgenceRegionaleSanteRendu: { type: 'final' },
                  },
                },
                avisDirectionRegionaleFinancesPubliquesMachine: {
                  initial: 'avisDirectionRegionaleFinancesPubliquesARendre',
                  states: {
                    avisDirectionRegionaleFinancesPubliquesARendre: {
                      on: {
                        RENDRE_AVIS_DIRECTION_REGIONALE_FINANCES_PUBLIQUES: 'avisDirectionRegionaleFinancesPubliquesRendu',
                      },
                    },
                    avisDirectionRegionaleFinancesPubliquesRendu: {
                      type: 'final',
                    },
                  },
                },
                avisCaisseGeneraleDeSecuriteSocialeMachine: {
                  initial: 'avisCaisseGeneraleDeSecuriteSocialeARendre',
                  states: {
                    avisCaisseGeneraleDeSecuriteSocialeARendre: {
                      on: {
                        RENDRE_AVIS_CAISSE_GENERALE_DE_SECURITE_SOCIALE: 'avisCaisseGeneraleDeSecuriteSocialeRendu',
                      },
                    },
                    avisCaisseGeneraleDeSecuriteSocialeRendu: { type: 'final' },
                  },
                },
                avisOfficeNationalDesForetsMachine: {
                  initial: 'avisOfficeNationalDesForetsARendre',
                  states: {
                    avisOfficeNationalDesForetsARendre: {
                      on: {
                        RENDRE_AVIS_OFFICE_NATIONAL_DES_FORETS: 'avisOfficeNationalDesForetsRendu',
                      },
                    },
                    avisOfficeNationalDesForetsRendu: { type: 'final' },
                  },
                },
                avisGendarmerieNationaleMachine: {
                  initial: 'avisGendarmerieNationaleARendre',
                  states: {
                    avisGendarmerieNationaleARendre: {
                      on: {
                        RENDRE_AVIS_GENDARMERIE_NATIONALE: 'avisGendarmerieNationaleRendu',
                      },
                    },
                    avisGendarmerieNationaleRendu: { type: 'final' },
                  },
                },
                avisEtatMajorOrpaillageEtPecheIlliciteMachine: {
                  initial: 'avisEtatMajorOrpaillageEtPecheIlliciteARendre',
                  states: {
                    avisEtatMajorOrpaillageEtPecheIlliciteARendre: {
                      on: {
                        RENDRE_AVIS_ETAT_MAJOR_ORPAILLAGE_ET_PECHE_ILLICITE: 'avisEtatMajorOrpaillageEtPecheIlliciteRendu',
                      },
                    },
                    avisEtatMajorOrpaillageEtPecheIlliciteRendu: {
                      type: 'final',
                    },
                  },
                },
              },
              onDone: 'avisDesServicesRendus',
            },
            avisDesServicesRendus: { type: 'final' },
          },
        },
      },
    },
    avisDREALARendre: {
      tags: [tags.responsable[ADMINISTRATION_IDS['DGTM - GUYANE']]],
      on: {
        RENDRE_AVIS_DREAL: {
          cond: peutRendreAvisDREAL,
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
          actions: assign<AxmProContext, { type: 'RENDRE_DECISION_ADMINISTRATION_ACCEPTE' }>({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
        RENDRE_DECISION_ADMINISTRATION_REJETE: {
          target: 'decisionAdministrationRendue',
          actions: assign<AxmProContext, { type: 'RENDRE_DECISION_ADMINISTRATION_REJETE' }>({
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
        },
      },
    },
    decisionAdministrationARendre: {
      on: {
        RENDRE_DECISION_ADMINISTRATION_ACCEPTE: {
          target: 'decisionAdministrationRendue',
          actions: assign<AxmProContext, { type: 'RENDRE_DECISION_ADMINISTRATION_ACCEPTE' }>({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
        RENDRE_DECISION_ADMINISTRATION_REJETE: {
          target: 'decisionAdministrationRendue',
          actions: assign<AxmProContext, { type: 'RENDRE_DECISION_ADMINISTRATION_REJETE' }>({
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
        },
      },
    },
    decisionAdministrationRendue: {
      on: {
        RENDRE_DECISION_ABROGATION: 'decisionAbrogationFaite',
        RENDRE_DECISION_RETRAIT: 'decisionRetraitFaite',
        RENDRE_DECISION_ANNULATION_PAR_JUGE_ADMINISTRATIF: {
          target: 'decisionAnnulationParJugeAdministratifRendu',
        },
        NOTIFIER_DEMANDEUR: { target: 'publicationsEtNotificationsMachine' },
        PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS: 'publicationsEtNotificationsMachine',
        PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL: 'publicationsEtNotificationsMachine',
        NOTIFIER_COLLECTIVITES_LOCALES: 'publicationsEtNotificationsMachine',
      },
    },
    publicationsEtNotificationsMachine: {
      type: 'parallel',
      states: {
        notificationDuDemadeurMachine: {
          initial: 'notificationDuDemandeurAFaire',
          states: {
            notificationDuDemandeurAFaire: {
              always: {
                target: 'notificationDuDemandeurFaite',
                cond: (_context, _event, meta) => {
                  return meta.state.history?.event.type === 'NOTIFIER_DEMANDEUR'
                },
              },
              on: { NOTIFIER_DEMANDEUR: 'notificationDuDemandeurFaite' },
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
                cond: (_context, _event, meta) => {
                  return meta.state.history?.event.type === 'PUBLIER_DECISIONS_RECUEIL_ACTES_ADMINISTRATIFS'
                },
              },
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
              always: {
                target: 'publicationDansUnJournalLocalOuNationalFaite',
                cond: (_context, _event, meta) => {
                  return meta.state.history?.event.type === 'PUBLIER_DANS_UN_JOURNAL_LOCAL_OU_NATIONAL'
                },
              },
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
              always: {
                target: 'notificationDesCollectivitesLocalesFaite',
                cond: (_context, _event, meta) => {
                  return meta.state.history?.event.type === 'NOTIFIER_COLLECTIVITES_LOCALES'
                },
              },
              on: {
                NOTIFIER_COLLECTIVITES_LOCALES: 'notificationDesCollectivitesLocalesFaite',
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
    decisionRetraitFaite: { type: 'final' },
    decisionAnnulationParJugeAdministratifRendu: {
      type: 'final',
      entry: assign<AxmProContext>({ demarcheStatut: DemarchesStatutsIds.Rejete }),
    },
    desistementDuDemandeurRendu: {
      type: 'final',
      entry: assign<AxmProContext>({
        demarcheStatut: DemarchesStatutsIds.Desiste,
        visibilite: 'publique',
      }),
    },
    classementSansSuiteRendu: {
      type: 'final',
      entry: assign<AxmProContext>({
        demarcheStatut: DemarchesStatutsIds.ClasseSansSuite,
        visibilite: 'publique',
      }),
    },
  },
})
