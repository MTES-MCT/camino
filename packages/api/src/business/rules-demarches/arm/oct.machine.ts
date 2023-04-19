import { assign, createMachine } from 'xstate'
import { IContenu } from '../../../types.js'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { CaminoMachine } from '../machine-helper.js'
import { CaminoCommonContext, DBEtat, Etape, tags } from '../machine-common.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'

type FaireDemandeEvent = {
  mecanise: boolean
  franchissements: number | null
  type: 'FAIRE_DEMANDE'
}

type RecevoirComplementsRde = {
  franchissements: number | null
  type: 'RECEVOIR_COMPLEMENTS_RDE'
}

type AccepterRDE = {
  franchissements: number | null
  type: 'ACCEPTER_RDE'
}
type RefuserRDE = {
  franchissements: number | null
  type: 'REFUSER_RDE'
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
  | RefuserRDE
  | AccepterRDE
  | { type: 'DEMANDER_COMPLEMENTS_RDE' }
  | RecevoirComplementsRde
  | { type: 'NOTIFIER_DEMANDEUR_CSS' }
  | { type: 'DECLARER_DEMANDE_FAVORABLE' }
  | { type: 'DECLARER_DEMANDE_DEFAVORABLE' }
  | { type: 'FAIRE_EXPERTISE_ONF' }
  | { type: 'RENDRE_AVIS_ONF' }
  | { type: 'DEMANDER_INFORMATION_AVIS_ONF' }
  | { type: 'RECEVOIR_INFORMATION_AVIS_ONF' }
  | { type: 'FAIRE_SAISINE_CARM' }
  | { type: 'RENDRE_AVIS_FAVORABLE_CARM' }
  | { type: 'RENDRE_AVIS_DEFAVORABLE_CARM' }
  | { type: 'RENDRE_AVIS_AJOURNE_CARM' }
  | { type: 'NOTIFIER_DEMANDEUR_AVIS_AJOURNE_CARM' }
  | { type: 'DEMANDER_COMPLEMENT_SAISINE_CARM' }
  | { type: 'RECEVOIR_COMPLEMENT_SAISINE_CARM' }
  | { type: 'NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM' }
  | { type: 'NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM' }
  | { type: 'PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES' }
  | { type: 'VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES' }
  | { type: 'SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE' }
  | { type: 'DEMANDER_INFORMATION_MCR' }
  | { type: 'RECEVOIR_INFORMATION_MCR' }
  | { type: 'DEMANDER_COMPLEMENTS_MCR' }
  | { type: 'RECEVOIR_COMPLEMENTS_MCR' }
  | { type: 'DEMANDER_INFORMATION_EXPERTISE_ONF' }
  | { type: 'RECEVOIR_INFORMATION_EXPERTISE_ONF' }
  | { type: 'RECEVOIR_EXPERTISE_SERVICE_EAU' }
  | { type: 'RECEVOIR_EXPERTISE_SERVICE_MINES' }
  | { type: 'NOTIFIER_DEMANDEUR_SIGNATURE_ARM' }
  | { type: 'FAIRE_AVENANT_ARM' }
  | { type: 'NOTIFIER_AVENANT_ARM' }

export type Event = XStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: EtapesTypesEtapesStatuts.demande, mainStep: true },
  DEPOSER_DEMANDE: { db: EtapesTypesEtapesStatuts.depotDeLaDemande, mainStep: true },
  PAYER_FRAIS_DE_DOSSIER: { db: EtapesTypesEtapesStatuts.paiementDesFraisDeDossier, mainStep: true },
  DEMANDER_MODIFICATION_DE_LA_DEMANDE: {
    db: {
      REQUIS: EtapesTypesEtapesStatuts.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.REQUIS,
    },
    mainStep: false,
  },
  EXEMPTER_DAE: {
    db: {
      EXEMPTE: EtapesTypesEtapesStatuts.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.EXEMPTE,
    },
    mainStep: true,
  },
  DESISTER_PAR_LE_DEMANDEUR: { db: EtapesTypesEtapesStatuts.desistementDuDemandeur, mainStep: false },
  CLASSER_SANS_SUITE: { db: EtapesTypesEtapesStatuts.classementSansSuite, mainStep: false },
  DEMANDER_COMPLEMENTS_DAE: { db: EtapesTypesEtapesStatuts.demandeDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, mainStep: false },
  RECEVOIR_COMPLEMENTS_DAE: { db: EtapesTypesEtapesStatuts.receptionDeComplements_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet__, mainStep: false },
  MODIFIER_DEMANDE_APRES_DAE: { db: EtapesTypesEtapesStatuts.modificationDeLaDemande_DecisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, mainStep: true },
  REFUSER_COMPLETUDE: {
    db: {
      INCOMPLETE: EtapesTypesEtapesStatuts.completudeDeLaDemande.INCOMPLETE,
    },
    mainStep: false,
  },
  RECEVOIR_COMPLEMENTS_COMPLETUDE: { db: EtapesTypesEtapesStatuts.receptionDeComplements_CompletudeDeLaDemande_, mainStep: false },
  DEMANDER_COMPLEMENTS_COMPLETUDE: { db: EtapesTypesEtapesStatuts.demandeDeComplements_CompletudeDeLaDemande_, mainStep: false },
  ACCEPTER_COMPLETUDE: {
    db: {
      COMPLETE: EtapesTypesEtapesStatuts.completudeDeLaDemande.COMPLETE,
    },
    mainStep: true,
  },
  VALIDER_FRAIS_DE_DOSSIER: { db: EtapesTypesEtapesStatuts.validationDuPaiementDesFraisDeDossier, mainStep: true },
  REFUSER_RDE: {
    db: {
      DEFAVORABLE: EtapesTypesEtapesStatuts.recepisseDeDeclarationLoiSurLeau.DEFAVORABLE,
    },
    mainStep: false,
  },
  ACCEPTER_RDE: {
    db: {
      FAVORABLE: EtapesTypesEtapesStatuts.recepisseDeDeclarationLoiSurLeau.FAVORABLE,
    },
    mainStep: true,
  },
  DEMANDER_COMPLEMENTS_RDE: { db: EtapesTypesEtapesStatuts.demandeDeComplements_RecepisseDeDeclarationLoiSurLeau_, mainStep: false },
  RECEVOIR_COMPLEMENTS_RDE: { db: EtapesTypesEtapesStatuts.receptionDeComplements_RecepisseDeDeclarationLoiSurLeau_, mainStep: false },
  NOTIFIER_DEMANDEUR_CSS: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_ClassementSansSuite_, mainStep: true },
  DECLARER_DEMANDE_FAVORABLE: {
    db: {
      FAVORABLE: EtapesTypesEtapesStatuts.recevabiliteDeLaDemande.FAVORABLE,
    },
    mainStep: true,
  },
  DECLARER_DEMANDE_DEFAVORABLE: {
    db: {
      DEFAVORABLE: EtapesTypesEtapesStatuts.recevabiliteDeLaDemande.DEFAVORABLE,
    },
    mainStep: false,
  },
  FAIRE_EXPERTISE_ONF: { db: EtapesTypesEtapesStatuts.expertiseDeLOfficeNationalDesForets, mainStep: true },
  RENDRE_AVIS_ONF: { db: EtapesTypesEtapesStatuts.avisDeLOfficeNationalDesForets, mainStep: true },
  DEMANDER_INFORMATION_AVIS_ONF: { db: EtapesTypesEtapesStatuts.demandeDinformations_AvisDeLOfficeNationalDesForets_, mainStep: false },
  RECEVOIR_INFORMATION_AVIS_ONF: { db: EtapesTypesEtapesStatuts.receptionDinformation_AvisDeLOfficeNationalDesForets_, mainStep: false },
  FAIRE_SAISINE_CARM: { db: EtapesTypesEtapesStatuts.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, mainStep: true },
  RENDRE_AVIS_FAVORABLE_CARM: {
    db: {
      FAVORABLE: EtapesTypesEtapesStatuts.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_.FAVORABLE,
    },
    mainStep: true,
  },
  RENDRE_AVIS_DEFAVORABLE_CARM: {
    db: {
      DEFAVORABLE: EtapesTypesEtapesStatuts.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_.DEFAVORABLE,
    },
    mainStep: false,
  },
  RENDRE_AVIS_AJOURNE_CARM: {
    db: {
      AJOURNE: EtapesTypesEtapesStatuts.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_.AJOURNE,
    },
    mainStep: false,
  },
  NOTIFIER_DEMANDEUR_AVIS_AJOURNE_CARM: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_AjournementDeLaCARM_, mainStep: true },
  DEMANDER_COMPLEMENT_SAISINE_CARM: { db: EtapesTypesEtapesStatuts.demandeDeComplements_SaisineDeLaCARM_, mainStep: false },
  RECEVOIR_COMPLEMENT_SAISINE_CARM: { db: EtapesTypesEtapesStatuts.receptionDeComplements_SaisineDeLaCARM_, mainStep: false },
  NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_AvisFavorableDeLaCARM_, mainStep: true },
  NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_AvisDefavorable_, mainStep: true },
  MODIFIER_DEMANDE: { db: EtapesTypesEtapesStatuts.modificationDeLaDemande, mainStep: false },
  PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES: { db: EtapesTypesEtapesStatuts.paiementDesFraisDeDossierComplementaires, mainStep: true },
  VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES: { db: EtapesTypesEtapesStatuts.validationDuPaiementDesFraisDeDossierComplementaires, mainStep: true },
  SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE: { db: EtapesTypesEtapesStatuts.signatureDeLautorisationDeRechercheMiniere, mainStep: true },
  DEMANDER_INFORMATION_MCR: { db: EtapesTypesEtapesStatuts.demandeDinformations_RecevabiliteDeLaDemande_, mainStep: false },
  RECEVOIR_INFORMATION_MCR: { db: EtapesTypesEtapesStatuts.receptionDinformation_RecevabiliteDeLaDemande_, mainStep: false },
  DEMANDER_COMPLEMENTS_MCR: { db: EtapesTypesEtapesStatuts.demandeDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  RECEVOIR_COMPLEMENTS_MCR: { db: EtapesTypesEtapesStatuts.receptionDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  DEMANDER_INFORMATION_EXPERTISE_ONF: { db: EtapesTypesEtapesStatuts.demandeDinformations_ExpertiseDeLOfficeNationalDesForets_, mainStep: false },
  RECEVOIR_INFORMATION_EXPERTISE_ONF: { db: EtapesTypesEtapesStatuts.receptionDinformation_ExpertiseDeLOfficeNationalDesForets_, mainStep: false },
  RECEVOIR_EXPERTISE_SERVICE_EAU: { db: EtapesTypesEtapesStatuts.expertiseDREALOuDGTMServiceEau, mainStep: false },
  RECEVOIR_EXPERTISE_SERVICE_MINES: { db: EtapesTypesEtapesStatuts.expertiseDGTMServicePreventionDesRisquesEtIndustriesExtractives_DATE_, mainStep: false },
  NOTIFIER_DEMANDEUR_SIGNATURE_ARM: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_, mainStep: true },
  FAIRE_AVENANT_ARM: { db: EtapesTypesEtapesStatuts.avenantALautorisationDeRechercheMiniere, mainStep: false },
  NOTIFIER_AVENANT_ARM: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_, mainStep: false },
} as const

// Related to https://github.com/Microsoft/TypeScript/issues/12870
export const EVENTS = Object.keys(trad) as Array<Extract<keyof typeof trad, string>>

export class ArmOctMachine extends CaminoMachine<OctARMContext, XStateEvent> {
  constructor() {
    super(armOctMachine, trad)
  }

  caminoXStateEventToEtapes(event: XStateEvent): Omit<Etape, 'date'>[] {
    const dbEtat: DBEtat = trad[event.type].db
    let contenu: IContenu | undefined
    switch (event.type) {
      case 'FAIRE_DEMANDE': {
        contenu = {
          arm: {
            mecanise: event.mecanise,
            franchissements: event.franchissements,
          },
        }
        break
      }
      case 'ACCEPTER_RDE':
      case 'REFUSER_RDE':
      case 'RECEVOIR_COMPLEMENTS_RDE': {
        contenu = { arm: { franchissements: event.franchissements } }
      }
    }

    return Object.values(dbEtat).map(({ etapeTypeId, etapeStatutId }) => ({
      etapeTypeId,
      etapeStatutId,
      contenu,
    }))
  }

  eventFrom(etape: Etape): XStateEvent {
    const entries = Object.entries(trad).filter((entry): entry is [Event, { db: DBEtat; mainStep: boolean }] => EVENTS.includes(entry[0]))

    const entry = entries.find(([_key, { db: dbEtat }]) => {
      return Object.values(dbEtat).some(dbEtatSingle => dbEtatSingle.etapeTypeId === etape.etapeTypeId && dbEtatSingle.etapeStatutId === etape.etapeStatutId)
    })

    if (entry) {
      const eventFromEntry = entry[0]
      switch (eventFromEntry) {
        case 'FAIRE_DEMANDE': {
          let mecanise = false
          let franchissements = null
          if (typeof etape.contenu?.arm?.mecanise === 'boolean') {
            mecanise = etape.contenu?.arm.mecanise
          }
          if (typeof etape.contenu?.arm?.franchissements === 'number') {
            franchissements = etape.contenu?.arm?.franchissements
          }

          return { type: eventFromEntry, mecanise, franchissements }
        }
        case 'ACCEPTER_RDE':
        case 'REFUSER_RDE':
        case 'RECEVOIR_COMPLEMENTS_RDE': {
          let franchissements = null
          if (typeof etape.contenu?.arm?.franchissements === 'number') {
            franchissements = etape.contenu?.arm?.franchissements
          }

          return { type: eventFromEntry, franchissements }
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

  toPotentialCaminoXStateEvent(event: XStateEvent['type']): XStateEvent[] {
    switch (event) {
      case 'FAIRE_DEMANDE': {
        return [
          { type: event, mecanise: false, franchissements: null },
          { type: event, mecanise: false, franchissements: 3 },
          { type: event, mecanise: true, franchissements: null },
          { type: event, mecanise: true, franchissements: 0 },
          { type: event, mecanise: true, franchissements: 2 },
        ]
      }
      case 'ACCEPTER_RDE':
      case 'REFUSER_RDE':
      case 'RECEVOIR_COMPLEMENTS_RDE': {
        return [
          { type: event, franchissements: 0 },
          { type: event, franchissements: 3 },
        ]
      }
      default:
        // related to https://github.com/microsoft/TypeScript/issues/46497  https://github.com/microsoft/TypeScript/issues/40803 :(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return [{ type: event }]
    }
  }
}

type MecanisationConnuMecanise = {
  mecanise: true
  paiementFraisDossierComplementaireValide: boolean
  franchissementCoursEau: number
}

type MecanisationConnuNonMecanise = { mecanise: false }
type MecanisationConnu = MecanisationConnuMecanise | MecanisationConnuNonMecanise

type MecanisationInconnu = MecanisationConnu | 'inconnu'

export interface OctARMContext extends CaminoCommonContext {
  mecanisation: MecanisationInconnu
  expertiseONFFaite: boolean
  paiementFraisDossierValide: boolean
}

const isConnu = (mecanisation: MecanisationInconnu): mecanisation is MecanisationConnu => {
  return mecanisation !== 'inconnu'
}
const isInconnu = (mecanisation: MecanisationInconnu): mecanisation is MecanisationInconnu => {
  return !isConnu(mecanisation)
}

const isMecanise = (mecanisation: MecanisationInconnu): mecanisation is MecanisationConnuMecanise => {
  return isConnu(mecanisation) && mecanisation.mecanise
}
const isNonMecanise = (mecanisation: MecanisationInconnu): mecanisation is MecanisationConnuNonMecanise => {
  return isConnu(mecanisation) && !mecanisation.mecanise
}
const mustPayerFraisDossierComplementaire = (mecanisation: MecanisationInconnu): boolean => {
  return isMecanise(mecanisation) && !mecanisation.paiementFraisDossierComplementaireValide
}

const fraisDeDossierComplementairesPayeOuExempte = (mecanisation: MecanisationInconnu): boolean => {
  return isConnu(mecanisation) && (!mecanisation.mecanise || mecanisation.paiementFraisDossierComplementaireValide)
}

const validationFraisApresDesistementOuClassementSansSuite = [
  {
    target: 'demandeEnConstructionOuDeposeeOuEnInstructionMachine.pasRdeMachine.validationDesFraisDossierAFaire',
    cond: (context: OctARMContext) => {
      return !context.paiementFraisDossierValide
    },
  },
  {
    target: 'validationDuPaiementDesFraisDeDossierComplementairesAFaire',
    cond: (context: OctARMContext) => {
      return context.paiementFraisDossierValide && mustPayerFraisDossierComplementaire(context.mecanisation)
    },
  },
  {
    target: 'fini',
    cond: (context: OctARMContext) => {
      return context.paiementFraisDossierValide && fraisDeDossierComplementairesPayeOuExempte(context.mecanisation)
    },
  },
]

const actionMecanisation = assign<OctARMContext>({
  mecanisation: context => {
    if (isMecanise(context.mecanisation)) {
      return context.mecanisation
    }

    return {
      mecanise: true,
      paiementFraisDossierComplementaireValide: false,
      franchissementCoursEau: 0,
    }
  },
})

const actionAccepterOuRefuserRDE = assign<OctARMContext, AccepterRDE | RefuserRDE>({
  mecanisation: (context, event) => {
    if (event.franchissements === null || event.franchissements < 1) {
      throw new Error('cas impossible')
    }
    if (isMecanise(context.mecanisation)) {
      return {
        ...context.mecanisation,
        franchissementCoursEau: event.franchissements,
      }
    }

    return {
      mecanise: true,
      paiementFraisDossierComplementaireValide: false,
      franchissementCoursEau: event.franchissements,
    }
  },
})

const actionRecevoirComplementsRde = assign<OctARMContext, RecevoirComplementsRde>({
  mecanisation: (context, event) => {
    if (event.franchissements === null) {
      throw new Error('cas impossible')
    }
    if (isMecanise(context.mecanisation)) {
      return {
        ...context.mecanisation,
        franchissementCoursEau: event.franchissements,
      }
    }

    return {
      mecanise: true,
      paiementFraisDossierComplementaireValide: false,
      franchissementCoursEau: event.franchissements,
    }
  },
})

const armOctMachine = createMachine<OctARMContext, XStateEvent>({
  predictableActionArguments: true,
  id: 'oct',
  initial: 'demandeEnConstructionOuDeposeeOuEnInstructionMachine',
  context: {
    mecanisation: 'inconnu',
    expertiseONFFaite: false,
    visibilite: 'confidentielle',
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
    paiementFraisDossierValide: false,
  },
  on: {
    MODIFIER_DEMANDE: {
      actions: () => ({}),
      cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction && context.visibilite === 'confidentielle',
    },
    DESISTER_PAR_LE_DEMANDEUR: {
      target: 'desistementDuDemandeurFait',
      cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
      actions: assign<OctARMContext, { type: 'DESISTER_PAR_LE_DEMANDEUR' }>({
        demarcheStatut: DemarchesStatutsIds.Desiste,
        visibilite: 'publique',
      }),
    },
    CLASSER_SANS_SUITE: {
      target: 'decisionDeClassementSansSuiteFait',
      cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
      actions: assign<OctARMContext, { type: 'CLASSER_SANS_SUITE' }>({
        demarcheStatut: DemarchesStatutsIds.ClasseSansSuite,
        visibilite: 'publique',
      }),
    },
  },
  states: {
    demandeEnConstructionOuDeposeeOuEnInstructionMachine: {
      type: 'parallel',
      onDone: {
        target: 'saisineCommissionAutorisationsDeRecherchesMinieresAFaire',
      },
      states: {
        pasRdeMachine: {
          initial: 'demandeEnConstructionOuDeposeeMachine',
          states: {
            demandeEnConstructionOuDeposeeMachine: {
              type: 'parallel',
              states: {
                demandeMachine: {
                  initial: 'demandeAFaire',
                  states: {
                    demandeAFaire: {
                      on: {
                        FAIRE_DEMANDE: {
                          target: 'demandeADeposer',
                          actions: assign<OctARMContext, FaireDemandeEvent>({
                            mecanisation: (context, event) => {
                              if (isMecanise(context.mecanisation) && context.mecanisation.franchissementCoursEau > 0 && (event.franchissements === null || event.franchissements === 0)) {
                                throw new Error("pas le droit d'avoir pas de franchissements alors qu'une rde a été faite")
                              } else {
                                return event.mecanise
                                  ? {
                                      mecanise: true,
                                      paiementFraisDossierComplementaireValide: false,
                                      franchissementCoursEau: event.franchissements ?? 0,
                                    }
                                  : { mecanise: false }
                              }
                            },
                          }),
                          cond: (context, event) => {
                            if (isMecanise(context.mecanisation) && !event.mecanise) {
                              return false
                            }

                            if (isMecanise(context.mecanisation) && context.mecanisation.franchissementCoursEau > 0 && (event.franchissements === null || event.franchissements === 0)) {
                              return false
                            }

                            return true
                          },
                        },
                      },
                    },
                    demandeADeposer: {
                      on: {
                        DEPOSER_DEMANDE: {
                          target: 'demandeDeposee',
                          actions: assign<OctARMContext, { type: 'DEPOSER_DEMANDE' }>({
                            demarcheStatut: DemarchesStatutsIds.EnInstruction,
                          }),
                        },
                      },
                    },
                    demandeDeposee: {
                      type: 'final',
                    },
                  },
                },
                paiementDesFraisDeDossierMachine: {
                  initial: 'paiementDesFraisDeDossierAFaire',
                  states: {
                    paiementDesFraisDeDossierAFaire: {
                      on: {
                        PAYER_FRAIS_DE_DOSSIER: 'paiementDesFraisDeDossierFait',
                      },
                    },
                    paiementDesFraisDeDossierFait: {
                      type: 'final',
                    },
                  },
                },
                decisionAutoriteEnvironnementaleMachine: {
                  initial: 'decisionAutoriteEnvironnementaleAFaire',
                  states: {
                    decisionAutoriteEnvironnementaleAFaire: {
                      always: {
                        target: 'decisionAutoriteEnvironnementaleExemptee',
                        cond: context => isNonMecanise(context.mecanisation),
                      },
                      on: {
                        DEMANDER_MODIFICATION_DE_LA_DEMANDE: {
                          target: 'modificationDeLaDemandeAFaire',
                          actions: actionMecanisation,
                        },
                        EXEMPTER_DAE: {
                          target: 'decisionAutoriteEnvironnementaleExemptee',
                          actions: actionMecanisation,
                        },
                        DEMANDER_COMPLEMENTS_DAE: {
                          target: 'recevoirComplementDAEAFaire',
                          cond: context => context.demarcheStatut !== DemarchesStatutsIds.EnConstruction,
                        },
                      },
                    },
                    recevoirComplementDAEAFaire: {
                      on: {
                        RECEVOIR_COMPLEMENTS_DAE: 'decisionAutoriteEnvironnementaleAFaire',
                        EXEMPTER_DAE: {
                          target: 'decisionAutoriteEnvironnementaleExemptee',
                          actions: actionMecanisation,
                        },
                        DEMANDER_MODIFICATION_DE_LA_DEMANDE: {
                          target: 'modificationDeLaDemandeAFaire',
                          actions: actionMecanisation,
                        },
                      },
                    },
                    modificationDeLaDemandeAFaire: {
                      on: {
                        MODIFIER_DEMANDE_APRES_DAE: 'modificationDeLaDemandeFaite',
                      },
                    },
                    decisionAutoriteEnvironnementaleExemptee: { type: 'final' },
                    modificationDeLaDemandeFaite: { type: 'final' },
                  },
                },
              },

              onDone: {
                target: 'completudeDeLaDemandeAFaire',
              },
            },
            completudeDeLaDemandeAFaire: {
              on: {
                REFUSER_COMPLETUDE: 'demandeDeComplementsPourCompletudeAFaire',
                ACCEPTER_COMPLETUDE: 'validationDesFraisDossierAFaire',
              },
              tags: [tags.responsable['ope-ptmg-973-01']],
            },
            demandeDeComplementsPourCompletudeAFaire: {
              on: {
                DEMANDER_COMPLEMENTS_COMPLETUDE: 'receptionDeComplementsPourCompletudeAFaire',
              },
            },
            receptionDeComplementsPourCompletudeAFaire: {
              on: {
                RECEVOIR_COMPLEMENTS_COMPLETUDE: 'completudeDeLaDemandeAFaire',
              },
            },
            validationDesFraisDossierAFaire: {
              tags: [tags.responsable['ope-onf-973-01']],
              on: {
                VALIDER_FRAIS_DE_DOSSIER: [
                  {
                    target: 'recevabiliteDeLaDemandeAFaire',
                    actions: assign<OctARMContext, { type: 'VALIDER_FRAIS_DE_DOSSIER' }>({
                      paiementFraisDossierValide: true,
                    }),
                    cond: context => context.demarcheStatut !== DemarchesStatutsIds.Desiste && context.demarcheStatut !== DemarchesStatutsIds.ClasseSansSuite,
                  },
                  {
                    target: '#fini',
                    cond: context => (context.demarcheStatut === DemarchesStatutsIds.Desiste || context.demarcheStatut === DemarchesStatutsIds.ClasseSansSuite) && isNonMecanise(context.mecanisation),
                  },
                  {
                    target: '#validationDuPaiementDesFraisDeDossierComplementairesAFaire',
                    cond: context =>
                      (context.demarcheStatut === DemarchesStatutsIds.Desiste || context.demarcheStatut === DemarchesStatutsIds.ClasseSansSuite) &&
                      mustPayerFraisDossierComplementaire(context.mecanisation),
                  },
                ],
              },
            },
            recevabiliteDeLaDemandeAFaire: {
              tags: [tags.responsable['ope-onf-973-01']],
              on: {
                DEMANDER_INFORMATION_MCR: 'receptionInformationPourLaRecevabiliteAFaire',
                DEMANDER_COMPLEMENTS_MCR: 'receptionComplementsPourLaRecevabiliteAFaire',
                DECLARER_DEMANDE_FAVORABLE: 'expertisesMachine',
                DECLARER_DEMANDE_DEFAVORABLE: 'avisONFARendre',
              },
            },
            receptionInformationPourLaRecevabiliteAFaire: {
              on: {
                RECEVOIR_INFORMATION_MCR: 'recevabiliteDeLaDemandeAFaire',
                DECLARER_DEMANDE_FAVORABLE: 'expertisesMachine',
                DECLARER_DEMANDE_DEFAVORABLE: 'avisONFARendre',
              },
            },
            receptionComplementsPourLaRecevabiliteAFaire: {
              on: {
                RECEVOIR_COMPLEMENTS_MCR: 'recevabiliteDeLaDemandeAFaire',
                DECLARER_DEMANDE_FAVORABLE: 'expertisesMachine',
                DECLARER_DEMANDE_DEFAVORABLE: 'avisONFARendre',
              },
            },
            expertisesMachine: {
              type: 'parallel',
              states: {
                expertiseONFMachine: {
                  initial: 'expertiseONFAFaire',
                  states: {
                    expertiseONFAFaire: {
                      on: {
                        DEMANDER_INFORMATION_EXPERTISE_ONF: 'expertiseOuReceptionInformationONFAFaire',
                        FAIRE_EXPERTISE_ONF: 'demandeAvisONFAFaire',
                      },
                    },
                    expertiseOuReceptionInformationONFAFaire: {
                      on: {
                        FAIRE_EXPERTISE_ONF: 'demandeAvisONFAFaire',
                        RECEVOIR_INFORMATION_EXPERTISE_ONF: 'expertiseONFAFaire',
                      },
                    },
                    demandeAvisONFAFaire: {
                      on: {
                        DEMANDER_INFORMATION_AVIS_ONF: 'receptionInformationAvisONFAFaire',
                      },
                      entry: assign<OctARMContext>({ expertiseONFFaite: true }),
                    },
                    receptionInformationAvisONFAFaire: {
                      on: {
                        RECEVOIR_INFORMATION_AVIS_ONF: 'demandeAvisONFAFaire',
                      },
                    },
                  },
                },
                expertiseServiceEauMachine: {
                  initial: 'expertiseServiceEauAfaire',
                  states: {
                    expertiseServiceEauAfaire: {
                      on: {
                        RECEVOIR_EXPERTISE_SERVICE_EAU: 'expertiseServiceEauFait',
                      },
                    },
                    expertiseServiceEauFait: {
                      type: 'final',
                    },
                  },
                },
                expertiseServiceMinesMachine: {
                  initial: 'expertiseServiceMinesAFaire',
                  states: {
                    expertiseServiceMinesAFaire: {
                      on: {
                        RECEVOIR_EXPERTISE_SERVICE_MINES: 'expertiseServiceMinesFait',
                      },
                    },
                    expertiseServiceMinesFait: { type: 'final' },
                  },
                },
              },
              on: {
                RENDRE_AVIS_ONF: {
                  target: 'avisONFRendu',
                  cond: context => context.expertiseONFFaite,
                },
              },
            },
            avisONFARendre: {
              on: {
                RENDRE_AVIS_ONF: {
                  target: 'avisONFRendu',
                },
              },
            },
            avisONFRendu: { type: 'final' },
          },
        },
        declarationLoiSurLEauMachine: {
          initial: 'declarationLoiSurLEauAFaire',
          states: {
            declarationLoiSurLEauAFaire: {
              always: {
                target: 'declarationLoiSurLEauExemptee',
                cond: context => isNonMecanise(context.mecanisation) || (isMecanise(context.mecanisation) && !context.mecanisation.franchissementCoursEau) || isInconnu(context.mecanisation),
              },
              on: {
                REFUSER_RDE: {
                  target: 'declarationLoiSurLEauFaite',
                  cond: (_context, event) => (event.franchissements ?? 0) > 0,
                  actions: actionAccepterOuRefuserRDE,
                },
                ACCEPTER_RDE: {
                  target: 'declarationLoiSurLEauFaite',
                  cond: (_context, event) => (event.franchissements ?? 0) > 0,
                  actions: actionAccepterOuRefuserRDE,
                },
                DEMANDER_COMPLEMENTS_RDE: 'receptionDeComplementsAFaire',
              },
            },
            receptionDeComplementsAFaire: {
              on: {
                RECEVOIR_COMPLEMENTS_RDE: {
                  target: 'declarationLoiSurLEauAFaire',
                  actions: actionRecevoirComplementsRde,
                },
                REFUSER_RDE: {
                  target: 'declarationLoiSurLEauFaite',
                  cond: context => isMecanise(context.mecanisation) && context.mecanisation.franchissementCoursEau > 0,
                  actions: actionAccepterOuRefuserRDE,
                },
                ACCEPTER_RDE: {
                  target: 'declarationLoiSurLEauFaite',
                  cond: context => isMecanise(context.mecanisation) && context.mecanisation.franchissementCoursEau > 0,
                  actions: actionAccepterOuRefuserRDE,
                },
                DEMANDER_COMPLEMENTS_RDE: 'receptionDeComplementsAFaire',
              },
            },
            declarationLoiSurLEauExemptee: {
              always: {
                target: 'declarationLoiSurLEauAFaire',
                cond: context => isMecanise(context.mecanisation) && context.mecanisation.franchissementCoursEau > 0,
              },
              on: {
                DEMANDER_COMPLEMENTS_RDE: {
                  target: 'receptionDeComplementsAFaire',
                  cond: context => (context.demarcheStatut === DemarchesStatutsIds.Depose || context.demarcheStatut === DemarchesStatutsIds.EnInstruction) && isMecanise(context.mecanisation),
                },
                REFUSER_RDE: {
                  target: 'declarationLoiSurLEauFaite',
                  cond: (context, event) => (isInconnu(context.mecanisation) || isMecanise(context.mecanisation)) && (event.franchissements ?? 0) > 0,
                  actions: actionAccepterOuRefuserRDE,
                },
                ACCEPTER_RDE: {
                  target: 'declarationLoiSurLEauFaite',
                  cond: (context, event) => (isInconnu(context.mecanisation) || isMecanise(context.mecanisation)) && (event.franchissements ?? 0) > 0,
                  actions: actionAccepterOuRefuserRDE,
                },
              },
              type: 'final',
            },
            declarationLoiSurLEauFaite: { type: 'final' },
          },
        },
      },
    },
    saisineCommissionAutorisationsDeRecherchesMinieresAFaire: {
      on: {
        FAIRE_SAISINE_CARM: {
          target: 'avisCommissionAutorisationDeRecherchesMinieresAFaire',
          actions: assign<OctARMContext, { type: 'FAIRE_SAISINE_CARM' }>({
            visibilite: 'publique',
          }),
        },
        DEMANDER_COMPLEMENTS_RDE: {
          target: [
            'demandeEnConstructionOuDeposeeOuEnInstructionMachine.declarationLoiSurLEauMachine.receptionDeComplementsAFaire',
            'demandeEnConstructionOuDeposeeOuEnInstructionMachine.pasRdeMachine.avisONFRendu',
          ],
          cond: context => isMecanise(context.mecanisation) && !context.mecanisation.franchissementCoursEau,
        },
        REFUSER_RDE: {
          target: 'saisineCommissionAutorisationsDeRecherchesMinieresAFaire',
          cond: (context, event) => isMecanise(context.mecanisation) && !context.mecanisation.franchissementCoursEau && (event.franchissements ?? 0) > 0,
          actions: actionAccepterOuRefuserRDE,
        },
        ACCEPTER_RDE: {
          target: 'saisineCommissionAutorisationsDeRecherchesMinieresAFaire',
          cond: (context, event) => isMecanise(context.mecanisation) && !context.mecanisation.franchissementCoursEau && (event.franchissements ?? 0) > 0,
          actions: actionAccepterOuRefuserRDE,
        },
      },
    },
    avisCommissionAutorisationDeRecherchesMinieresAFaire: {
      on: {
        RENDRE_AVIS_FAVORABLE_CARM: [
          {
            target: 'signatureAutorisationDeRechercheMiniereAFaire',
            cond: context => isNonMecanise(context.mecanisation),
          },
          {
            target: 'notificationDuDemandeurFraisDeDossierComplementairesAFaire',
            cond: context => isMecanise(context.mecanisation),
          },
        ],
        RENDRE_AVIS_DEFAVORABLE_CARM: {
          target: 'notificationDuDemandeurAvisDefavorableCARMAFaire',
          actions: assign<OctARMContext, { type: 'RENDRE_AVIS_DEFAVORABLE_CARM' }>({
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
        },
        RENDRE_AVIS_AJOURNE_CARM: 'notificationDuDemandeurAvisAjourneCARMAFaire',
      },
    },
    notificationDuDemandeurAvisAjourneCARMAFaire: {
      on: { NOTIFIER_DEMANDEUR_AVIS_AJOURNE_CARM: 'saisineCARMAFaire' },
    },
    saisineCARMAFaire: {
      on: {
        DEMANDER_COMPLEMENT_SAISINE_CARM: 'receptionComplementSaisineCARMAFaire',
        FAIRE_SAISINE_CARM: 'avisCommissionAutorisationDeRecherchesMinieresAFaire',
      },
    },
    receptionComplementSaisineCARMAFaire: {
      on: {
        RECEVOIR_COMPLEMENT_SAISINE_CARM: 'saisineCARMAFaire',
        FAIRE_SAISINE_CARM: 'avisCommissionAutorisationDeRecherchesMinieresAFaire',
      },
    },
    notificationDuDemandeurAvisDefavorableCARMAFaire: {
      on: {
        NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM: {
          target: 'fini',
        },
      },
    },
    notificationDuDemandeurFraisDeDossierComplementairesAFaire: {
      on: {
        NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM: 'paiementDesFraisDeDossierComplementairesAFaire',
      },
    },
    paiementDesFraisDeDossierComplementairesAFaire: {
      on: {
        PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES: 'validationDuPaiementDesFraisDeDossierComplementairesAFaire',
      },
    },
    validationDuPaiementDesFraisDeDossierComplementairesAFaire: {
      tags: [tags.responsable['ope-onf-973-01']],
      id: 'validationDuPaiementDesFraisDeDossierComplementairesAFaire',
      on: {
        VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES: [
          {
            target: 'signatureAutorisationDeRechercheMiniereAFaire',
            actions: assign<OctARMContext, { type: 'VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES' }>({
              mecanisation: context => {
                if (!isMecanise(context.mecanisation)) {
                  throw new Error('cas impossible')
                }

                return {
                  ...context.mecanisation,
                  paiementFraisDossierComplementaireValide: true,
                }
              },
            }),
            cond: context => context.demarcheStatut !== DemarchesStatutsIds.Desiste && context.demarcheStatut !== DemarchesStatutsIds.ClasseSansSuite,
          },
          {
            target: '#fini',
            actions: assign<OctARMContext, { type: 'VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES' }>({
              mecanisation: context => {
                if (!isMecanise(context.mecanisation)) {
                  throw new Error('cas impossible')
                }

                return {
                  ...context.mecanisation,
                  paiementFraisDossierComplementaireValide: true,
                }
              },
            }),
            cond: context => context.demarcheStatut === DemarchesStatutsIds.Desiste || context.demarcheStatut === DemarchesStatutsIds.ClasseSansSuite,
          },
        ],
      },
    },
    signatureAutorisationDeRechercheMiniereAFaire: {
      on: {
        SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE: [
          {
            target: 'avenantARMAFaire',
            actions: assign<OctARMContext, { type: 'SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE' }>({
              demarcheStatut: DemarchesStatutsIds.Accepte,
            }),
            cond: context => isMecanise(context.mecanisation),
          },
          {
            target: 'notificationSignatureARMAFaire',
            actions: assign<OctARMContext, { type: 'SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE' }>({
              demarcheStatut: DemarchesStatutsIds.Accepte,
            }),
            cond: context => isNonMecanise(context.mecanisation),
          },
        ],
      },
    },
    notificationSignatureARMAFaire: {
      on: { NOTIFIER_DEMANDEUR_SIGNATURE_ARM: 'avenantARMAFaire' },
    },
    avenantARMAFaire: {
      on: { FAIRE_AVENANT_ARM: 'notificationAvenantARMAFaire' },
    },
    notificationAvenantARMAFaire: {
      on: { NOTIFIER_AVENANT_ARM: 'avenantARMAFaire' },
    },
    desistementDuDemandeurFait: {
      always: validationFraisApresDesistementOuClassementSansSuite,
    },
    decisionDeClassementSansSuiteFait: {
      on: {
        NOTIFIER_DEMANDEUR_CSS: {
          target: 'notificationDuDemandeurApresClassementSansSuiteFait',
        },
      },
    },
    notificationDuDemandeurApresClassementSansSuiteFait: {
      always: validationFraisApresDesistementOuClassementSansSuite,
    },

    fini: {
      id: 'fini',
      type: 'final',
    },
  },
})
