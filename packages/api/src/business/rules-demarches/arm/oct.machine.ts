import { assign, createMachine } from 'xstate'
import {
  DemarchesStatutsTypesIds,
  DemarcheStatutId,
  IContenu
} from '../../../types'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'

export const ETATS = {
  Demande: 'mfr',
  DepotDeLaDemande: 'mdp',
  PaiementDesFraisDeDossier: 'pfd',
  DecisionAutoriteEnvironnementale: 'dae',
  CompletudeDeLaDemande: 'mcp',
  Desistement: 'des',
  ModificationDeLaDemande: 'mod',
  ClassementSansSuite: 'css',
  DemandeDeComplementsDecisionAutoriteEnvironnementale: 'mcd',
  ReceptionDeComplementsDecisionAutoriteEnvironnementale: 'rcd',
  ModificationDeLaDemandeApresDecisionAutoriteEnvironnementale: 'mom',
  DemandeDeComplementsCompletude: 'mcm',
  ReceptionDeComplementsCompletude: 'rcm',
  ValidationDesFraisDossier: 'vfd',
  RecepisseDeDeclarationLoiSurLEau: 'rde',
  DemandeDeComplementsRecepisseDeDeclarationLoiSurLEau: 'mcb',
  ReceptionDeComplementsRecepisseDeDeclarationLoiSurLEau: 'rcb',
  NotificationCss: 'mnc',
  RecevabiliteDeLaDemande: 'mcr',
  ExpertiseONF: 'eof',
  AvisONF: 'aof',
  DemandeInformationAvisONF: 'mia',
  ReceptionInformationAvisONF: 'ria',
  SaisineCARM: 'sca',
  AvisCARM: 'aca',
  NotificationCARM: 'mnb',
  NotificationCARMDefavorable: 'mnd',
  NotificationCARMAjournee: 'mna',
  DemandeDeComplementsSaisineCARM: 'mcs',
  ReceptionComplementsSaisineCARM: 'rcs',
  PaiementDesFraisDeDossierComplementaires: 'pfc',
  ValidationDuPaiementDesFraisDeDossierComplementaires: 'vfc',
  SignatureAutorisationDeRechercheMiniere: 'sco',
  DemandeInformationRecevabiliteDeLaDemande: 'mim',
  ReceptionInformationRecevabiliteDeLaDemande: 'rim',
  DemandeDeComplementsRecevabiliteDeLaDemande: 'mca',
  ReceptionComplementsRecevabiliteDeLaDemande: 'rca',
  DemandeInformationExpertiseONF: 'mio',
  ReceptionInformationExpertiseONF: 'rio',
  ReceptionExpertiseServiceEau: 'ede',
  ReceptionExpertiseServiceMines: 'edm',
  NotificationSignatureARM: 'mns',
  AvenantARM: 'aco',
  NotificationAvenantARM: 'mnv'
} as const
export type Etat = typeof ETATS[keyof typeof ETATS]

const EtatsTrigrammes = Object.values(ETATS)

export const isEtat = (dbEtat: string): dbEtat is Etat => {
  return EtatsTrigrammes.includes(dbEtat)
}

export const STATUS = {
  FAIT: 'fai',
  DEPOSE: 'dep',
  EXEMPTE: 'exe',
  REQUIS: 'req',
  COMPLETE: 'com',
  INCOMPLETE: 'inc',
  FAVORABLE: 'fav',
  DEFAVORABLE: 'def',
  FAVORABLE_AVEC_RESERVE: 'fre',
  AJOURNE: 'ajo',
  EN_CONSTRUCTION: 'aco'
} as const
export type Status = typeof STATUS[keyof typeof STATUS]

const StatusTrigrammes = Object.values(STATUS)

export const isStatus = (status: string): status is Status => {
  return StatusTrigrammes.includes(status)
}

export interface Etape {
  typeId: Etat
  statutId: Status
  date: string
  contenu?: IContenu
}

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

export const isEvent = (event: string): event is Event => {
  return EVENTS.includes(event)
}

export const toPotentialXStateEvent = (event: Event): XStateEvent[] => {
  switch (event) {
    case 'FAIRE_DEMANDE': {
      return [
        { type: event, mecanise: false, franchissements: null },
        { type: event, mecanise: true, franchissements: null },
        { type: event, mecanise: true, franchissements: 0 },
        { type: event, mecanise: true, franchissements: 2 }
      ]
    }
    case 'ACCEPTER_RDE':
    case 'REFUSER_RDE':
    case 'RECEVOIR_COMPLEMENTS_RDE': {
      return [
        { type: event, franchissements: 0 },
        { type: event, franchissements: 3 }
      ]
    }
    default:
      // related to https://github.com/microsoft/TypeScript/issues/46497  https://github.com/microsoft/TypeScript/issues/40803 :(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return [{ type: event }]
  }
}

export type DBEtat = { etat: Etat; statut?: Status }
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
  DEMANDER_COMPLEMENTS_DAE: {
    etat: ETATS.DemandeDeComplementsDecisionAutoriteEnvironnementale
  },
  RECEVOIR_COMPLEMENTS_DAE: {
    etat: ETATS.ReceptionDeComplementsDecisionAutoriteEnvironnementale
  },
  MODIFIER_DEMANDE_APRES_DAE: {
    etat: ETATS.ModificationDeLaDemandeApresDecisionAutoriteEnvironnementale
  },
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
    etat: ETATS.NotificationCss
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
    etat: ETATS.AvisONF
  },
  DEMANDER_INFORMATION_AVIS_ONF: {
    etat: ETATS.DemandeInformationAvisONF
  },
  RECEVOIR_INFORMATION_AVIS_ONF: {
    etat: ETATS.ReceptionInformationAvisONF
  },
  FAIRE_SAISINE_CARM: {
    etat: ETATS.SaisineCARM
  },
  RENDRE_AVIS_FAVORABLE_CARM: {
    etat: ETATS.AvisCARM,
    statut: STATUS.FAVORABLE
  },
  RENDRE_AVIS_DEFAVORABLE_CARM: {
    etat: ETATS.AvisCARM,
    statut: STATUS.DEFAVORABLE
  },
  RENDRE_AVIS_AJOURNE_CARM: {
    etat: ETATS.AvisCARM,
    statut: STATUS.AJOURNE
  },
  NOTIFIER_DEMANDEUR_AVIS_AJOURNE_CARM: {
    etat: ETATS.NotificationCARMAjournee
  },
  DEMANDER_COMPLEMENT_SAISINE_CARM: {
    etat: ETATS.DemandeDeComplementsSaisineCARM
  },
  RECEVOIR_COMPLEMENT_SAISINE_CARM: {
    etat: ETATS.ReceptionComplementsSaisineCARM
  },
  NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM: {
    etat: ETATS.NotificationCARM
  },
  NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM: {
    etat: ETATS.NotificationCARMDefavorable
  },
  MODIFIER_DEMANDE: {
    etat: ETATS.ModificationDeLaDemande
  },
  PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES: {
    etat: ETATS.PaiementDesFraisDeDossierComplementaires
  },
  VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES: {
    etat: ETATS.ValidationDuPaiementDesFraisDeDossierComplementaires
  },
  SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE: {
    etat: ETATS.SignatureAutorisationDeRechercheMiniere
  },
  DEMANDER_INFORMATION_MCR: {
    etat: ETATS.DemandeInformationRecevabiliteDeLaDemande
  },
  RECEVOIR_INFORMATION_MCR: {
    etat: ETATS.ReceptionInformationRecevabiliteDeLaDemande
  },
  DEMANDER_COMPLEMENTS_MCR: {
    etat: ETATS.DemandeDeComplementsRecevabiliteDeLaDemande
  },
  RECEVOIR_COMPLEMENTS_MCR: {
    etat: ETATS.ReceptionComplementsRecevabiliteDeLaDemande
  },
  DEMANDER_INFORMATION_EXPERTISE_ONF: {
    etat: ETATS.DemandeInformationExpertiseONF
  },
  RECEVOIR_INFORMATION_EXPERTISE_ONF: {
    etat: ETATS.ReceptionInformationExpertiseONF
  },
  RECEVOIR_EXPERTISE_SERVICE_EAU: {
    etat: ETATS.ReceptionExpertiseServiceEau
  },
  RECEVOIR_EXPERTISE_SERVICE_MINES: {
    etat: ETATS.ReceptionExpertiseServiceMines
  },
  NOTIFIER_DEMANDEUR_SIGNATURE_ARM: {
    etat: ETATS.NotificationSignatureARM
  },
  FAIRE_AVENANT_ARM: {
    etat: ETATS.AvenantARM
  },
  NOTIFIER_AVENANT_ARM: {
    etat: ETATS.NotificationAvenantARM
  }
} as const

// Related to https://github.com/Microsoft/TypeScript/issues/12870
export const EVENTS = Object.keys(trad) as Array<
  Extract<keyof typeof trad, string>
>

export const eventToEtat = (event: Event): DBEtat => {
  return trad[event]
}

export const xStateEventToEtape = (event: XStateEvent): Omit<Etape, 'date'> => {
  const dbEtat = trad[event.type]
  let contenu
  switch (event.type) {
    case 'FAIRE_DEMANDE': {
      contenu = {
        arm: {
          mecanise: event.mecanise,
          franchissements: event.franchissements
        }
      }
      break
    }
    case 'ACCEPTER_RDE':
    case 'REFUSER_RDE':
    case 'RECEVOIR_COMPLEMENTS_RDE': {
      contenu = { arm: { franchissements: event.franchissements } }
    }
  }

  return { typeId: dbEtat.etat, statutId: dbEtat.statut ?? 'fai', contenu }
}

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

type MecanisationConnuMecanise = {
  mecanise: true
  paiementFraisDossierComplementaireValide: boolean
  franchissementCoursEau: number
}

type MecanisationConnuNonMecanise = { mecanise: false }
type MecanisationConnu =
  | MecanisationConnuMecanise
  | MecanisationConnuNonMecanise

type MecanisationInconnu = MecanisationConnu | 'inconnu'

export interface OctARMContext {
  mecanisation: MecanisationInconnu
  visibilite: 'confidentielle' | 'publique'
  expertiseONFFaite: boolean
  demarcheStatut: DemarcheStatutId
  paiementFraisDossierValide: boolean
}

const isConnu = (
  mecanisation: MecanisationInconnu
): mecanisation is MecanisationConnu => {
  return mecanisation !== 'inconnu'
}
const isInconnu = (
  mecanisation: MecanisationInconnu
): mecanisation is MecanisationInconnu => {
  return !isConnu(mecanisation)
}

const isMecanise = (
  mecanisation: MecanisationInconnu
): mecanisation is MecanisationConnuMecanise => {
  return isConnu(mecanisation) && mecanisation.mecanise
}
const isNonMecanise = (
  mecanisation: MecanisationInconnu
): mecanisation is MecanisationConnuNonMecanise => {
  return isConnu(mecanisation) && !mecanisation.mecanise
}
const mustPayerFraisDossierComplementaire = (
  mecanisation: MecanisationInconnu
): boolean => {
  return (
    isMecanise(mecanisation) &&
    !mecanisation.paiementFraisDossierComplementaireValide
  )
}

const fraisDeDossierComplementairesPayeOuExempte = (
  mecanisation: MecanisationInconnu
): boolean => {
  return (
    isConnu(mecanisation) &&
    (!mecanisation.mecanise ||
      mecanisation.paiementFraisDossierComplementaireValide)
  )
}

const validationFraisApresDesistementOuClassementSansSuite = [
  {
    target:
      'demandeEnConstructionOuDeposeeOuEnInstruction.pasRde.validationDesFraisDossier',
    cond: (context: OctARMContext) => {
      return !context.paiementFraisDossierValide
    }
  },
  {
    target: 'validationDuPaiementDesFraisDeDossierComplementaires',
    cond: (context: OctARMContext) => {
      return (
        context.paiementFraisDossierValide &&
        mustPayerFraisDossierComplementaire(context.mecanisation)
      )
    }
  },
  {
    target: 'fini',
    cond: (context: OctARMContext) => {
      return (
        context.paiementFraisDossierValide &&
        fraisDeDossierComplementairesPayeOuExempte(context.mecanisation)
      )
    }
  }
]

const actionMecanisation = assign<OctARMContext>({
  mecanisation: context => {
    if (isMecanise(context.mecanisation)) {
      return context.mecanisation
    }

    return {
      mecanise: true,
      paiementFraisDossierComplementaireValide: false,
      franchissementCoursEau: 0
    }
  }
})

export const tags = {
  responsable: {
    [ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE']]: 'responsablePTMG',
    [ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']]: 'responsableONF'
  }
} as const

const actionAccepterOuRefuserRDE = assign<
  OctARMContext,
  AccepterRDE | RefuserRDE
>({
  mecanisation: (context, event) => {
    if (event.franchissements === null || event.franchissements < 1) {
      throw new Error('cas impossible')
    }
    if (isMecanise(context.mecanisation)) {
      return {
        ...context.mecanisation,
        franchissementCoursEau: event.franchissements
      }
    }

    return {
      mecanise: true,
      paiementFraisDossierComplementaireValide: false,
      franchissementCoursEau: event.franchissements
    }
  }
})

const actionRecevoirComplementsRde = assign<
  OctARMContext,
  RecevoirComplementsRde
>({
  mecanisation: (context, event) => {
    if (event.franchissements === null) {
      throw new Error('cas impossible')
    }
    if (isMecanise(context.mecanisation)) {
      return {
        ...context.mecanisation,
        franchissementCoursEau: event.franchissements
      }
    }

    return {
      mecanise: true,
      paiementFraisDossierComplementaireValide: false,
      franchissementCoursEau: event.franchissements
    }
  }
})

export const armOctMachine = createMachine<OctARMContext, XStateEvent>({
  id: 'oct',
  initial: 'demandeEnConstructionOuDeposeeOuEnInstruction',
  context: {
    mecanisation: 'inconnu',
    expertiseONFFaite: false,
    visibilite: 'confidentielle',
    demarcheStatut: DemarchesStatutsTypesIds.EnConstruction,
    paiementFraisDossierValide: false
  },
  on: {
    MODIFIER_DEMANDE: {
      actions: () => ({}),
      cond: context =>
        context.demarcheStatut === DemarchesStatutsTypesIds.EnInstruction &&
        context.visibilite === 'confidentielle'
    },
    DESISTER_PAR_LE_DEMANDEUR: {
      target: 'desistementDuDemandeur',
      cond: context =>
        context.demarcheStatut === DemarchesStatutsTypesIds.EnInstruction,
      actions: assign<OctARMContext, { type: 'DESISTER_PAR_LE_DEMANDEUR' }>({
        demarcheStatut: DemarchesStatutsTypesIds.Desiste
      })
    },
    CLASSER_SANS_SUITE: {
      target: 'decisionDeClassementSansSuite',
      cond: context =>
        context.demarcheStatut === DemarchesStatutsTypesIds.EnInstruction,
      actions: assign<OctARMContext, { type: 'CLASSER_SANS_SUITE' }>({
        demarcheStatut: DemarchesStatutsTypesIds.ClasseSansSuite
      })
    }
  },
  states: {
    demandeEnConstructionOuDeposeeOuEnInstruction: {
      type: 'parallel',
      onDone: {
        target: 'saisineCommissionAutorisationsDeRecherchesMinieres'
      },
      states: {
        pasRde: {
          initial: 'demandeEnConstructionOuDeposee',
          states: {
            demandeEnConstructionOuDeposee: {
              type: 'parallel',
              states: {
                demande: {
                  initial: 'demandeEnConstruction',
                  states: {
                    demandeEnConstruction: {
                      on: {
                        FAIRE_DEMANDE: {
                          target: 'demandeFaite',
                          actions: assign<OctARMContext, FaireDemandeEvent>({
                            mecanisation: (context, event) => {
                              if (
                                isMecanise(context.mecanisation) &&
                                context.mecanisation.franchissementCoursEau >
                                  0 &&
                                (event.franchissements === null ||
                                  event.franchissements === 0)
                              ) {
                                throw new Error(
                                  "pas le droit d'avoir pas de franchissements alors qu'une rde a été faite"
                                )
                              } else {
                                return event.mecanise
                                  ? {
                                      mecanise: true,
                                      paiementFraisDossierComplementaireValide:
                                        false,
                                      franchissementCoursEau:
                                        event.franchissements ?? 0
                                    }
                                  : { mecanise: false }
                              }
                            }
                          }),
                          cond: (context, event) => {
                            if (
                              isMecanise(context.mecanisation) &&
                              !event.mecanise
                            ) {
                              return false
                            }

                            if (!event.mecanise && event.franchissements) {
                              return false
                            }

                            if (
                              isMecanise(context.mecanisation) &&
                              context.mecanisation.franchissementCoursEau > 0 &&
                              (event.franchissements === null ||
                                event.franchissements === 0)
                            ) {
                              return false
                            }

                            return true
                          }
                        }
                      }
                    },
                    demandeFaite: {
                      on: {
                        DEPOSER_DEMANDE: {
                          target: 'demandeDeposee',
                          actions: assign<
                            OctARMContext,
                            { type: 'DEPOSER_DEMANDE' }
                          >({
                            demarcheStatut:
                              DemarchesStatutsTypesIds.EnInstruction
                          })
                        }
                      }
                    },
                    demandeDeposee: {
                      type: 'final'
                    }
                  }
                },
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
                decisionAutoriteEnvironnementale: {
                  initial: 'enCours',
                  states: {
                    enCours: {
                      always: {
                        target: 'exemptee',
                        cond: context => isNonMecanise(context.mecanisation)
                      },
                      on: {
                        DEMANDER_MODIFICATION_DE_LA_DEMANDE: {
                          target: 'modificationDeLaDemande',
                          actions: actionMecanisation
                        },
                        EXEMPTER_DAE: {
                          target: 'exemptee',
                          actions: actionMecanisation
                        },
                        DEMANDER_COMPLEMENTS_DAE: {
                          target: 'demandeDeComplements',
                          cond: context =>
                            context.demarcheStatut !==
                            DemarchesStatutsTypesIds.EnConstruction
                        }
                      }
                    },
                    demandeDeComplements: {
                      on: {
                        RECEVOIR_COMPLEMENTS_DAE: 'enCours',
                        EXEMPTER_DAE: {
                          target: 'exemptee',
                          actions: actionMecanisation
                        },
                        DEMANDER_MODIFICATION_DE_LA_DEMANDE: {
                          target: 'modificationDeLaDemande',
                          actions: actionMecanisation
                        }
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
              },
              tags: [tags.responsable['ope-ptmg-973-01']]
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
              tags: [tags.responsable['ope-onf-973-01']],
              on: {
                VALIDER_FRAIS_DE_DOSSIER: [
                  {
                    target: 'recevabiliteDeLaDemande',
                    actions: assign<
                      OctARMContext,
                      { type: 'VALIDER_FRAIS_DE_DOSSIER' }
                    >({
                      paiementFraisDossierValide: true
                    }),
                    cond: context =>
                      context.demarcheStatut !==
                        DemarchesStatutsTypesIds.Desiste &&
                      context.demarcheStatut !==
                        DemarchesStatutsTypesIds.ClasseSansSuite
                  },
                  {
                    target: '#fini',
                    cond: context =>
                      (context.demarcheStatut ===
                        DemarchesStatutsTypesIds.Desiste ||
                        context.demarcheStatut ===
                          DemarchesStatutsTypesIds.ClasseSansSuite) &&
                      isNonMecanise(context.mecanisation)
                  },
                  {
                    target:
                      '#validationDuPaiementDesFraisDeDossierComplementaires',
                    cond: context =>
                      (context.demarcheStatut ===
                        DemarchesStatutsTypesIds.Desiste ||
                        context.demarcheStatut ===
                          DemarchesStatutsTypesIds.ClasseSansSuite) &&
                      mustPayerFraisDossierComplementaire(context.mecanisation)
                  }
                ]
              }
            },
            recevabiliteDeLaDemande: {
              tags: [tags.responsable['ope-onf-973-01']],
              on: {
                DEMANDER_INFORMATION_MCR:
                  'demandeInformationPourLaRecevabilite',
                DEMANDER_COMPLEMENTS_MCR:
                  'demandeComplementsPourLaRecevabilite',
                DECLARER_DEMANDE_FAVORABLE: 'expertises',
                DECLARER_DEMANDE_DEFAVORABLE: 'recevabiliteDefavorable'
              }
            },
            demandeInformationPourLaRecevabilite: {
              on: {
                RECEVOIR_INFORMATION_MCR: 'recevabiliteDeLaDemande',
                DECLARER_DEMANDE_FAVORABLE: 'expertises',
                DECLARER_DEMANDE_DEFAVORABLE: 'recevabiliteDefavorable'
              }
            },
            demandeComplementsPourLaRecevabilite: {
              on: {
                RECEVOIR_COMPLEMENTS_MCR: 'recevabiliteDeLaDemande',
                DECLARER_DEMANDE_FAVORABLE: 'expertises',
                DECLARER_DEMANDE_DEFAVORABLE: 'recevabiliteDefavorable'
              }
            },
            expertises: {
              type: 'parallel',
              states: {
                expertiseONF: {
                  initial: 'enCours',
                  states: {
                    enCours: {
                      on: {
                        DEMANDER_INFORMATION_EXPERTISE_ONF:
                          'demandeInformationONF',
                        FAIRE_EXPERTISE_ONF: 'expertiseONFFaite'
                      }
                    },
                    demandeInformationONF: {
                      on: {
                        FAIRE_EXPERTISE_ONF: 'expertiseONFFaite',
                        RECEVOIR_INFORMATION_EXPERTISE_ONF: 'enCours'
                      }
                    },
                    expertiseONFFaite: {
                      on: {
                        DEMANDER_INFORMATION_AVIS_ONF:
                          'demandeInformationAvisONF'
                      },
                      entry: assign<OctARMContext>({ expertiseONFFaite: true })
                    },
                    demandeInformationAvisONF: {
                      on: {
                        RECEVOIR_INFORMATION_AVIS_ONF: 'expertiseONFFaite'
                      }
                    }
                  }
                },
                expertiseServiceEau: {
                  initial: 'enCours',
                  states: {
                    enCours: {
                      on: {
                        RECEVOIR_EXPERTISE_SERVICE_EAU: 'edeFait'
                      }
                    },
                    edeFait: {
                      type: 'final'
                    }
                  }
                },
                expertiseServiceMines: {
                  initial: 'enCours',
                  states: {
                    enCours: {
                      on: {
                        RECEVOIR_EXPERTISE_SERVICE_MINES: 'edmFait'
                      }
                    },
                    edmFait: { type: 'final' }
                  }
                }
              },
              on: {
                RENDRE_AVIS_ONF: {
                  target: 'avisONFRendu',
                  cond: context => context.expertiseONFFaite
                }
              }
            },
            recevabiliteDefavorable: {
              on: {
                RENDRE_AVIS_ONF: 'avisONFRendu'
              }
            },
            avisONFRendu: { type: 'final' }
          }
        },
        declarationLoiSurLEau: {
          initial: 'enCours',
          states: {
            enCours: {
              always: {
                target: 'exemptee',
                cond: context =>
                  isNonMecanise(context.mecanisation) ||
                  (isMecanise(context.mecanisation) &&
                    !context.mecanisation.franchissementCoursEau) ||
                  isInconnu(context.mecanisation)
              },
              on: {
                REFUSER_RDE: {
                  target: 'faite',
                  cond: (context, event) => (event.franchissements ?? 0) > 0,
                  actions: actionAccepterOuRefuserRDE
                },
                ACCEPTER_RDE: {
                  target: 'faite',
                  cond: (context, event) => (event.franchissements ?? 0) > 0,
                  actions: actionAccepterOuRefuserRDE
                },
                DEMANDER_COMPLEMENTS_RDE: 'demandeDeComplements'
              }
            },
            demandeDeComplements: {
              on: {
                RECEVOIR_COMPLEMENTS_RDE: {
                  target: 'enCours',
                  actions: actionRecevoirComplementsRde
                },
                REFUSER_RDE: {
                  target: 'faite',
                  cond: context =>
                    isMecanise(context.mecanisation) &&
                    context.mecanisation.franchissementCoursEau > 0,
                  actions: actionAccepterOuRefuserRDE
                },
                ACCEPTER_RDE: {
                  target: 'faite',
                  cond: context =>
                    isMecanise(context.mecanisation) &&
                    context.mecanisation.franchissementCoursEau > 0,
                  actions: actionAccepterOuRefuserRDE
                },
                DEMANDER_COMPLEMENTS_RDE: 'demandeDeComplements'
              }
            },
            exemptee: {
              always: {
                target: 'enCours',
                cond: context =>
                  isMecanise(context.mecanisation) &&
                  context.mecanisation.franchissementCoursEau > 0
              },
              on: {
                DEMANDER_COMPLEMENTS_RDE: {
                  target: 'demandeDeComplements',
                  cond: context =>
                    (context.demarcheStatut ===
                      DemarchesStatutsTypesIds.Depose ||
                      context.demarcheStatut ===
                        DemarchesStatutsTypesIds.EnInstruction) &&
                    isMecanise(context.mecanisation)
                },
                REFUSER_RDE: {
                  target: 'faite',
                  cond: (context, event) =>
                    (isInconnu(context.mecanisation) ||
                      isMecanise(context.mecanisation)) &&
                    (event.franchissements ?? 0) > 0,
                  actions: actionAccepterOuRefuserRDE
                },
                ACCEPTER_RDE: {
                  target: 'faite',
                  cond: (context, event) =>
                    (isInconnu(context.mecanisation) ||
                      isMecanise(context.mecanisation)) &&
                    (event.franchissements ?? 0) > 0,
                  actions: actionAccepterOuRefuserRDE
                }
              },
              type: 'final'
            },
            faite: { type: 'final' }
          }
        }
      }
    },
    saisineCommissionAutorisationsDeRecherchesMinieres: {
      on: {
        FAIRE_SAISINE_CARM: {
          target: 'avisCommissionAutorisationDeRecherchesMinieres',
          actions: assign<OctARMContext, { type: 'FAIRE_SAISINE_CARM' }>({
            visibilite: 'publique'
          })
        },
        DEMANDER_COMPLEMENTS_RDE: {
          target: [
            'demandeEnConstructionOuDeposeeOuEnInstruction.declarationLoiSurLEau.demandeDeComplements',
            'demandeEnConstructionOuDeposeeOuEnInstruction.pasRde.avisONFRendu'
          ],
          cond: context =>
            isMecanise(context.mecanisation) &&
            !context.mecanisation.franchissementCoursEau
        },
        REFUSER_RDE: {
          target: 'saisineCommissionAutorisationsDeRecherchesMinieres',
          cond: (context, event) =>
            isMecanise(context.mecanisation) &&
            !context.mecanisation.franchissementCoursEau &&
            (event.franchissements ?? 0) > 0,
          actions: actionAccepterOuRefuserRDE
        },
        ACCEPTER_RDE: {
          target: 'saisineCommissionAutorisationsDeRecherchesMinieres',
          cond: (context, event) =>
            isMecanise(context.mecanisation) &&
            !context.mecanisation.franchissementCoursEau &&
            (event.franchissements ?? 0) > 0,
          actions: actionAccepterOuRefuserRDE
        }
      }
    },
    avisCommissionAutorisationDeRecherchesMinieres: {
      on: {
        RENDRE_AVIS_FAVORABLE_CARM: [
          {
            target: 'signatureAutorisationDeRechercheMiniere',
            cond: context => isNonMecanise(context.mecanisation)
          },
          {
            target: 'notificationDuDemandeurFraisDeDossierComplementaires',
            cond: context => isMecanise(context.mecanisation)
          }
        ],
        RENDRE_AVIS_DEFAVORABLE_CARM: {
          target: 'notificationDuDemandeurAvisDefavorableCARM',
          actions: assign<
            OctARMContext,
            { type: 'RENDRE_AVIS_DEFAVORABLE_CARM' }
          >({
            demarcheStatut: DemarchesStatutsTypesIds.Rejete
          })
        },
        RENDRE_AVIS_AJOURNE_CARM: 'notificationDuDemandeurAvisAjourneCARM'
      }
    },
    notificationDuDemandeurAvisAjourneCARM: {
      on: { NOTIFIER_DEMANDEUR_AVIS_AJOURNE_CARM: 'saisineCARMEnAttente' }
    },
    saisineCARMEnAttente: {
      on: {
        DEMANDER_COMPLEMENT_SAISINE_CARM: 'demandeComplementSaisineCARM',
        FAIRE_SAISINE_CARM: 'avisCommissionAutorisationDeRecherchesMinieres'
      }
    },
    demandeComplementSaisineCARM: {
      on: {
        RECEVOIR_COMPLEMENT_SAISINE_CARM: 'saisineCARMEnAttente',
        FAIRE_SAISINE_CARM: 'avisCommissionAutorisationDeRecherchesMinieres'
      }
    },
    notificationDuDemandeurAvisDefavorableCARM: {
      on: {
        NOTIFIER_DEMANDEUR_AVIS_DEFAVORABLE_CARM: {
          target: 'fini'
        }
      }
    },
    notificationDuDemandeurFraisDeDossierComplementaires: {
      on: {
        NOTIFIER_DEMANDEUR_AVIS_FAVORABLE_CARM:
          'paiementDesFraisDeDossierComplementaires'
      }
    },
    paiementDesFraisDeDossierComplementaires: {
      on: {
        PAYER_FRAIS_DE_DOSSIER_COMPLEMENTAIRES:
          'validationDuPaiementDesFraisDeDossierComplementaires'
      }
    },
    validationDuPaiementDesFraisDeDossierComplementaires: {
      tags: [tags.responsable['ope-onf-973-01']],
      id: 'validationDuPaiementDesFraisDeDossierComplementaires',
      on: {
        VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES: [
          {
            target: 'signatureAutorisationDeRechercheMiniere',
            actions: assign<
              OctARMContext,
              { type: 'VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES' }
            >({
              mecanisation: context => {
                if (!isMecanise(context.mecanisation)) {
                  throw new Error('cas impossible')
                }

                return {
                  ...context.mecanisation,
                  paiementFraisDossierComplementaireValide: true
                }
              }
            }),
            cond: context =>
              context.demarcheStatut !== DemarchesStatutsTypesIds.Desiste &&
              context.demarcheStatut !==
                DemarchesStatutsTypesIds.ClasseSansSuite
          },
          {
            target: '#fini',
            actions: assign<
              OctARMContext,
              { type: 'VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES' }
            >({
              mecanisation: context => {
                if (!isMecanise(context.mecanisation)) {
                  throw new Error('cas impossible')
                }

                return {
                  ...context.mecanisation,
                  paiementFraisDossierComplementaireValide: true
                }
              }
            }),
            cond: context =>
              context.demarcheStatut === DemarchesStatutsTypesIds.Desiste ||
              context.demarcheStatut ===
                DemarchesStatutsTypesIds.ClasseSansSuite
          }
        ]
      }
    },
    signatureAutorisationDeRechercheMiniere: {
      on: {
        SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE: [
          {
            target: 'avenantARM',
            actions: assign<
              OctARMContext,
              { type: 'SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE' }
            >({
              demarcheStatut: DemarchesStatutsTypesIds.Accepte
            }),
            cond: context => isMecanise(context.mecanisation)
          },
          {
            target: 'notificationSignatureARM',
            actions: assign<
              OctARMContext,
              { type: 'SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE' }
            >({
              demarcheStatut: DemarchesStatutsTypesIds.Accepte
            }),
            cond: context => isNonMecanise(context.mecanisation)
          }
        ]
      }
    },
    notificationSignatureARM: {
      on: { NOTIFIER_DEMANDEUR_SIGNATURE_ARM: 'avenantARM' }
    },
    avenantARM: {
      on: { FAIRE_AVENANT_ARM: 'notificationAvenantARM' }
    },
    notificationAvenantARM: {
      on: { NOTIFIER_AVENANT_ARM: 'avenantARM' }
    },
    desistementDuDemandeur: {
      always: validationFraisApresDesistementOuClassementSansSuite
    },
    decisionDeClassementSansSuite: {
      on: {
        NOTIFIER_DEMANDEUR_CSS: {
          target: 'notificationDuDemandeurApresClassementSansSuite'
        }
      }
    },
    notificationDuDemandeurApresClassementSansSuite: {
      always: validationFraisApresDesistementOuClassementSansSuite
    },

    fini: {
      id: 'fini',
      type: 'final'
    }
  }
})
