import { assign, createMachine } from 'xstate'
import { CaminoMachine } from '../machine-helper.js'
import { CaminoCommonContext, DBEtat, Etape } from '../machine-common.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'

export type PXGOctXStateEvent =
  | { type: 'FAIRE_DEMANDE' }
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }
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

const trad: { [key in Event]: DBEtat } = {
  FAIRE_DEMANDE: ETES.demande,
  DEPOSER_DEMANDE: ETES.depotDeLaDemande,
  DEMANDER_COMPLEMENTS_POUR_RECEVABILITE:
    ETES.demandeDeComplements_RecevabiliteDeLaDemande_,
  FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
    FAVORABLE: ETES.recevabiliteDeLaDemande.FAVORABLE
  },
  RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE:
    ETES.receptionDeComplements_RecevabiliteDeLaDemande_,
  FAIRE_SAISINES_DES_SERVICES: ETES.saisineDesServices,
  RENDRE_AVIS_DGTM_MNBST:
    ETES.avisDGTMServiceMilieuxNaturelsBiodiversiteSitesEtPaysages_MNBST_,
  RENDRE_AVIS_DGTMAUCL:
    ETES.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_,
  RENDRE_AVIS_DIRECTION_ENTREPRISE_CONCURRENCE_CONSOMMATION_TRAVAIL_EMPLOI:
    ETES.avisDeLaDirectionDesEntreprisesDeLaConcurrenceDeLaConsommationDuTravailEtDeLemploi,
  RENDRE_AVIS_DIRECTION_ALIMENTATION_AGRICULTURE_FORET:
    ETES.avisDeLaDirectionDalimentationDeLagricultureEtDeLaForet,
  RENDRE_AVIS_DIRECTION_REGIONALE_AFFAIRES_CULTURELLES:
    ETES.avisDeDirectionRegionaleDesAffairesCulturelles,
  RENDRE_AVIS_AGENCE_REGIONALE_SANTE: ETES.avisDeLagenceRegionaleDeSante,
  RENDRE_AVIS_DIRECTION_REGIONALE_FINANCES_PUBLIQUES:
    ETES.avisDeLaDirectionRegionaleDesFinancesPubliques,
  RENDRE_AVIS_CAISSE_GENERALE_DE_SECURITE_SOCIALE:
    ETES.avisDeLaCaisseGeneraleDeSecuriteSociale,
  RENDRE_AVIS_DREAL:
    ETES.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement,
  FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES: ETES.saisineDesCollectivitesLocales,
  RENDRE_CONSULTATION_DES_CONSEILS_MUNICIPAUX: ETES.avisDunMaire,
  FAIRE_CONSULTATION_CLE_DU_SAGE: ETES.consultationCLEDuSAGE,
  FAIRE_SAISINE_AUTORITE_ENVIRONNEMENTALE:
    ETES.saisineDeLautoriteEnvironnementale,
  RENDRE_AVIS_AUTORITE_ENVIRONNEMENTALE: ETES.avisDeLautoriteEnvironnementale,
  OUVRIR_ENQUETE_PUBLIQUE: ETES.ouvertureDeLenquetePublique,
  CLOTURER_ENQUETE_PUBLIQUE: ETES.clotureDeLenquetePublique,
  TRANSMETTRE_PROJET_DE_PRESCRIPTIONS_AU_DEMANDEUR:
    ETES.transmissionDuProjetDePrescriptionsAuDemandeur,
  RENDRE_AVIS_DU_DEMANDEUR_SUR_LES_PRESCRIPTIONS_PROPOSEES:
    ETES.avisDuDemandeurSurLesPrescriptionsProposees,
  RENDRE_PASSAGE_CODERST:
    ETES.avisDuConseilDepartementalDeLenvironnementEtDesRisquesSanitairesEtTechnologiques_Coderst_,
  RENDRE_DECISION_ADMINISTRATION_FAVORABLE: {
    ACCEPTE: ETES.decisionDeLadministration.ACCEPTE
  },
  RENDRE_DECISION_ADMINISTRATION_DEFAVORABLE: {
    REJETE: ETES.decisionDeLadministration.REJETE
  },
  NOTIFICATION_DU_DEMANDEUR: ETES.notificationAuDemandeur,
  PUBLIER_DECISION_RECUEIL_DES_ACTES_ADMINISTRATIFS:
    ETES.publicationDeDecisionAuRecueilDesActesAdministratifs,
  FAIRE_DESISTEMENT_DEMANDEUR: ETES.desistementDuDemandeur,
  FAIRE_CLASSEMENT_SANS_SUITE: ETES.classementSansSuite
}

// Related to https://github.com/Microsoft/TypeScript/issues/12870
export const EVENTS = Object.keys(trad) as Array<
  Extract<keyof typeof trad, string>
>

// basé sur https://cacoo.com/diagrams/QDCLi7jxd3EUOOba/249D0
export class PxgOctMachine extends CaminoMachine<
  PxgContext,
  PXGOctXStateEvent
> {
  constructor() {
    super(pxgOctMachine, trad)
  }

  eventFrom(etape: Etape): PXGOctXStateEvent {
    const entries = Object.entries(trad).filter(
      (entry): entry is [Event, DBEtat] => EVENTS.includes(entry[0])
    )

    const entry = entries.find(([_key, dbEtat]) => {
      return Object.values(dbEtat).some(
        dbEtatSingle =>
          dbEtatSingle.etapeTypeId === etape.etapeTypeId &&
          dbEtatSingle.etapeStatutId === etape.etapeStatutId
      )
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
  avisAutoriteEnvironnementaleFaite: boolean
}

const peutRendreAvisDREAL = (context: PxgContext): boolean => {
  return (
    context.saisineDesServicesFaite &&
    context.saisineDesCollectivitesLocalesFaites &&
    context.avisAutoriteEnvironnementaleFaite
  )
}

const pxgOctMachine = createMachine<PxgContext, PXGOctXStateEvent>({
  predictableActionArguments: true,
  id: 'PXGOct',
  initial: 'demandeAFaire',
  context: {
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
    visibilite: 'confidentielle',
    saisineDesServicesFaite: false,
    saisineDesCollectivitesLocalesFaites: false,
    avisAutoriteEnvironnementaleFaite: false
  },
  on: {
    FAIRE_DESISTEMENT_DEMANDEUR: {
      cond: context =>
        [
          DemarchesStatutsIds.Depose,
          DemarchesStatutsIds.EnInstruction
        ].includes(context.demarcheStatut),
      target: 'desistementDuDemandeurRendu'
    },
    FAIRE_CLASSEMENT_SANS_SUITE: {
      cond: context =>
        [
          DemarchesStatutsIds.Depose,
          DemarchesStatutsIds.EnInstruction
        ].includes(context.demarcheStatut),
      target: 'classementSansSuiteRendu'
    }
  },
  states: {
    demandeAFaire: {
      on: {
        FAIRE_DEMANDE: 'depotDeLaDemandeAFaire'
      }
    },
    depotDeLaDemandeAFaire: {
      on: {
        DEPOSER_DEMANDE: 'recevabiliteDeLaDemandeAFaire'
      }
    },
    recevabiliteDeLaDemandeAFaire: {
      on: {
        DEMANDER_COMPLEMENTS_POUR_RECEVABILITE:
          'complementsPourRecevabiliteAFaire',
        FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
          target: 'saisinesAFaire',
          actions: assign<
            PxgContext,
            { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }
          >({
            demarcheStatut: DemarchesStatutsIds.Depose,
            visibilite: 'publique'
          })
        }
      }
    },
    complementsPourRecevabiliteAFaire: {
      on: {
        RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE: 'recevabiliteDeLaDemandeAFaire',
        FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
          target: 'saisinesAFaire',
          actions: assign<
            PxgContext,
            { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }
          >({
            demarcheStatut: DemarchesStatutsIds.Depose,
            visibilite: 'publique'
          })
        }
      }
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
                cond: peutRendreAvisDREAL
              }
            },
            rendreAvisDrealAFaire: {
              on: {
                RENDRE_AVIS_DREAL: {
                  cond: peutRendreAvisDREAL,
                  target:
                    '#transmissionDuProjetDePrescriptionsAuDemandeurAFaire'
                }
              }
            }
          }
        },
        saisineDesServicesMachine: {
          initial: 'saisineDesServicesAFaire',
          states: {
            saisineDesServicesAFaire: {
              on: {
                FAIRE_SAISINES_DES_SERVICES: {
                  target: 'avisDesServicesARendre',
                  actions: assign<
                    PxgContext,
                    { type: 'FAIRE_SAISINES_DES_SERVICES' }
                  >({
                    saisineDesServicesFaite: true
                  })
                }
              }
            },
            avisDesServicesARendre: {
              type: 'parallel',
              states: {
                avisDgtmMNBSTMachine: {
                  initial: 'avisDgtmMNBSTARendre',
                  states: {
                    avisDgtmMNBSTARendre: {
                      on: { RENDRE_AVIS_DGTM_MNBST: 'avisDgtmMNBSTRendu' }
                    },
                    avisDgtmMNBSTRendu: { type: 'final' }
                  }
                },
                avisDGTMAUCLMachine: {
                  initial: 'avisDGTMAUCLARendre',
                  states: {
                    avisDGTMAUCLARendre: {
                      on: { RENDRE_AVIS_DGTMAUCL: 'avisDGTMAUCLRendu' }
                    },
                    avisDGTMAUCLRendu: { type: 'final' }
                  }
                },
                avisDirectionEntrepriseConcurrenceConsommationTravailEmploiMachine:
                  {
                    initial:
                      'avisDirectionEntrepriseConcurrenceConsommationTravailEmploiARendre',
                    states: {
                      avisDirectionEntrepriseConcurrenceConsommationTravailEmploiARendre:
                        {
                          on: {
                            RENDRE_AVIS_DIRECTION_ENTREPRISE_CONCURRENCE_CONSOMMATION_TRAVAIL_EMPLOI:
                              'avisDirectionEntrepriseConcurrenceConsommationTravailEmploiRendu'
                          }
                        },
                      avisDirectionEntrepriseConcurrenceConsommationTravailEmploiRendu:
                        { type: 'final' }
                    }
                  },
                avisDirectionAlimentationAgricultureForetMachine: {
                  initial: 'avisDirectionAlimentationAgricultureForetARendre',
                  states: {
                    avisDirectionAlimentationAgricultureForetARendre: {
                      on: {
                        RENDRE_AVIS_DIRECTION_ALIMENTATION_AGRICULTURE_FORET:
                          'avisDirectionAlimentationAgricultureForetRendu'
                      }
                    },
                    avisDirectionAlimentationAgricultureForetRendu: {
                      type: 'final'
                    }
                  }
                },
                avisDirectionRegionaleAffairesCulturellesMachine: {
                  initial: 'avisDirectionRegionaleAffairesCulturellesARendre',
                  states: {
                    avisDirectionRegionaleAffairesCulturellesARendre: {
                      on: {
                        RENDRE_AVIS_DIRECTION_REGIONALE_AFFAIRES_CULTURELLES:
                          'avisDirectionRegionaleAffairesCulturellesRendu'
                      }
                    },
                    avisDirectionRegionaleAffairesCulturellesRendu: {
                      type: 'final'
                    }
                  }
                },
                avisAgenceRegionaleSanteMachine: {
                  initial: 'avisAgenceRegionaleSanteARendre',
                  states: {
                    avisAgenceRegionaleSanteARendre: {
                      on: {
                        RENDRE_AVIS_AGENCE_REGIONALE_SANTE:
                          'avisAgenceRegionaleSanteRendu'
                      }
                    },
                    avisAgenceRegionaleSanteRendu: { type: 'final' }
                  }
                },
                avisDirectionRegionaleFinancesPubliquesMachine: {
                  initial: 'avisDirectionRegionaleFinancesPubliquesARendre',
                  states: {
                    avisDirectionRegionaleFinancesPubliquesARendre: {
                      on: {
                        RENDRE_AVIS_DIRECTION_REGIONALE_FINANCES_PUBLIQUES:
                          'avisDirectionRegionaleFinancesPubliquesRendu'
                      }
                    },
                    avisDirectionRegionaleFinancesPubliquesRendu: {
                      type: 'final'
                    }
                  }
                },
                avisCaisseGeneraleDeSecuriteSocialeMachine: {
                  initial: 'avisCaisseGeneraleDeSecuriteSocialeARendre',
                  states: {
                    avisCaisseGeneraleDeSecuriteSocialeARendre: {
                      on: {
                        RENDRE_AVIS_CAISSE_GENERALE_DE_SECURITE_SOCIALE:
                          'avisCaisseGeneraleDeSecuriteSocialeRendu'
                      }
                    },
                    avisCaisseGeneraleDeSecuriteSocialeRendu: { type: 'final' }
                  }
                }
              }
            }
          }
        },
        saisineDesCollectivitesLocalesMachine: {
          initial: 'saisineDesCollectivitesLocalesAFaire',
          states: {
            saisineDesCollectivitesLocalesAFaire: {
              on: {
                FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES: {
                  target: 'consultationCLEEtConseilsMunicipauxAFaire',
                  actions: assign<
                    PxgContext,
                    { type: 'FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES' }
                  >({
                    saisineDesCollectivitesLocalesFaites: true
                  })
                }
              }
            },
            consultationCLEEtConseilsMunicipauxAFaire: {
              type: 'parallel',
              states: {
                consultationDesConseilsMunicipauxMachine: {
                  initial: 'consultationDesConseilsMunicipauxARendre',
                  states: {
                    consultationDesConseilsMunicipauxARendre: {
                      on: {
                        RENDRE_CONSULTATION_DES_CONSEILS_MUNICIPAUX:
                          'consultationDesConseilsMunicipauxRendu'
                      }
                    },
                    consultationDesConseilsMunicipauxRendu: { type: 'final' }
                  }
                },
                consultationCLEDuSAGEMachine: {
                  initial: 'consultationCLEDuSAGEAFaire',
                  states: {
                    consultationCLEDuSAGEAFaire: {
                      on: {
                        FAIRE_CONSULTATION_CLE_DU_SAGE: {
                          cond: context =>
                            context.saisineDesCollectivitesLocalesFaites &&
                            context.avisAutoriteEnvironnementaleFaite,
                          target: 'consultationCLEDuSAGEAFait'
                        }
                      }
                    },
                    consultationCLEDuSAGEAFait: { type: 'final' }
                  }
                }
              }
            }
          }
        },
        saisineAutoriteEnvironnementaleMachine: {
          initial: 'saisineAutoriteEnvironnementaleAFaire',
          states: {
            saisineAutoriteEnvironnementaleAFaire: {
              on: {
                FAIRE_SAISINE_AUTORITE_ENVIRONNEMENTALE:
                  'avisAutoriteEnvironnementaleAFaire'
              }
            },
            avisAutoriteEnvironnementaleAFaire: {
              on: {
                RENDRE_AVIS_AUTORITE_ENVIRONNEMENTALE: {
                  target: 'ouvertureEnquetePubliqueAFaire',
                  actions: assign<
                    PxgContext,
                    { type: 'RENDRE_AVIS_AUTORITE_ENVIRONNEMENTALE' }
                  >({
                    avisAutoriteEnvironnementaleFaite: true
                  })
                }
              }
            },
            ouvertureEnquetePubliqueAFaire: {
              on: { OUVRIR_ENQUETE_PUBLIQUE: 'clotureEnquetePubliqueAFaire' }
            },
            clotureEnquetePubliqueAFaire: {
              on: { CLOTURER_ENQUETE_PUBLIQUE: 'clotureEnquetePubliqueFaite' }
            },
            clotureEnquetePubliqueFaite: {
              type: 'final'
            }
          }
        }
      }
    },
    avisDREALARendre: {
      on: {
        RENDRE_AVIS_DREAL: {
          cond: peutRendreAvisDREAL,
          target: 'transmissionDuProjetDePrescriptionsAuDemandeurAFaire'
        }
      }
    },
    transmissionDuProjetDePrescriptionsAuDemandeurAFaire: {
      id: 'transmissionDuProjetDePrescriptionsAuDemandeurAFaire',
      on: {
        TRANSMETTRE_PROJET_DE_PRESCRIPTIONS_AU_DEMANDEUR:
          'avisDuDemandeurSurLesPrescriptionsProposeesAFaire'
      }
    },
    avisDuDemandeurSurLesPrescriptionsProposeesAFaire: {
      on: {
        RENDRE_AVIS_DU_DEMANDEUR_SUR_LES_PRESCRIPTIONS_PROPOSEES:
          'passageCoderstOuDecisionDeLAdministrationARendre'
      }
    },
    passageCoderstOuDecisionDeLAdministrationARendre: {
      on: {
        RENDRE_PASSAGE_CODERST: 'decisionDeLAdministrationARendre',
        RENDRE_DECISION_ADMINISTRATION_FAVORABLE: {
          target:
            'notificationDuDemandeurEtPublicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
          actions: assign<
            PxgContext,
            { type: 'RENDRE_DECISION_ADMINISTRATION_FAVORABLE' }
          >({
            demarcheStatut: DemarchesStatutsIds.Accepte
          })
        },
        RENDRE_DECISION_ADMINISTRATION_DEFAVORABLE: {
          target:
            'notificationDuDemandeurEtPublicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
          actions: assign<
            PxgContext,
            { type: 'RENDRE_DECISION_ADMINISTRATION_DEFAVORABLE' }
          >({
            demarcheStatut: DemarchesStatutsIds.Rejete
          })
        }
      }
    },
    decisionDeLAdministrationARendre: {
      on: {
        RENDRE_DECISION_ADMINISTRATION_FAVORABLE: {
          target:
            'notificationDuDemandeurEtPublicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
          actions: assign<
            PxgContext,
            { type: 'RENDRE_DECISION_ADMINISTRATION_FAVORABLE' }
          >({
            demarcheStatut: DemarchesStatutsIds.Accepte
          })
        },
        RENDRE_DECISION_ADMINISTRATION_DEFAVORABLE: {
          target:
            'notificationDuDemandeurEtPublicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
          actions: assign<
            PxgContext,
            { type: 'RENDRE_DECISION_ADMINISTRATION_DEFAVORABLE' }
          >({
            demarcheStatut: DemarchesStatutsIds.Rejete
          })
        }
      }
    },
    notificationDuDemandeurEtPublicationDeDecisionAuRecueilDesActesAdministratifsAFaire:
      {
        type: 'parallel',
        states: {
          notificationDuDemandeurMachine: {
            initial: 'notificationDuDemandeurAFaire',
            states: {
              notificationDuDemandeurAFaire: {
                on: {
                  NOTIFICATION_DU_DEMANDEUR: 'notificationDuDemandeurFaite'
                }
              },
              notificationDuDemandeurFaite: { type: 'final' }
            }
          },
          publicationDeDecisionAuRecueilDesActesAdministratifsMachine: {
            initial:
              'publicationDeDecisionAuRecueilDesActesAdministratifsAFaire',
            states: {
              publicationDeDecisionAuRecueilDesActesAdministratifsAFaire: {
                on: {
                  PUBLIER_DECISION_RECUEIL_DES_ACTES_ADMINISTRATIFS:
                    'publicationDeDecisionAuRecueilDesActesAdministratifsFaite'
                }
              },
              publicationDeDecisionAuRecueilDesActesAdministratifsFaite: {
                type: 'final'
              }
            }
          }
        }
      },
    desistementDuDemandeurRendu: {
      type: 'final',
      entry: assign<PxgContext>({
        demarcheStatut: DemarchesStatutsIds.Desiste,
        visibilite: 'publique'
      })
    },
    classementSansSuiteRendu: {
      type: 'final',
      entry: assign<PxgContext>({
        demarcheStatut: DemarchesStatutsIds.ClasseSansSuite,
        visibilite: 'publique'
      })
    }
  }
})
