import { assign, createMachine } from 'xstate'
import { CaminoMachine } from '../machine-helper.js'
import { CaminoCommonContext, DBEtat, Etape } from '../machine-common.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'

type PXGOctXStateEvent =
  | { type: 'FAIRE_DEMANDE' }
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE' }
  | { type: 'RECEVOIR_MODIFICATION_DE_LA_DEMANDE' }
  | { type: 'RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'FAIRE_SAISINES_DES_SERVICES' }
  | { type: 'RENDRE_AVIS_DGTM_MNBST' }
  | { type: 'RENDRE_AVIS_DGTMAUCL' }
  | {
      type: 'RENDRE_AVIS_DIRECTION_ENTREPRISE_CONCURRENCE_CONSOMMATION_TRAVAIL_EMPLOI'
    }
  | { type: 'RENDRE_AVIS_DIRECTION_ALIMENTATION_AGRICULTURE_FORET' }
  | { type: 'RENDRE_AVIS_DIRECTION_REGIONALE_AFFAIRES_CULTURELLES' }
  | { type: 'RENDRE_AVIS_DIRECTION_REGIONALE_FINANCES_PUBLIQUES' }
  | { type: 'RENDRE_AVIS_CAISSE_GENERALE_DE_SECURITE_SOCIALE' }
  | { type: 'RENDRE_AVIS_AGENCE_REGIONALE_SANTE' }
  | { type: 'RENDRE_AVIS_DREAL' }
  | { type: 'FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES' }
  | { type: 'RENDRE_CONSULTATION_DES_CONSEILS_MUNICIPAUX' }
  | { type: 'FAIRE_CONSULTATION_CLE_DU_SAGE' }
  | { type: 'FAIRE_SAISINE_AUTORITE_ENVIRONNEMENTALE' }
  | { type: 'RENDRE_AVIS_AUTORITE_ENVIRONNEMENTALE' }
  | { type: 'OUVRIR_ENQUETE_PUBLIQUE' }
  | { type: 'CLOTURER_ENQUETE_PUBLIQUE' }
  | { type: 'TRANSMETTRE_PROJET_DE_PRESCRIPTIONS_AU_DEMANDEUR' }
  | { type: 'RENDRE_AVIS_DU_DEMANDEUR_SUR_LES_PRESCRIPTIONS_PROPOSEES' }
  | { type: 'RENDRE_PASSAGE_CODERST' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_FAVORABLE' }
  | { type: 'RENDRE_DECISION_ADMINISTRATION_DEFAVORABLE' }
  | { type: 'NOTIFICATION_DU_DEMANDEUR' }
  | { type: 'PUBLIER_DECISION_RECUEIL_DES_ACTES_ADMINISTRATIFS' }
  | { type: 'FAIRE_DESISTEMENT_DEMANDEUR' }
  | { type: 'FAIRE_CLASSEMENT_SANS_SUITE' }

type Event = PXGOctXStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
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
  RENDRE_DECISION_ADMINISTRATION_FAVORABLE: {
    db: {
      ACCEPTE: ETES.decisionDeLadministration.ACCEPTE,
    },
    mainStep: true,
  },
  RENDRE_DECISION_ADMINISTRATION_DEFAVORABLE: {
    db: {
      REJETE: ETES.decisionDeLadministration.REJETE,
    },
    mainStep: false,
  },
  FAIRE_DEMANDE: { db: ETES.demande, mainStep: true },
  DEPOSER_DEMANDE: { db: ETES.depotDeLaDemande, mainStep: true },
  DEMANDER_COMPLEMENTS_POUR_RECEVABILITE: { db: ETES.demandeDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  RECEVOIR_MODIFICATION_DE_LA_DEMANDE: { db: ETES.modificationDeLaDemande, mainStep: true },
  RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE: { db: ETES.receptionDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  FAIRE_SAISINES_DES_SERVICES: { db: ETES.saisineDesServices, mainStep: true },
  RENDRE_AVIS_DGTM_MNBST: { db: ETES.avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_, mainStep: false },
  RENDRE_AVIS_DGTMAUCL: { db: ETES.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_, mainStep: false },
  RENDRE_AVIS_DIRECTION_ENTREPRISE_CONCURRENCE_CONSOMMATION_TRAVAIL_EMPLOI: { db: ETES.avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi, mainStep: false },
  RENDRE_AVIS_DIRECTION_ALIMENTATION_AGRICULTURE_FORET: { db: ETES.avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet, mainStep: false },
  RENDRE_AVIS_DIRECTION_REGIONALE_AFFAIRES_CULTURELLES: { db: ETES.avisDeDirectionRegionaleDesAffairesCulturelles, mainStep: false },
  RENDRE_AVIS_AGENCE_REGIONALE_SANTE: { db: ETES.avisDeLagenceRegionaleDeSante, mainStep: false },
  RENDRE_AVIS_DIRECTION_REGIONALE_FINANCES_PUBLIQUES: { db: ETES.avisDeLaDirectionRegionaleDesFinancesPubliques, mainStep: false },
  RENDRE_AVIS_CAISSE_GENERALE_DE_SECURITE_SOCIALE: { db: ETES.avisDeLaCaisseGeneraleDeSecuriteSociale, mainStep: false },
  RENDRE_AVIS_DREAL: { db: ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement, mainStep: true },
  FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES: { db: ETES.saisineDesCollectivitesLocales, mainStep: true },
  RENDRE_CONSULTATION_DES_CONSEILS_MUNICIPAUX: { db: ETES.avisDunMaire, mainStep: false },
  FAIRE_CONSULTATION_CLE_DU_SAGE: { db: ETES.consultationCLEDuSAGE, mainStep: false },
  FAIRE_SAISINE_AUTORITE_ENVIRONNEMENTALE: { db: ETES.saisineDeLautoriteEnvironnementale, mainStep: true },
  RENDRE_AVIS_AUTORITE_ENVIRONNEMENTALE: { db: ETES.avisDeLautoriteEnvironnementale, mainStep: true },
  OUVRIR_ENQUETE_PUBLIQUE: { db: ETES.ouvertureDeLenquetePublique, mainStep: false },
  CLOTURER_ENQUETE_PUBLIQUE: { db: ETES.clotureDeLenquetePublique, mainStep: false },
  TRANSMETTRE_PROJET_DE_PRESCRIPTIONS_AU_DEMANDEUR: { db: ETES.transmissionDuProjetDePrescriptionsAuDemandeur, mainStep: true },
  RENDRE_AVIS_DU_DEMANDEUR_SUR_LES_PRESCRIPTIONS_PROPOSEES: { db: ETES.avisDuDemandeurSurLesPrescriptionsProposees, mainStep: true },
  RENDRE_PASSAGE_CODERST: { db: ETES.avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst_, mainStep: false },
  NOTIFICATION_DU_DEMANDEUR: { db: ETES.notificationAuDemandeur, mainStep: true },
  PUBLIER_DECISION_RECUEIL_DES_ACTES_ADMINISTRATIFS: { db: ETES.publicationDeDecisionAuRecueilDesActesAdministratifs, mainStep: true },
  FAIRE_DESISTEMENT_DEMANDEUR: { db: ETES.desistementDuDemandeur, mainStep: false },
  FAIRE_CLASSEMENT_SANS_SUITE: { db: ETES.classementSansSuite, mainStep: false },
}

// Related to https://github.com/Microsoft/TypeScript/issues/12870
const EVENTS = Object.keys(trad) as Array<Extract<keyof typeof trad, string>>

// basé sur https://cacoo.com/diagrams/QDCLi7jxd3EUOOba/249D0
export class PxgOctMachine extends CaminoMachine<PxgContext, PXGOctXStateEvent> {
  constructor() {
    super(pxgOctMachine, trad)
  }

  eventFrom(etape: Etape): PXGOctXStateEvent {
    const entries = Object.entries(trad).filter((entry): entry is [Event, { db: DBEtat; mainStep: boolean }] => EVENTS.includes(entry[0]))

    const entry = entries.find(([_key, { db: dbEtat }]) => {
      return Object.values(dbEtat).some(dbEtatSingle => dbEtatSingle.etapeTypeId === etape.etapeTypeId && dbEtatSingle.etapeStatutId === etape.etapeStatutId)
    })

    if (entry) {
      const eventFromEntry = entry[0]
      switch (eventFromEntry) {
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

interface PxgContext extends CaminoCommonContext {
  saisineDesServicesFaite: boolean
  saisineDesCollectivitesLocalesFaites: boolean
  saisineAutoriteEnvironnementaleFaite: boolean
  avisAutoriteEnvironnementaleFaite: boolean
  depotFait: boolean
  enquetePubliqueOuvertePourLaDemarcheSimplifiee: boolean
}

const peutRendreAvisDREAL = ({ context }: { context: PxgContext }): boolean => {
  return context.saisineDesServicesFaite && context.saisineDesCollectivitesLocalesFaites && context.avisAutoriteEnvironnementaleFaite
}

const pxgOctMachine = createMachine({
  types: {} as { context: PxgContext; events: PXGOctXStateEvent },
  id: 'PXGOct',
  initial: 'demandeAFaire',
  context: {
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
    visibilite: 'confidentielle',
    saisineDesServicesFaite: false,
    saisineDesCollectivitesLocalesFaites: false,
    saisineAutoriteEnvironnementaleFaite: false,
    avisAutoriteEnvironnementaleFaite: false,
    depotFait: false,
    enquetePubliqueOuvertePourLaDemarcheSimplifiee: false,
  },
  on: {
    FAIRE_DESISTEMENT_DEMANDEUR: {
      guard: ({ context, event: _event }) => [DemarchesStatutsIds.Depose, DemarchesStatutsIds.EnInstruction].includes(context.demarcheStatut),
      target: '.desistementDuDemandeurRendu',
    },
    FAIRE_CLASSEMENT_SANS_SUITE: {
      guard: ({ context, event: _event }) => [DemarchesStatutsIds.Depose, DemarchesStatutsIds.EnInstruction].includes(context.demarcheStatut),
      target: '.classementSansSuiteRendu',
    },
    RENDRE_DECISION_ADMINISTRATION_FAVORABLE: {
      target: '.publicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
      guard: ({ context, event: _event }) => !context.depotFait && context.demarcheStatut === DemarchesStatutsIds.EnConstruction,
      actions: assign({
        demarcheStatut: DemarchesStatutsIds.Accepte,
      }),
    },
    OUVRIR_ENQUETE_PUBLIQUE: {
      target: '.clotureEnquetePubliqueAFaire',
      guard: ({ context, event: _event }) => !context.depotFait && !context.enquetePubliqueOuvertePourLaDemarcheSimplifiee,
      actions: assign({
        enquetePubliqueOuvertePourLaDemarcheSimplifiee: true,
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
      on: {
        DEPOSER_DEMANDE: {
          target: 'recevabiliteDeLaDemandeAFaire',
          actions: assign({
            depotFait: true,
          }),
        },
      },
    },
    clotureEnquetePubliqueAFaire: {
      on: { CLOTURER_ENQUETE_PUBLIQUE: 'clotureEnquetePubliqueFaite' },
    },
    clotureEnquetePubliqueFaite: {
      on: {
        RENDRE_DECISION_ADMINISTRATION_FAVORABLE: {
          target: 'publicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
      },
    },
    recevabiliteDeLaDemandeAFaire: {
      on: {
        DEMANDER_COMPLEMENTS_POUR_RECEVABILITE: 'complementsPourRecevabiliteAFaire',
        FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
          target: 'saisinesAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Depose,
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
          target: 'saisinesAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Depose,
            visibilite: 'publique',
          }),
        },
        FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE: 'modificationDeLaDemandeAFaire',
      },
    },
    modificationDeLaDemandeAFaire: {
      on: {
        RECEVOIR_MODIFICATION_DE_LA_DEMANDE: 'recevabiliteDeLaDemandeAFaire',
      },
    },
    saisinesAFaire: {
      type: 'parallel',
      states: {
        rendreAvisDrealMachine: {
          initial: 'rendreAvisDrealPasEncorePossible',
          states: {
            rendreAvisDrealPasEncorePossible: {
              always: {
                target: 'rendreAvisDrealAFaire',
                guard: peutRendreAvisDREAL,
              },
            },
            rendreAvisDrealAFaire: {
              on: {
                RENDRE_AVIS_DREAL: {
                  guard: peutRendreAvisDREAL,
                  target: '#transmissionDuProjetDePrescriptionsAuDemandeurAFaire',
                },
              },
            },
          },
        },
        saisineDesServicesMachine: {
          initial: 'saisineDesServicesAFaire',
          states: {
            saisineDesServicesAFaire: {
              on: {
                FAIRE_SAISINES_DES_SERVICES: {
                  target: 'avisDesServicesARendre',
                  actions: assign({
                    saisineDesServicesFaite: true,
                    demarcheStatut: ({ context }) => {
                      return context.saisineDesCollectivitesLocalesFaites && context.saisineAutoriteEnvironnementaleFaite ? DemarchesStatutsIds.EnInstruction : context.demarcheStatut
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
              },
            },
          },
        },
        saisineDesCollectivitesLocalesMachine: {
          initial: 'saisineDesCollectivitesLocalesAFaire',
          states: {
            saisineDesCollectivitesLocalesAFaire: {
              on: {
                FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES: {
                  target: 'consultationCLEEtConseilsMunicipauxAFaire',
                  actions: assign({
                    saisineDesCollectivitesLocalesFaites: true,
                    demarcheStatut: ({ context }) => {
                      return context.saisineAutoriteEnvironnementaleFaite && context.saisineDesServicesFaite ? DemarchesStatutsIds.EnInstruction : context.demarcheStatut
                    },
                  }),
                },
              },
            },
            consultationCLEEtConseilsMunicipauxAFaire: {
              type: 'parallel',
              states: {
                consultationDesConseilsMunicipauxMachine: {
                  initial: 'consultationDesConseilsMunicipauxARendre',
                  states: {
                    consultationDesConseilsMunicipauxARendre: {
                      on: {
                        RENDRE_CONSULTATION_DES_CONSEILS_MUNICIPAUX: 'consultationDesConseilsMunicipauxRendu',
                      },
                    },
                    consultationDesConseilsMunicipauxRendu: { type: 'final' },
                  },
                },
                consultationCLEDuSAGEMachine: {
                  initial: 'consultationCLEDuSAGEAFaire',
                  states: {
                    consultationCLEDuSAGEAFaire: {
                      on: {
                        FAIRE_CONSULTATION_CLE_DU_SAGE: {
                          guard: ({ context, event: _event }) => context.saisineDesCollectivitesLocalesFaites && context.avisAutoriteEnvironnementaleFaite,
                          target: 'consultationCLEDuSAGEAFait',
                        },
                      },
                    },
                    consultationCLEDuSAGEAFait: { type: 'final' },
                  },
                },
              },
            },
          },
        },
        saisineAutoriteEnvironnementaleMachine: {
          initial: 'saisineAutoriteEnvironnementaleAFaire',
          states: {
            saisineAutoriteEnvironnementaleAFaire: {
              on: {
                FAIRE_SAISINE_AUTORITE_ENVIRONNEMENTALE: {
                  target: 'avisAutoriteEnvironnementaleAFaire',
                  actions: assign({
                    saisineAutoriteEnvironnementaleFaite: true,
                    demarcheStatut: ({ context, event: _event }) => {
                      return context.saisineDesCollectivitesLocalesFaites && context.saisineDesServicesFaite ? DemarchesStatutsIds.EnInstruction : context.demarcheStatut
                    },
                  }),
                },
              },
            },
            avisAutoriteEnvironnementaleAFaire: {
              on: {
                RENDRE_AVIS_AUTORITE_ENVIRONNEMENTALE: {
                  target: 'ouvertureEnquetePubliqueAFaire',
                  actions: assign({
                    avisAutoriteEnvironnementaleFaite: true,
                  }),
                },
              },
            },
            ouvertureEnquetePubliqueAFaire: {
              on: { OUVRIR_ENQUETE_PUBLIQUE: 'clotureEnquetePubliqueAFaire' },
            },
            clotureEnquetePubliqueAFaire: {
              on: { CLOTURER_ENQUETE_PUBLIQUE: 'clotureEnquetePubliqueFaite' },
            },
            clotureEnquetePubliqueFaite: {
              type: 'final',
            },
          },
        },
      },
    },
    avisDREALARendre: {
      on: {
        RENDRE_AVIS_DREAL: {
          guard: peutRendreAvisDREAL,
          target: 'transmissionDuProjetDePrescriptionsAuDemandeurAFaire',
        },
      },
    },
    transmissionDuProjetDePrescriptionsAuDemandeurAFaire: {
      id: 'transmissionDuProjetDePrescriptionsAuDemandeurAFaire',
      on: {
        TRANSMETTRE_PROJET_DE_PRESCRIPTIONS_AU_DEMANDEUR: 'avisDuDemandeurSurLesPrescriptionsProposeesAFaire',
      },
    },
    avisDuDemandeurSurLesPrescriptionsProposeesAFaire: {
      on: {
        RENDRE_AVIS_DU_DEMANDEUR_SUR_LES_PRESCRIPTIONS_PROPOSEES: 'passageCoderstOuDecisionDeLAdministrationARendre',
      },
    },
    passageCoderstOuDecisionDeLAdministrationARendre: {
      on: {
        RENDRE_PASSAGE_CODERST: 'decisionDeLAdministrationARendre',
        RENDRE_DECISION_ADMINISTRATION_FAVORABLE: {
          target: 'notificationDuDemandeurEtPublicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
        RENDRE_DECISION_ADMINISTRATION_DEFAVORABLE: {
          target: 'notificationDuDemandeurEtPublicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
        },
      },
    },
    decisionDeLAdministrationARendre: {
      on: {
        RENDRE_DECISION_ADMINISTRATION_FAVORABLE: {
          target: 'notificationDuDemandeurEtPublicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
        RENDRE_DECISION_ADMINISTRATION_DEFAVORABLE: {
          target: 'notificationDuDemandeurEtPublicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
        },
      },
    },
    notificationDuDemandeurEtPublicationDeDecisionAuRecueilDesActesAdministratifsAFaire: {
      type: 'parallel',
      states: {
        notificationDuDemandeurMachine: {
          initial: 'notificationDuDemandeurAFaire',
          states: {
            notificationDuDemandeurAFaire: {
              on: {
                NOTIFICATION_DU_DEMANDEUR: 'notificationDuDemandeurFaite',
              },
            },
            notificationDuDemandeurFaite: { type: 'final' },
          },
        },
        publicationDeDecisionAuRecueilDesActesAdministratifsMachine: {
          initial: 'publicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
          states: {
            publicationDeDecisionAuRecueilDesActesAdministratifsAFaire: {
              on: {
                PUBLIER_DECISION_RECUEIL_DES_ACTES_ADMINISTRATIFS: 'publicationDeDecisionAuRecueilDesActesAdministratifsFaite',
              },
            },
            publicationDeDecisionAuRecueilDesActesAdministratifsFaite: {
              type: 'final',
            },
          },
        },
      },
    },
    publicationDeDecisionAuRecueilDesActesAdministratifsAFaire: {
      on: {
        PUBLIER_DECISION_RECUEIL_DES_ACTES_ADMINISTRATIFS: 'publicationDeDecisionAuRecueilDesActesAdministratifsFaite',
      },
    },
    publicationDeDecisionAuRecueilDesActesAdministratifsFaite: {
      type: 'final',
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
