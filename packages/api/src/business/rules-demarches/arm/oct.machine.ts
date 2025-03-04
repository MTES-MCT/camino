import { assign, setup } from 'xstate'
import { IContenu } from '../../../types'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { CaminoMachine } from '../machine-helper'
import { CaminoCommonContext, CaminoMachineDateFin, CaminoMachineDateFinInfini, DBEtat, demarcheDateMiseAJourTous, Etape, getDemarcheDateFin, globalGuards, tags } from '../machine-common'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { CaminoDate, dateAddMonths } from 'camino-common/src/date'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
// FIXME gérer les dates de fin pour les avenants
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

type SignerAutorisationDeRechercheMiniere = {
  type: 'SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE'
  date: CaminoDate
  dateDebut: CaminoDate | null
  dateFin: CaminoDate | null
  duree: number | null
}
type FaireAvenantArm = {
  type: 'FAIRE_AVENANT_ARM'
  date: CaminoDate
  dateDebut: CaminoDate | null
  dateFin: CaminoDate | null
  duree: number | null
}

type DemanderModificationDeLaDemande = { type: 'DEMANDER_MODIFICATION_DE_LA_DEMANDE' }
type XStateEvent =
  | { type: 'ENREGISTRER_DEMANDE' }
  | { type: 'DESISTER_PAR_LE_DEMANDEUR' }
  | { type: 'CLASSER_SANS_SUITE' }
  | FaireDemandeEvent
  | { type: 'PAYER_FRAIS_DE_DOSSIER' }
  | DemanderModificationDeLaDemande
  | { type: 'MODIFIER_DEMANDE' }
  | { type: 'EXEMPTER_DAE' }
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
  | { type: 'RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES' }
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
  | SignerAutorisationDeRechercheMiniere
  | { type: 'DEMANDER_INFORMATION_MCR' }
  | { type: 'RECEVOIR_INFORMATION_MCR' }
  | { type: 'DEMANDER_COMPLEMENTS_MCR' }
  | { type: 'RECEVOIR_COMPLEMENTS_MCR' }
  | { type: 'RECEVOIR_EXPERTISE' }
  | { type: 'NOTIFIER_DEMANDEUR_SIGNATURE_ARM' }
  | FaireAvenantArm
  | { type: 'NOTIFIER_AVENANT_ARM' }

type Event = XStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: EtapesTypesEtapesStatuts.demande, mainStep: true },
  ENREGISTRER_DEMANDE: { db: EtapesTypesEtapesStatuts.enregistrementDeLaDemande, mainStep: true },
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
  RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES: { db: EtapesTypesEtapesStatuts.avisDesServicesEtCommissionsConsultatives, mainStep: true },
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
  RECEVOIR_INFORMATION_MCR: { db: EtapesTypesEtapesStatuts.receptionDinformation, mainStep: false },
  DEMANDER_COMPLEMENTS_MCR: { db: EtapesTypesEtapesStatuts.demandeDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  RECEVOIR_COMPLEMENTS_MCR: { db: EtapesTypesEtapesStatuts.receptionDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  RECEVOIR_EXPERTISE: { db: EtapesTypesEtapesStatuts.expertises, mainStep: false },
  NOTIFIER_DEMANDEUR_SIGNATURE_ARM: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_SignatureDeLautorisationDeRechercheMiniere_, mainStep: true },
  FAIRE_AVENANT_ARM: { db: EtapesTypesEtapesStatuts.avenantALautorisationDeRechercheMiniere, mainStep: false },
  NOTIFIER_AVENANT_ARM: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_, mainStep: false },
} as const

export class ArmOctMachine extends CaminoMachine<OctARMContext, XStateEvent> {
  constructor(titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) {
    super(armOctMachine(titreTypeId, demarcheTypeId), trad)
  }

  override caminoXStateEventToEtapes(event: XStateEvent): (Omit<Etape, 'date' | 'titreTypeId' | 'demarcheTypeId'> & { mainStep: boolean; type: XStateEvent['type'] })[] {
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
      mainStep: trad[event.type].mainStep,
      type: event.type,
    }))
  }

  override eventFromEntry(eventFromEntry: XStateEvent['type'], etape: Etape): XStateEvent {
    switch (eventFromEntry) {
      case 'FAIRE_DEMANDE': {
        let mecanise = false
        let franchissements = null
        if (typeof etape.contenu?.arm?.mecanise === 'boolean') {
          mecanise = etape.contenu.arm.mecanise
        }
        if (typeof etape.contenu?.arm?.franchissements === 'number') {
          franchissements = etape.contenu.arm.franchissements
        }

        return { type: eventFromEntry, mecanise, franchissements }
      }
      case 'FAIRE_AVENANT_ARM':
      case 'SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE':
        return { type: eventFromEntry, date: etape.date, dateDebut: etape.dateDebut ?? null, dateFin: etape.dateFin ?? null, duree: etape.duree ?? null }
      case 'ACCEPTER_RDE':
      case 'REFUSER_RDE':
      case 'RECEVOIR_COMPLEMENTS_RDE': {
        let franchissements = null
        if (typeof etape.contenu?.arm?.franchissements === 'number') {
          franchissements = etape.contenu.arm.franchissements
        }

        return { type: eventFromEntry, franchissements }
      }
      default:
        return super.eventFromEntry(eventFromEntry, etape)
    }
  }

  override toPotentialCaminoXStateEvent(event: XStateEvent['type'], _date: CaminoDate): XStateEvent[] {
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

interface OctARMContext extends CaminoCommonContext {
  mecanisation: MecanisationInconnu
  avisDesServicesEtCommissionsConsultativesFait: boolean
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
    guard: ({ context }: { context: OctARMContext }) => {
      return !context.paiementFraisDossierValide
    },
  },
  {
    target: 'validationDuPaiementDesFraisDeDossierComplementairesAFaire',
    guard: ({ context }: { context: OctARMContext }) => {
      return context.paiementFraisDossierValide && mustPayerFraisDossierComplementaire(context.mecanisation)
    },
  },
  {
    target: 'fini',
    guard: ({ context }: { context: OctARMContext }) => {
      return context.paiementFraisDossierValide && fraisDeDossierComplementairesPayeOuExempte(context.mecanisation)
    },
  },
]

const armOctMachine = (_titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) =>
  setup({
    types: {} as { context: OctARMContext; events: XStateEvent },
    guards: { ...globalGuards },
    actions: {
      actionAccepterOuRefuserRDE: assign({
        mecanisation: ({ context, event }) => {
          if (event.type !== 'ACCEPTER_RDE' && event.type !== 'REFUSER_RDE') {
            throw new Error(`Cette action ne peut être appelée que pour 'ACCEPTER_RDE' ou 'REFUSER_RDE', ${event.type}`)
          }
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
      }),
      actionMecanisation: assign({
        mecanisation: ({ context }) => {
          if (isMecanise(context.mecanisation)) {
            return context.mecanisation
          }

          return {
            mecanise: true,
            paiementFraisDossierComplementaireValide: false,
            franchissementCoursEau: 0,
          }
        },
      }),
      recevoirComplementsRde: assign({
        mecanisation: ({ context, event }) => {
          if (event.type !== 'RECEVOIR_COMPLEMENTS_RDE') {
            throw new Error(`Cette action ne peut être appelée que pour 'RECEVOIR_COMPLEMENTS_RDE', ${event.type}`)
          }
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
      }),
    },
  }).createMachine({
    id: 'octArm',
    initial: 'demandeEnConstructionOuDeposeeOuEnInstructionMachine',
    context: {
      mecanisation: 'inconnu',
      visibilite: 'confidentielle',
      demarcheDates: {
        debut: { dateDebut: null, dateEtape: null },
        fin: { dateFin: null, duree: null },
        effet: null,
      },
      avisDesServicesEtCommissionsConsultativesFait: false,
      demarcheStatut: DemarchesStatutsIds.EnConstruction,
      demarcheTypeId,
      paiementFraisDossierValide: false,
    },
    on: {
      MODIFIER_DEMANDE: {
        actions: () => ({}),
        guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction && context.visibilite === 'confidentielle',
      },
      DESISTER_PAR_LE_DEMANDEUR: {
        target: '.desistementDuDemandeurFait',
        guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
        actions: assign({
          demarcheStatut: DemarchesStatutsIds.Desiste,
          visibilite: 'publique',
        }),
      },
      CLASSER_SANS_SUITE: {
        target: '.decisionDeClassementSansSuiteFait',
        guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
        actions: assign({
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
                            target: 'demandeAEnregistrer',
                            actions: assign({
                              mecanisation: ({ context, event }): MecanisationInconnu => {
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
                            guard: ({ context, event }) => {
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
                      demandeAEnregistrer: {
                        on: {
                          ENREGISTRER_DEMANDE: {
                            target: 'demandeEnregistree',
                            actions: assign({
                              demarcheStatut: DemarchesStatutsIds.EnInstruction,
                            }),
                          },
                        },
                      },
                      demandeEnregistree: {
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
                          guard: ({ context }) => isNonMecanise(context.mecanisation),
                        },
                        on: {
                          DEMANDER_MODIFICATION_DE_LA_DEMANDE: {
                            target: 'modificationDeLaDemandeAFaire',
                            actions: 'actionMecanisation',
                          },
                          EXEMPTER_DAE: {
                            target: 'decisionAutoriteEnvironnementaleExemptee',
                            actions: 'actionMecanisation',
                          },
                          DEMANDER_COMPLEMENTS_DAE: {
                            target: 'recevoirComplementDAEAFaire',
                            guard: ({ context }) => context.demarcheStatut !== DemarchesStatutsIds.EnConstruction,
                          },
                        },
                      },
                      recevoirComplementDAEAFaire: {
                        on: {
                          RECEVOIR_COMPLEMENTS_DAE: 'decisionAutoriteEnvironnementaleAFaire',
                          EXEMPTER_DAE: {
                            target: 'decisionAutoriteEnvironnementaleExemptee',
                            actions: 'actionMecanisation',
                          },
                          DEMANDER_MODIFICATION_DE_LA_DEMANDE: {
                            target: 'modificationDeLaDemandeAFaire',
                            actions: 'actionMecanisation',
                          },
                        },
                      },
                      modificationDeLaDemandeAFaire: {
                        on: {
                          MODIFIER_DEMANDE: 'modificationDeLaDemandeFaite',
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
                tags: [tags.responsable['dea-guyane-01']],
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
                tags: [tags.responsable['dea-guyane-01']],
                on: {
                  VALIDER_FRAIS_DE_DOSSIER: [
                    {
                      target: 'recevabiliteDeLaDemandeAFaire',
                      actions: assign({
                        paiementFraisDossierValide: true,
                      }),
                      guard: ({ context }) => context.demarcheStatut !== DemarchesStatutsIds.Desiste && context.demarcheStatut !== DemarchesStatutsIds.ClasseSansSuite,
                    },
                    {
                      target: '#fini',
                      guard: ({ context }) =>
                        (context.demarcheStatut === DemarchesStatutsIds.Desiste || context.demarcheStatut === DemarchesStatutsIds.ClasseSansSuite) && isNonMecanise(context.mecanisation),
                    },
                    {
                      target: '#validationDuPaiementDesFraisDeDossierComplementairesAFaire',
                      guard: ({ context }) =>
                        (context.demarcheStatut === DemarchesStatutsIds.Desiste || context.demarcheStatut === DemarchesStatutsIds.ClasseSansSuite) &&
                        mustPayerFraisDossierComplementaire(context.mecanisation),
                    },
                  ],
                },
              },
              recevabiliteDeLaDemandeAFaire: {
                tags: [tags.responsable['dea-guyane-01']],
                on: {
                  DEMANDER_INFORMATION_MCR: 'receptionInformationPourLaRecevabiliteAFaire',
                  DEMANDER_COMPLEMENTS_MCR: 'receptionComplementsPourLaRecevabiliteAFaire',
                  DECLARER_DEMANDE_FAVORABLE: 'expertisesMachine',
                  DECLARER_DEMANDE_DEFAVORABLE: 'avisDesServicesEtCommissionsConsultativesARendre',
                },
              },
              receptionInformationPourLaRecevabiliteAFaire: {
                on: {
                  RECEVOIR_INFORMATION_MCR: 'recevabiliteDeLaDemandeAFaire',
                  DECLARER_DEMANDE_FAVORABLE: 'expertisesMachine',
                  DECLARER_DEMANDE_DEFAVORABLE: 'avisDesServicesEtCommissionsConsultativesARendre',
                },
              },
              receptionComplementsPourLaRecevabiliteAFaire: {
                on: {
                  RECEVOIR_COMPLEMENTS_MCR: 'recevabiliteDeLaDemandeAFaire',
                  DECLARER_DEMANDE_FAVORABLE: 'expertisesMachine',
                  DECLARER_DEMANDE_DEFAVORABLE: 'avisDesServicesEtCommissionsConsultativesARendre',
                },
              },
              expertisesMachine: {
                type: 'parallel',
                states: {
                  expertiseMachine: {
                    initial: 'expertiseAFaire',
                    states: {
                      expertiseAFaire: {
                        on: {
                          RECEVOIR_EXPERTISE: 'expertiseFaite',
                        },
                      },
                      expertiseFaite: {
                        type: 'final',
                      },
                    },
                  },
                  avisDesServicesEtCommissionsConsultativesMachine: {
                    initial: 'avisDesServicesEtCommissionsConsultativesARendre',
                    states: {
                      avisDesServicesEtCommissionsConsultativesARendre: {
                        on: {
                          RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES: {
                            target: 'avisDesServicesEtCommissionsConsultativesRendu',
                            actions: assign({ avisDesServicesEtCommissionsConsultativesFait: true }),
                          },
                        },
                      },
                      avisDesServicesEtCommissionsConsultativesRendu: { type: 'final' },
                    },
                  },
                },
                on: {
                  FAIRE_SAISINE_CARM: {
                    target: '#avisCommissionAutorisationDeRecherchesMinieresAFaire',
                    actions: assign({
                      visibilite: 'publique',
                    }),
                    guard: ({ context }) => context.avisDesServicesEtCommissionsConsultativesFait,
                  },
                },
              },
              avisDesServicesEtCommissionsConsultativesARendre: {
                on: {
                  RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES: 'avisDesServicesEtCommissionsConsultativesRendu',
                },
              },
              avisDesServicesEtCommissionsConsultativesRendu: { type: 'final' },
            },
          },
          declarationLoiSurLEauMachine: {
            initial: 'declarationLoiSurLEauAFaire',
            states: {
              declarationLoiSurLEauAFaire: {
                always: {
                  target: 'declarationLoiSurLEauExemptee',
                  guard: ({ context }) => isNonMecanise(context.mecanisation) || (isMecanise(context.mecanisation) && !context.mecanisation.franchissementCoursEau) || isInconnu(context.mecanisation),
                },
                on: {
                  REFUSER_RDE: {
                    target: 'declarationLoiSurLEauFaite',
                    guard: ({ event }) => (event.franchissements ?? 0) > 0,
                    actions: 'actionAccepterOuRefuserRDE',
                  },
                  ACCEPTER_RDE: {
                    target: 'declarationLoiSurLEauFaite',
                    guard: ({ event }) => (event.franchissements ?? 0) > 0,
                    actions: 'actionAccepterOuRefuserRDE',
                  },
                  DEMANDER_COMPLEMENTS_RDE: 'receptionDeComplementsAFaire',
                },
              },
              receptionDeComplementsAFaire: {
                on: {
                  RECEVOIR_COMPLEMENTS_RDE: {
                    target: 'declarationLoiSurLEauAFaire',
                    actions: 'recevoirComplementsRde',
                  },
                  REFUSER_RDE: {
                    target: 'declarationLoiSurLEauFaite',
                    guard: ({ context }) => isMecanise(context.mecanisation) && context.mecanisation.franchissementCoursEau > 0,
                    actions: 'actionAccepterOuRefuserRDE',
                  },
                  ACCEPTER_RDE: {
                    target: 'declarationLoiSurLEauFaite',
                    guard: ({ context }) => isMecanise(context.mecanisation) && context.mecanisation.franchissementCoursEau > 0,
                    actions: 'actionAccepterOuRefuserRDE',
                  },
                  DEMANDER_COMPLEMENTS_RDE: 'receptionDeComplementsAFaire',
                },
              },
              declarationLoiSurLEauExemptee: {
                always: {
                  target: 'declarationLoiSurLEauAFaire',
                  guard: ({ context }) => isMecanise(context.mecanisation) && context.mecanisation.franchissementCoursEau > 0,
                },
                on: {
                  DEMANDER_COMPLEMENTS_RDE: {
                    target: 'receptionDeComplementsAFaire',
                    guard: ({ context }) => (context.demarcheStatut === DemarchesStatutsIds.Depose || context.demarcheStatut === DemarchesStatutsIds.EnInstruction) && isMecanise(context.mecanisation),
                  },
                  REFUSER_RDE: {
                    target: 'declarationLoiSurLEauFaite',
                    guard: ({ context, event }) => (isInconnu(context.mecanisation) || isMecanise(context.mecanisation)) && (event.franchissements ?? 0) > 0,
                    actions: 'actionAccepterOuRefuserRDE',
                  },
                  ACCEPTER_RDE: {
                    target: 'declarationLoiSurLEauFaite',
                    guard: ({ context, event }) => (isInconnu(context.mecanisation) || isMecanise(context.mecanisation)) && (event.franchissements ?? 0) > 0,
                    actions: 'actionAccepterOuRefuserRDE',
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
            actions: assign({
              visibilite: 'publique',
            }),
          },
          DEMANDER_COMPLEMENTS_RDE: {
            target: [
              'demandeEnConstructionOuDeposeeOuEnInstructionMachine.declarationLoiSurLEauMachine.receptionDeComplementsAFaire',
              'demandeEnConstructionOuDeposeeOuEnInstructionMachine.pasRdeMachine.avisDesServicesEtCommissionsConsultativesRendu',
            ],
            guard: ({ context }) => isMecanise(context.mecanisation) && !context.mecanisation.franchissementCoursEau,
          },
          REFUSER_RDE: {
            target: 'saisineCommissionAutorisationsDeRecherchesMinieresAFaire',
            guard: ({ context, event }) => isMecanise(context.mecanisation) && !context.mecanisation.franchissementCoursEau && (event.franchissements ?? 0) > 0,
            actions: 'actionAccepterOuRefuserRDE',
          },
          ACCEPTER_RDE: {
            target: 'saisineCommissionAutorisationsDeRecherchesMinieresAFaire',
            guard: ({ context, event }) => isMecanise(context.mecanisation) && !context.mecanisation.franchissementCoursEau && (event.franchissements ?? 0) > 0,
            actions: 'actionAccepterOuRefuserRDE',
          },
        },
      },
      avisCommissionAutorisationDeRecherchesMinieresAFaire: {
        id: 'avisCommissionAutorisationDeRecherchesMinieresAFaire',
        on: {
          RENDRE_AVIS_FAVORABLE_CARM: [
            {
              target: 'signatureAutorisationDeRechercheMiniereAFaire',
              guard: ({ context }) => isNonMecanise(context.mecanisation),
            },
            {
              target: 'notificationDuDemandeurFraisDeDossierComplementairesAFaire',
              guard: ({ context }) => isMecanise(context.mecanisation),
            },
          ],
          RENDRE_AVIS_DEFAVORABLE_CARM: {
            target: 'notificationDuDemandeurAvisDefavorableCARMAFaire',
            actions: assign({
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
        tags: [tags.responsable['dea-guyane-01']],
        id: 'validationDuPaiementDesFraisDeDossierComplementairesAFaire',
        on: {
          VALIDER_PAIEMENT_FRAIS_DE_DOSSIER_COMPLEMENTAIRES: [
            {
              target: 'signatureAutorisationDeRechercheMiniereAFaire',
              actions: assign({
                mecanisation: ({ context }) => {
                  if (!isMecanise(context.mecanisation)) {
                    throw new Error('cas impossible')
                  }

                  return {
                    ...context.mecanisation,
                    paiementFraisDossierComplementaireValide: true,
                  }
                },
              }),
              guard: ({ context }) => context.demarcheStatut !== DemarchesStatutsIds.Desiste && context.demarcheStatut !== DemarchesStatutsIds.ClasseSansSuite,
            },
            {
              target: '#fini',
              actions: assign({
                mecanisation: ({ context }) => {
                  if (!isMecanise(context.mecanisation)) {
                    throw new Error('cas impossible')
                  }

                  return {
                    ...context.mecanisation,
                    paiementFraisDossierComplementaireValide: true,
                  }
                },
              }),
              guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.Desiste || context.demarcheStatut === DemarchesStatutsIds.ClasseSansSuite,
            },
          ],
        },
      },
      signatureAutorisationDeRechercheMiniereAFaire: {
        on: {
          SIGNER_AUTORISATION_DE_RECHERCHE_MINIERE: [
            {
              target: 'avenantARMAFaire',
              actions: assign({
                demarcheStatut: DemarchesStatutsIds.Accepte,
                demarcheDates: ({ context, event }) => demarcheDateMiseAJourTous(context, event),
              }),
              guard: ({ context }) => isMecanise(context.mecanisation),
            },
            {
              target: 'notificationSignatureARMAFaire',
              actions: assign({
                demarcheStatut: DemarchesStatutsIds.Accepte,
                demarcheDates: ({ context, event }) => demarcheDateMiseAJourTous(context, event),
              }),
              guard: ({ context }) => isNonMecanise(context.mecanisation),
            },
          ],
        },
      },
      notificationSignatureARMAFaire: {
        on: { NOTIFIER_DEMANDEUR_SIGNATURE_ARM: 'avenantARMAFaire' },
      },
      avenantARMAFaire: {
        on: {
          FAIRE_AVENANT_ARM: {
            target: 'notificationAvenantARMAFaire',
            actions: assign({
              demarcheDates: ({ context, event }) => {
                if (isNotNullNorUndefined(event.duree) && event.duree !== 0 && isNullOrUndefined(event.dateFin) && isNotNullNorUndefined(event.dateDebut)) {
                  return {
                    debut: {
                      dateDebut: event.dateDebut,
                      dateEtape: null,
                    },
                    fin: { dateFin: null, duree: event.duree },
                    effet: null,
                  }
                }
                let dateFin: CaminoMachineDateFin | CaminoMachineDateFinInfini = { dateFin: null, duree: null }
                if (
                  isNotNullNorUndefined(event.duree) &&
                  event.duree !== 0 &&
                  isNullOrUndefined(event.dateFin) &&
                  isNotNullNorUndefined(context.demarcheDates.fin.dateFin) &&
                  context.demarcheDates.fin.dateFin !== 'TITRE_INFINI'
                ) {
                  dateFin = { dateFin: dateAddMonths(context.demarcheDates.fin.dateFin, event.duree), duree: null }
                } else if (isNotNullNorUndefined(event.duree) && event.duree !== 0 && isNullOrUndefined(event.dateFin) && isNotNullNorUndefined(context.demarcheDates.fin.duree)) {
                  dateFin = { dateFin: null, duree: event.duree + context.demarcheDates.fin.duree }
                } else {
                  dateFin = getDemarcheDateFin(context.demarcheTypeId, context.demarcheDates.fin, event)
                }
                return {
                  debut: isNotNullNorUndefined(event.dateDebut)
                    ? {
                        dateDebut: event.dateDebut,
                        dateEtape: null,
                      }
                    : context.demarcheDates.debut,
                  // si il y'a une durée il faut la rajouter à la date de l'étape pour ne pas fausser le calcul
                  fin: dateFin,
                  effet: null,
                }
              },
            }),
          },
        },
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
