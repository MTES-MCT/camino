import { assign, createMachine } from 'xstate'
import { IContenu } from '../../../types'

export const ETATS = {
  Demande: 'mfr',
  DepotDeLaDemande: 'mdp',
  PaiementDesFraisDeDossier: 'pfd',
  DecisionAutoriteEnvironnementale: 'dae',
  CompletudeDeLaDemande: 'mcp',
  Desistement: 'des',
  ModifierLaDemande: 'mod',
  ClassementSansSuite: 'css',
  DemandeDeComplementsDAE: 'mcd',
  ReceptionDeComplementsDAE: 'rcd',
  ModifierLaDemandeApresDAE: 'mom',
  DemandeDeComplementsCompletude: 'mcm',
  ReceptionDeComplementsCompletude: 'rcm',
  ValidationDesFraisDossier: 'vfd',
  RecepisseDeDeclarationLoiSurLEau: 'rde',
  DemandeDeComplementsRecepisseDeDeclarationLoiSurLEau: 'mcb',
  ReceptionDeComplementsRecepisseDeDeclarationLoiSurLEau: 'rcb',
  NotificationDuDemandeurApresCss: 'mnc',
  RecevabiliteDeLaDemande: 'mcr',
  ExpertiseONF: 'eof',
  avisONF: 'aof',
  saisineCommissionAutorisationsDeRecherchesMinieres: 'sca',
  avisDeLaCommissionDesAutorisationsDeRecherchesMinieres: 'aca',
  notificationDuDemandeurApresCARM: 'mnb',
  notificationDuDemandeurApresCARMDefavorable: 'mnd',
  paiementDesFraisDeDossierComplementaires: 'pfc',
  validationDuPaiementDesFraisDeDossierComplementaires: 'vfc',
  signatureAutorisationDeRechercheMiniere: 'sco'
} as const
export type Etat = typeof ETATS[keyof typeof ETATS]

export const STATUS = {
  FAIT: 'fai',
  DEPOSE: 'dep',
  EXEMPTE: 'exe',
  REQUIS: 'req',
  COMPLETE: 'com',
  INCOMPLETE: 'inc',
  FAVORABLE: 'fav',
  DEFAVORABLE: 'def'
} as const
export type Status = typeof STATUS[keyof typeof STATUS]

export interface Etape {
  typeId: Etat
  statutId: Status
  date: string
  contenu?: IContenu
}

type FaireDemandeEvent = {
  mecanise: boolean
  franchissements: number
  type: 'FAIRE_DEMANDE'
}
export type XStateEvent =
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'DESISTER_PAR_LE_DEMANDEUR' }
  | { type: 'CLASSER_SANS_SUITE' }
  | FaireDemandeEvent
  | { type: 'PAYER_FRAIS_DE_DOSSIER' }
  | { type: 'DEMANDER_MODIFICATION_DE_LA_DEMANDE' }
  | { type: 'MODIFIER_DEMANDE' }
  | { type: 'EXEMPTER_DAE' }
  | { type: 'MODIFIER_DEMANDE_APRES_DAE' }
  | { type: 'DEMANDER_COMPLEMENTS_DAE' }
  | { type: 'RECEVOIR_COMPLEMENTS_DAE' }
  | { type: 'REFUSER_COMPLETUDE' }
  | { type: 'RECEVOIR_COMPLEMENTS_COMPLETUDE' }
  | { type: 'DEMANDER_COMPLEMENTS_COMPLETUDE' }
  | { type: 'ACCEPTER_COMPLETUDE' }
  | { type: 'VALIDER_FRAIS_DE_DOSSIER' }
  | { type: 'REFUSER_RDE' }
  | { type: 'ACCEPTER_RDE' }
  | { type: 'DEMANDER_COMPLEMENTS_RDE' }
  | { type: 'RECEVOIR_COMPLEMENTS_RDE' }
  | { type: 'NOTIFIER_DEMANDEUR_CSS' }
  | { type: 'DECLARER_DEMANDE_FAVORABLE' }
  | { type: 'DECLARER_DEMANDE_DEFAVORABLE' }
  | { type: 'FAIRE_EXPERTISE_ONF' }
  | { type: 'RENDRE_AVIS_ONF' }
  | { type: 'FAIRE_SAISINE_CARM' }
  | { type: 'RENDRE_AVIS_FAVORABLE_CARM' }
  | { type: 'RENDRE_AVIS_DEFAVORABLE_CARM' }
  | { type: 'NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM' }
  | { type: 'NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM' }
  | { type: 'PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES' }
  | { type: 'VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES' }
  | { type: 'SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE' }

export type Event = XStateEvent['type']

type DBEtat = { etat: Etat; statut?: Status }
const trad: { [_key in Event]: DBEtat } = {
  FAIRE_DEMANDE: { etat: ETATS.Demande },
  DEPOSER_DEMANDE: { etat: ETATS.DepotDeLaDemande },
  PAYER_FRAIS_DE_DOSSIER: { etat: ETATS.PaiementDesFraisDeDossier },
  DEMANDER_MODIFICATION_DE_LA_DEMANDE: {
    etat: ETATS.DecisionAutoriteEnvironnementale,
    statut: STATUS.REQUIS
  },
  EXEMPTER_DAE: {
    etat: ETATS.DecisionAutoriteEnvironnementale,
    statut: STATUS.EXEMPTE
  },
  DESISTER_PAR_LE_DEMANDEUR: { etat: ETATS.Desistement },
  CLASSER_SANS_SUITE: { etat: ETATS.ClassementSansSuite },
  DEMANDER_COMPLEMENTS_DAE: { etat: ETATS.DemandeDeComplementsDAE },
  RECEVOIR_COMPLEMENTS_DAE: { etat: ETATS.ReceptionDeComplementsDAE },
  MODIFIER_DEMANDE_APRES_DAE: { etat: ETATS.ModifierLaDemandeApresDAE },
  REFUSER_COMPLETUDE: {
    etat: ETATS.CompletudeDeLaDemande,
    statut: STATUS.INCOMPLETE
  },
  RECEVOIR_COMPLEMENTS_COMPLETUDE: {
    etat: ETATS.ReceptionDeComplementsCompletude
  },
  DEMANDER_COMPLEMENTS_COMPLETUDE: {
    etat: ETATS.DemandeDeComplementsCompletude
  },
  ACCEPTER_COMPLETUDE: {
    etat: ETATS.CompletudeDeLaDemande,
    statut: STATUS.COMPLETE
  },
  VALIDER_FRAIS_DE_DOSSIER: {
    etat: ETATS.ValidationDesFraisDossier
  },
  REFUSER_RDE: {
    etat: ETATS.RecepisseDeDeclarationLoiSurLEau,
    statut: STATUS.DEFAVORABLE
  },
  ACCEPTER_RDE: {
    etat: ETATS.RecepisseDeDeclarationLoiSurLEau,
    statut: STATUS.FAVORABLE
  },
  DEMANDER_COMPLEMENTS_RDE: {
    etat: ETATS.DemandeDeComplementsRecepisseDeDeclarationLoiSurLEau
  },
  RECEVOIR_COMPLEMENTS_RDE: {
    etat: ETATS.ReceptionDeComplementsRecepisseDeDeclarationLoiSurLEau
  },
  NOTIFIER_DEMANDEUR_CSS: {
    etat: ETATS.NotificationDuDemandeurApresCss
  },
  DECLARER_DEMANDE_FAVORABLE: {
    etat: ETATS.RecevabiliteDeLaDemande,
    statut: STATUS.FAVORABLE
  },
  DECLARER_DEMANDE_DEFAVORABLE: {
    etat: ETATS.RecevabiliteDeLaDemande,
    statut: STATUS.DEFAVORABLE
  },
  FAIRE_EXPERTISE_ONF: {
    etat: ETATS.ExpertiseONF
  },
  RENDRE_AVIS_ONF: {
    // TODO 2022-04-14: comme sur le cacoo que l'avis soit favorable ou non, on va à l'étape suivante, je suis pas sûr de l'intérêt de le modéliser dans le xstate
    etat: ETATS.avisONF
  },
  FAIRE_SAISINE_CARM: {
    etat: ETATS.saisineCommissionAutorisationsDeRecherchesMinieres
  },
  RENDRE_AVIS_FAVORABLE_CARM: {
    etat: ETATS.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres,
    statut: STATUS.FAVORABLE
  },
  RENDRE_AVIS_DEFAVORABLE_CARM: {
    etat: ETATS.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres,
    statut: STATUS.DEFAVORABLE
  },
  NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM: {
    etat: ETATS.notificationDuDemandeurApresCARM
  },
  NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM: {
    etat: ETATS.notificationDuDemandeurApresCARMDefavorable
  },
  MODIFIER_DEMANDE: {
    etat: ETATS.ModifierLaDemande
  },
  PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES: {
    etat: ETATS.paiementDesFraisDeDossierComplementaires
  },
  VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES: {
    etat: ETATS.validationDuPaiementDesFraisDeDossierComplementaires
  },
  SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE: {
    etat: ETATS.signatureAutorisationDeRechercheMiniere
  }
} as const

// Related to https://github.com/Microsoft/TypeScript/issues/12870
export const EVENTS = Object.keys(trad) as Array<
  Extract<keyof typeof trad, string>
>
export const eventFrom = (etape: Etape): XStateEvent => {
  const entries = Object.entries(trad).filter(
    (entry): entry is [Event, DBEtat] => EVENTS.includes(entry[0])
  )

  let entry = entries.find(
    ([_key, value]) =>
      value.etat === etape.typeId && value.statut === etape.statutId
  )

  if (!entry) {
    entry = entries.find(([_, value]) => value.etat === etape.typeId)
  }

  if (entry) {
    const eventFromEntry = entry[0]
    switch (eventFromEntry) {
      case 'FAIRE_DEMANDE': {
        let mecanise = false
        let franchissements = 0
        if (typeof etape.contenu?.arm?.mecanise === 'boolean') {
          mecanise = etape.contenu?.arm.mecanise
        }
        if (typeof etape.contenu?.arm?.franchissements === 'number') {
          franchissements = etape.contenu?.arm?.franchissements
        }

        return { type: 'FAIRE_DEMANDE', mecanise, franchissements }
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

export const eventToEtat = (event: Event): Etat => {
  return trad[event].etat
}

interface Context {
  mecanise: boolean
  franchissementCoursEau: boolean
  visibilite: 'confidentielle' | 'publique'
  desiste: boolean
  classerSansSuite: boolean
  paiementFraisDossierValide: boolean
}

export const machine = createMachine<Context, XStateEvent>({
  id: 'oct',
  initial: 'demandeEnConstruction',
  context: {
    mecanise: false,
    franchissementCoursEau: false,
    visibilite: 'confidentielle',
    desiste: false,
    classerSansSuite: false,
    paiementFraisDossierValide: false
  },
  schema: {
    events: {} as XStateEvent
  },
  on: {
    MODIFIER_DEMANDE: {
      // TODO 2022-04-14: c'est quel target dans le cas de la modification globale de la demande ?
      // Il ne vaudrait pas mieux sortir cette étape de l'xstate et forcer à repasser toutes les étapes pour voir si c'est compatible ?
      target: 'fini',
      cond: (context, event, meta) => {
        return (
          meta.state.value !== 'demandeEnConstruction' &&
          !context.desiste &&
          !context.classerSansSuite &&
          context.visibilite === 'confidentielle'
        )
      }
    },
    DESISTER_PAR_LE_DEMANDEUR: {
      target: 'desistementDuDemandeur',
      cond: (context, event, meta) => {
        return (
          meta.state.value !== 'demandeEnConstruction' &&
          !context.desiste &&
          !context.classerSansSuite
        )
      },
      actions: assign<Context, { type: 'DESISTER_PAR_LE_DEMANDEUR' }>({
        desiste: true
      })
    },
    CLASSER_SANS_SUITE: {
      target: 'decisionDeClassementSansSuite',
      cond: (context, event, meta) => {
        return (
          meta.state.value !== 'demandeEnConstruction' &&
          !context.desiste &&
          !context.classerSansSuite
        )
      },
      actions: assign<Context, { type: 'CLASSER_SANS_SUITE' }>({
        classerSansSuite: true
      })
    }
  },
  states: {
    demandeEnConstruction: {
      on: {
        FAIRE_DEMANDE: {
          target: 'demandeFaite',
          actions: assign<Context, FaireDemandeEvent>({
            mecanise: (_context, event) => {
              return event.mecanise
            },
            franchissementCoursEau: (_context, event) => {
              return event.franchissements > 0
            }
          })
        }
      }
    },
    demandeFaite: { on: { DEPOSER_DEMANDE: 'demandeDeposee' } },
    demandeDeposee: {
      type: 'parallel',
      states: {
        paiementDesFraisDeDossier: {
          initial: 'nonPaye',
          states: {
            nonPaye: {
              on: {
                PAYER_FRAIS_DE_DOSSIER: 'paye'
              }
            },
            paye: {
              type: 'final'
            }
          }
        },
        declarationLoiSurLEau: {
          initial: 'enCours',
          states: {
            enCours: {
              always: {
                target: 'exemptee',
                cond: context =>
                  !(context.mecanise && context.franchissementCoursEau)
              },
              on: {
                REFUSER_RDE: 'modificationDeLaDemande',
                ACCEPTER_RDE: 'acceptee',
                DEMANDER_COMPLEMENTS_RDE: 'demandeDeComplements'
              }
            },
            demandeDeComplements: {
              on: {
                RECEVOIR_COMPLEMENTS_RDE: 'enCours',
                REFUSER_RDE: 'modificationDeLaDemande',
                ACCEPTER_RDE: 'acceptee',
                DEMANDER_COMPLEMENTS_RDE: 'demandeDeComplements'
              }
            },
            // Deux modifications de demande amènent à la complétude, on bloque la complétude de la demande tant que c'est pas validé, c'est pas exactement comme le cacoo mais il me semble que ça reflète la réalité ?
            modificationDeLaDemande: {
              // TODO 2022-04-14, c'est pas une mom ici ? pas trouvé dans https://dev.camino.beta.gouv.fr/metas/etapes-types
              on: { MODIFIER_DEMANDE_APRES_DAE: 'demandeModifiee' }
            },
            exemptee: { type: 'final' },
            acceptee: { type: 'final' },
            demandeModifiee: { type: 'final' }
          }
        },
        decisionAutoriteEnvironnementale: {
          initial: 'enCours',
          states: {
            enCours: {
              always: {
                target: 'exemptee',
                cond: context => !context.mecanise
              },
              on: {
                DEMANDER_MODIFICATION_DE_LA_DEMANDE: 'modificationDeLaDemande',
                EXEMPTER_DAE: 'exemptee',
                DEMANDER_COMPLEMENTS_DAE: 'demandeDeComplements'
              }
            },
            demandeDeComplements: {
              on: {
                RECEVOIR_COMPLEMENTS_DAE: 'enCours',
                EXEMPTER_DAE: 'exemptee',
                DEMANDER_MODIFICATION_DE_LA_DEMANDE: 'modificationDeLaDemande'
              }
            },
            modificationDeLaDemande: {
              on: { MODIFIER_DEMANDE_APRES_DAE: 'demandeModifiee' }
            },
            exemptee: { type: 'final' },
            demandeModifiee: { type: 'final' }
          }
        }
      },

      onDone: {
        target: 'completudeDeLaDemande'
      }
    },
    completudeDeLaDemande: {
      on: {
        REFUSER_COMPLETUDE: 'refusTemporaireCompletude',
        ACCEPTER_COMPLETUDE: 'validationDesFraisDossier'
      }
    },
    refusTemporaireCompletude: {
      on: {
        DEMANDER_COMPLEMENTS_COMPLETUDE: 'demandeDeComplements'
      }
    },
    demandeDeComplements: {
      on: {
        RECEVOIR_COMPLEMENTS_COMPLETUDE: 'completudeDeLaDemande'
      }
    },
    validationDesFraisDossier: {
      on: {
        VALIDER_FRAIS_DE_DOSSIER: [
          {
            target: 'recevabiliteDeLaDemande',
            actions: assign<Context, { type: 'VALIDER_FRAIS_DE_DOSSIER' }>({
              paiementFraisDossierValide: true
            }),
            cond: context => !context.desiste && !context.classerSansSuite
          },
          {
            target: 'fini',
            cond: context => context.desiste || context.classerSansSuite
          }
        ]
      }
    },

    recevabiliteDeLaDemande: {
      on: {
        DECLARER_DEMANDE_FAVORABLE: 'expertiseONF',
        DECLARER_DEMANDE_DEFAVORABLE: 'avisONF'
      }
    },
    expertiseONF: {
      on: {
        FAIRE_EXPERTISE_ONF: 'avisONF'
      }
    },
    avisONF: {
      on: {
        RENDRE_AVIS_ONF: 'saisineCommissionAutorisationsDeRecherchesMinieres'
      }
    },
    saisineCommissionAutorisationsDeRecherchesMinieres: {
      on: {
        FAIRE_SAISINE_CARM: {
          target: 'avisCommissionAutorisationDeRecherchesMinieres',
          actions: assign<Context, { type: 'FAIRE_SAISINE_CARM' }>({
            visibilite: 'publique'
          })
        }
      }
    },
    avisCommissionAutorisationDeRecherchesMinieres: {
      on: {
        RENDRE_AVIS_FAVORABLE_CARM: [
          {
            target: 'signatureAutorisationDeRechercheMiniere',
            cond: context => !context.mecanise
          },
          {
            target: 'notificationDuDemandeurFraisDeDossierComplementaires',
            cond: context => context.mecanise
          }
        ],
        RENDRE_AVIS_DEFAVORABLE_CARM:
          'notificationDuDemandeurAvisDefavorableCARM'
      }
    },
    notificationDuDemandeurAvisDefavorableCARM: {
      on: {
        NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM: 'fini'
      }
    },
    notificationDuDemandeurFraisDeDossierComplementaires: {
      on: {
        NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM: 'notificationDuDemanderCARM'
      }
    },
    notificationDuDemanderCARM: {
      on: {
        PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES:
          'paiementDesFraisDeDossierComplementaires'
      }
    },
    paiementDesFraisDeDossierComplementaires: {
      on: {
        VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES:
          'signatureAutorisationDeRechercheMiniere'
      }
    },
    signatureAutorisationDeRechercheMiniere: {
      on: {
        SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE:
          'notificationDuDemandeurApresAutorisationDeRechercheMiniere'
      }
    },
    notificationDuDemandeurApresAutorisationDeRechercheMiniere: {},
    desistementDuDemandeur: {
      always: {
        target: 'validationDesFraisDossier',
        cond: context => {
          return !context.paiementFraisDossierValide
        }
      }
    },
    decisionDeClassementSansSuite: {
      on: {
        NOTIFIER_DEMANDEUR_CSS:
          'notificationDuDemandeurApresClassementSansSuite'
      }
    },
    notificationDuDemandeurApresClassementSansSuite: {
      always: {
        target: 'validationDesFraisDossier',
        cond: context => {
          return !context.paiementFraisDossierValide
        }
      }
    },

    fini: {
      type: 'final'
    }
  }
})
