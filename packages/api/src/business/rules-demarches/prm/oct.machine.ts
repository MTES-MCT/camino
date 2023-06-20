import { assign, createMachine } from 'xstate'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { CaminoMachine } from '../machine-helper.js'
import { CaminoCommonContext, DBEtat, Etape } from '../machine-common.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { CaminoDate, dateAddMonths, daysBetween } from 'camino-common/src/date.js'
import { PAYS_IDS, PaysId, isGuyane, isMetropole, isOutreMer } from 'camino-common/src/static/pays.js'

type RendreAvisMiseEnConcurrentJORF = {
  date: CaminoDate
  type: 'RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF'
}

type OuvrirParticipationDuPublic = {
  date: CaminoDate
  type: 'OUVRIR_PARTICIPATION_DU_PUBLIC'
}

type FaireSaisineDesServices = {
  date: CaminoDate
  type: 'FAIRE_SAISINE_DES_SERVICES'
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

export type XStateEvent =
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
  | { type: 'CLOTURER_PARTICIPATION_DU_PUBLIC' }
  | FaireSaisineDesServices
  | { type: 'RENDRE_AVIS_ONF' }
  | { type: 'RENDRE_AVIS_SERVICE_ADMINISTRATIF_CIVIL_LOCAL' }
  | { type: 'RENDRE_AVIS_AUTORITE_MILITAIRE' }
  | { type: 'RENDRE_AVIS_DES_DTT' }
  | { type: 'RENDRE_AVIS_PARC_NATUREL_REGIONAL' }
  | { type: 'RENDRE_AVIS_PARC_NATIONAL' }
  | { type: 'RENDRE_AVIS_AGENCE_REGIONALE_SANTE_ARS' }
  | { type: 'RENDRE_AVIS_INSTITUT_NATIONAL_ORIGINE_ET_QUALITE_INAO' }
  | { type: 'RENDRE_AVIS_DIRECTION_REGIONALE_AFFAIRES_CULTURELLES' }
  | { type: 'RENDRE_AVIS_DIRECTION_REGIONALE_FINANCES_PUBLIQUES' }
  | { type: 'RENDRE_AVIS_POLICE_EAU' }
  | RendreAvisCDM
  | RendreRapportDREAL
  | { type: 'RENDRE_AVIS_PREFET' }
  | { type: 'FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES' }
  | { type: 'RENDRE_AVIS_DU_MAIRE' }
  | { type: 'FAIRE_RAPPORT_ADMINISTRATION_CENTRALE' }
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
  | { type: 'RENDRE_DECISION_RETRAIT' }
  | { type: 'DESISTER_PAR_LE_DEMANDEUR' }
  | { type: 'CLASSER_SANS_SUITE' }
  | { type: 'MODIFIER_DEMANDE' }
  | { type: 'DEMANDER_INFORMATIONS' }
  | { type: 'RECEVOIR_INFORMATIONS' }

export type Event = XStateEvent['type']

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
  OUVRIR_PARTICIPATION_DU_PUBLIC: { db: EtapesTypesEtapesStatuts.ouvertureDeLaParticipationDuPublic, mainStep: true },
  CLOTURER_PARTICIPATION_DU_PUBLIC: { db: EtapesTypesEtapesStatuts.clotureDeLaParticipationDuPublic, mainStep: true },
  FAIRE_SAISINE_DES_SERVICES: { db: EtapesTypesEtapesStatuts.saisineDesServices, mainStep: true },
  RENDRE_AVIS_ONF: { db: EtapesTypesEtapesStatuts.avisDeLOfficeNationalDesForets, mainStep: false },
  RENDRE_AVIS_SERVICE_ADMINISTRATIF_CIVIL_LOCAL: { db: EtapesTypesEtapesStatuts.avisDunServiceAdministratifLocal, mainStep: false },
  RENDRE_AVIS_AUTORITE_MILITAIRE: { db: EtapesTypesEtapesStatuts.avisDeLautoriteMilitaire, mainStep: false },
  RENDRE_AVIS_DES_DTT: { db: EtapesTypesEtapesStatuts.avisDeLaDirectionDepartementaleDesTerritoiresEtDeLaMerDDT_M_, mainStep: false },
  RENDRE_AVIS_PARC_NATUREL_REGIONAL: { db: EtapesTypesEtapesStatuts.avisDuParcNaturelRegional, mainStep: false },
  RENDRE_AVIS_PARC_NATIONAL: { db: EtapesTypesEtapesStatuts.avisDuParcNational, mainStep: false },
  RENDRE_AVIS_AGENCE_REGIONALE_SANTE_ARS: { db: EtapesTypesEtapesStatuts.avisDeLagenceRegionaleDeSante, mainStep: false },
  RENDRE_AVIS_INSTITUT_NATIONAL_ORIGINE_ET_QUALITE_INAO: { db: EtapesTypesEtapesStatuts.avisDeLInstitutNationalDeLorigineEtDeLaQualite, mainStep: false },
  RENDRE_AVIS_DIRECTION_REGIONALE_AFFAIRES_CULTURELLES: { db: EtapesTypesEtapesStatuts.avisDeDirectionRegionaleDesAffairesCulturelles, mainStep: false },
  RENDRE_AVIS_DIRECTION_REGIONALE_FINANCES_PUBLIQUES: { db: EtapesTypesEtapesStatuts.avisDeLaDirectionRegionaleDesFinancesPubliques, mainStep: false },
  RENDRE_AVIS_POLICE_EAU: { db: EtapesTypesEtapesStatuts.expertiseDREALOuDGTMServiceEau, mainStep: false },

  RENDRE_AVIS_CDM: { db: EtapesTypesEtapesStatuts.avisDeLaCommissionDepartementaleDesMines_CDM_, mainStep: true },
  RENDRE_RAPPORT_DREAL: { db: EtapesTypesEtapesStatuts.avisEtRapportDuDirecteurRegionalChargeDeLenvironnementDeLamenagementEtDuLogement, mainStep: true },
  RENDRE_AVIS_PREFET: { db: EtapesTypesEtapesStatuts.avisDuPrefet, mainStep: true },
  FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES: { db: EtapesTypesEtapesStatuts.saisineDesCollectivitesLocales, mainStep: true },
  RENDRE_AVIS_DU_MAIRE: { db: EtapesTypesEtapesStatuts.avisDunMaire, mainStep: true },
  FAIRE_RAPPORT_ADMINISTRATION_CENTRALE: { db: EtapesTypesEtapesStatuts.consultationDesAdministrationsCentrales, mainStep: true },
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
  RENDRE_DECISION_RETRAIT: { db: EtapesTypesEtapesStatuts.retraitDeLaDecision, mainStep: true },
  DESISTER_PAR_LE_DEMANDEUR: { db: EtapesTypesEtapesStatuts.desistementDuDemandeur, mainStep: false },
  CLASSER_SANS_SUITE: { db: EtapesTypesEtapesStatuts.classementSansSuite, mainStep: false },
  MODIFIER_DEMANDE: { db: EtapesTypesEtapesStatuts.modificationDeLaDemande, mainStep: false },
  DEMANDER_INFORMATIONS: { db: EtapesTypesEtapesStatuts.demandeDinformations, mainStep: false },
  RECEVOIR_INFORMATIONS: { db: EtapesTypesEtapesStatuts.receptionDinformation, mainStep: false },
} as const

// Related to https://github.com/Microsoft/TypeScript/issues/12870
export const EVENTS = Object.keys(trad) as Array<Extract<keyof typeof trad, string>>

const SUPERFICIE_MAX_POUR_EXONERATION_AVIS_MISE_EN_CONCURRENCE_AU_JORF = 50

export class PrmOctMachine extends CaminoMachine<PrmOctContext, XStateEvent> {
  constructor() {
    super(prmOctMachine, trad)
  }

  toPotentialCaminoXStateEvent(event: XStateEvent['type'], date: CaminoDate): XStateEvent[] {
    switch (event) {
      case 'RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF':
      case 'OUVRIR_PARTICIPATION_DU_PUBLIC':
      case 'FAIRE_SAISINE_DES_SERVICES':
      case 'RENDRE_AVIS_CDM':
      case 'RENDRE_RAPPORT_DREAL':
        return [{ type: event, date }]
      case 'FAIRE_DEMANDE':
        return [
          { type: event, paysId: PAYS_IDS['Département de la Guyane'], surface: SUPERFICIE_MAX_POUR_EXONERATION_AVIS_MISE_EN_CONCURRENCE_AU_JORF + 1 },
          { type: event, paysId: PAYS_IDS['Département de la Guyane'], surface: SUPERFICIE_MAX_POUR_EXONERATION_AVIS_MISE_EN_CONCURRENCE_AU_JORF - 1 },
          { type: event, paysId: PAYS_IDS['Wallis-et-Futuna'], surface: 0 },
          { type: event, paysId: PAYS_IDS['République Française'], surface: 0 },
        ]
      default:
        // related to https://github.com/microsoft/TypeScript/issues/46497  https://github.com/microsoft/TypeScript/issues/40803 :(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return [{ type: event }]
    }
  }

  eventFrom(etape: Etape): XStateEvent {
    const entries = Object.entries(trad).filter((entry): entry is [Event, { db: DBEtat; mainStep: boolean }] => EVENTS.includes(entry[0]))

    const entry = entries.find(([_key, { db: dbEtat }]) => {
      return Object.values(dbEtat).some(dbEtatSingle => dbEtatSingle.etapeTypeId === etape.etapeTypeId && dbEtatSingle.etapeStatutId === etape.etapeStatutId)
    })

    if (entry) {
      const eventFromEntry = entry[0]
      switch (eventFromEntry) {
        case 'RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF':
        case 'OUVRIR_PARTICIPATION_DU_PUBLIC':
        case 'FAIRE_SAISINE_DES_SERVICES':
        case 'RENDRE_AVIS_CDM':
        case 'RENDRE_RAPPORT_DREAL':
          return { type: eventFromEntry, date: etape.date }
        case 'FAIRE_DEMANDE':
          if (!etape.paysId) {
            console.error(`paysId is mandatory in etape ${JSON.stringify(etape)}`)

            return { type: eventFromEntry, paysId: 'FR', surface: etape.surface ?? 0 }
          }

          if (etape.paysId === 'GF' && etape.surface === null && etape.surface === undefined) {
            throw new Error(`la surface pour la demande est obligatoire quand la demande est en Guyane  ${JSON.stringify(etape)}`)
          }

          return { type: eventFromEntry, paysId: etape.paysId, surface: etape.surface ?? 0 }
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

interface PrmOctContext extends CaminoCommonContext {
  dateAvisMiseEnConcurrentJorf: CaminoDate | null
  dateSaisineDesServices: CaminoDate | null
  paysId: PaysId | null
  surface: number | null
}

const peutOuvrirParticipationDuPublic = (context: PrmOctContext, event: OuvrirParticipationDuPublic): boolean => {
  return estExempteDeLaMiseEnConcurrence(context) || (context.dateAvisMiseEnConcurrentJorf !== null && daysBetween(dateAddMonths(context.dateAvisMiseEnConcurrentJorf, 1), event.date) >= 0)
}

const peutRendreRapportDREAL = (context: PrmOctContext, event: RendreRapportDREAL): boolean => {
  return isMetropole(context.paysId) && !!context.dateSaisineDesServices && daysBetween(dateAddMonths(context.dateSaisineDesServices, 1), event.date) >= 0
}

const peutRendreAvisCDM = (context: PrmOctContext, event: RendreAvisCDM): boolean => {
  return isOutreMer(context.paysId) && !!context.dateSaisineDesServices && daysBetween(dateAddMonths(context.dateSaisineDesServices, 1), event.date) >= 0
}

const estExempteDeLaMiseEnConcurrence = (context: PrmOctContext): boolean => {
  if (isGuyane(context.paysId)) {
    if (context.surface === null) {
      throw new Error('la surface est obligatoire quand on est en Guyane')
    }

    return context.surface < SUPERFICIE_MAX_POUR_EXONERATION_AVIS_MISE_EN_CONCURRENCE_AU_JORF
  }

  return false
}

const prmOctMachine = createMachine<PrmOctContext, XStateEvent>({
  predictableActionArguments: true,
  id: 'oct',
  initial: 'demandeAFaire',
  context: {
    dateAvisMiseEnConcurrentJorf: null,
    dateSaisineDesServices: null,
    visibilite: 'confidentielle',
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
    paysId: null,
    surface: null,
  },
  on: {
    MODIFIER_DEMANDE: {
      actions: () => ({}),
      cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
    },
    DEMANDER_INFORMATIONS: {
      actions: () => ({}),
      cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
    },
    RECEVOIR_INFORMATIONS: {
      actions: () => ({}),
      cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
    },
    DESISTER_PAR_LE_DEMANDEUR: {
      target: 'done',
      cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
      actions: assign<CaminoCommonContext, { type: 'DESISTER_PAR_LE_DEMANDEUR' }>({
        demarcheStatut: DemarchesStatutsIds.Desiste,
        visibilite: 'publique',
      }),
    },
    CLASSER_SANS_SUITE: {
      target: 'done',
      cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
      actions: assign<CaminoCommonContext, { type: 'CLASSER_SANS_SUITE' }>({
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
          actions: assign<PrmOctContext, FaireDemande>({
            paysId: (_context, event) => {
              return event.paysId
            },
            surface: (_context, event) => {
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
          actions: assign<CaminoCommonContext, { type: 'DEPOSER_DEMANDE' }>({
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
          actions: assign<CaminoCommonContext, { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }>({
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
          actions: assign<CaminoCommonContext, { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }>({
            demarcheStatut: DemarchesStatutsIds.EnInstruction,
            visibilite: 'publique',
          }),
        },
        FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE: 'complementsPourRecevabiliteAFaire',
      },
    },
    avisDeMiseEnConcurrenceAuJORFAFaire: {
      always: {
        cond: estExempteDeLaMiseEnConcurrence,
        target: 'saisinesEtMiseEnConcurrence',
      },
      on: {
        RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF: {
          target: 'saisinesEtMiseEnConcurrence',
          actions: assign<PrmOctContext, RendreAvisMiseEnConcurrentJORF>({
            dateAvisMiseEnConcurrentJorf: (_context, event) => {
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
                        cond: (context: PrmOctContext) => !isGuyane(context.paysId),
                        target: 'done',
                      },
                      on: {
                        FAIRE_SAISINE_DES_COLLECTIVITES_LOCALES: 'avisDuMaireARendre',
                      },
                    },
                    avisDuMaireARendre: {
                      on: {
                        RENDRE_AVIS_DU_MAIRE: 'done',
                      },
                    },
                    done: { type: 'final' },
                  },
                },
                saisineDesServicesMachine: {
                  initial: 'saisineDesServicesAFaire',
                  states: {
                    saisineDesServicesAFaire: {
                      on: {
                        FAIRE_SAISINE_DES_SERVICES: {
                          target: 'avisDesServicesARendre',
                          actions: assign<PrmOctContext, FaireSaisineDesServices>({
                            dateSaisineDesServices: (_context, event) => event.date,
                          }),
                        },
                      },
                    },
                    avisDesServicesARendre: {
                      type: 'parallel',

                      states: {
                        rendreAvisDrealAFaire: {
                          on: {
                            RENDRE_AVIS_CDM: { target: '#rapportDREALAFaire', cond: peutRendreAvisCDM },
                            RENDRE_RAPPORT_DREAL: { target: '#avisPrefetARendre', cond: peutRendreRapportDREAL },
                          },
                        },
                        avisServiceAdministratifCivilLocal: {
                          initial: 'avisServiceAdministratifCivilLocalARendre',
                          states: {
                            avisServiceAdministratifCivilLocalARendre: {
                              on: { RENDRE_AVIS_SERVICE_ADMINISTRATIF_CIVIL_LOCAL: 'avisServiceAdministratifCivilLocalRendu' },
                            },
                            avisServiceAdministratifCivilLocalRendu: { type: 'final' },
                          },
                        },
                        avisAutoriteMilitaire: {
                          initial: 'avisAutoriteMilitaireARendre',
                          states: {
                            avisAutoriteMilitaireARendre: {
                              on: { RENDRE_AVIS_AUTORITE_MILITAIRE: 'avisAutoriteMilitaireRendu' },
                            },
                            avisAutoriteMilitaireRendu: { type: 'final' },
                          },
                        },
                        avisDesDDT: {
                          initial: 'avisDesDDTARendre',
                          states: {
                            avisDesDDTARendre: {
                              on: {
                                RENDRE_AVIS_DES_DTT: { target: 'avisDesDDTRendu', cond: (context: PrmOctContext) => !isGuyane(context.paysId) },
                                RENDRE_AVIS_POLICE_EAU: { target: 'avisDesDDTRendu', cond: (context: PrmOctContext) => isGuyane(context.paysId) },
                              },
                            },
                            avisDesDDTRendu: { type: 'final' },
                          },
                        },
                        avisParcNaturelRegional: {
                          initial: 'avisParcNaturelRegionalARendre',
                          states: {
                            avisParcNaturelRegionalARendre: {
                              on: { RENDRE_AVIS_PARC_NATUREL_REGIONAL: 'avisParcNaturelRegionalRendu' },
                            },
                            avisParcNaturelRegionalRendu: { type: 'final' },
                          },
                        },
                        avisParcNational: {
                          initial: 'avisParcNationalARendre',
                          states: {
                            avisParcNationalARendre: {
                              on: { RENDRE_AVIS_PARC_NATIONAL: 'avisParcNationalRendu' },
                            },
                            avisParcNationalRendu: { type: 'final' },
                          },
                        },
                        avisAgenceRegionaleSanteARS: {
                          initial: 'avisAgenceRegionaleSanteARSARendre',
                          states: {
                            avisAgenceRegionaleSanteARSARendre: {
                              on: { RENDRE_AVIS_AGENCE_REGIONALE_SANTE_ARS: 'avisAgenceRegionaleSanteARSRendu' },
                            },
                            avisAgenceRegionaleSanteARSRendu: { type: 'final' },
                          },
                        },
                        avisONF: {
                          initial: 'avisONFARendre',
                          states: {
                            avisONFARendre: {
                              on: { RENDRE_AVIS_ONF: 'avisONFRendu' },
                            },
                            avisONFRendu: { type: 'final' },
                          },
                        },
                        avisInstitutNationalOrigineEtQualiteINAO: {
                          initial: 'avisInstitutNationalOrigineEtQualiteINAOARendre',
                          states: {
                            avisInstitutNationalOrigineEtQualiteINAOARendre: {
                              on: { RENDRE_AVIS_INSTITUT_NATIONAL_ORIGINE_ET_QUALITE_INAO: 'avisInstitutNationalOrigineEtQualiteINAORendu' },
                            },
                            avisInstitutNationalOrigineEtQualiteINAORendu: { type: 'final' },
                          },
                        },
                        avisDirectionRegionaleAffairesCulturelles: {
                          initial: 'avisDirectionRegionaleAffairesCulturellesARendre',
                          states: {
                            avisDirectionRegionaleAffairesCulturellesARendre: {
                              on: { RENDRE_AVIS_DIRECTION_REGIONALE_AFFAIRES_CULTURELLES: 'avisDirectionRegionaleAffairesCulturellesRendu' },
                            },
                            avisDirectionRegionaleAffairesCulturellesRendu: { type: 'final' },
                          },
                        },
                        avisDirectionRegionaleFinancesPubliques: {
                          initial: 'avisDirectionRegionaleFinancesPubliquesARendre',
                          states: {
                            avisDirectionRegionaleFinancesPubliquesARendre: {
                              on: { RENDRE_AVIS_DIRECTION_REGIONALE_FINANCES_PUBLIQUES: 'avisDirectionRegionaleFinancesPubliquesRendu' },
                            },
                            avisDirectionRegionaleFinancesPubliquesRendu: { type: 'final' },
                          },
                        },
                      },
                      onDone: 'avisDesServicesRendus',
                    },
                    avisDesServicesRendus: { type: 'final' },
                  },
                },
              },
              onDone: 'avisCommissionDepartementaleDesMinesEnGuyaneEtOutreMerOuRapportDeLaDREALARendre',
            },
            avisCommissionDepartementaleDesMinesEnGuyaneEtOutreMerOuRapportDeLaDREALARendre: {
              always: [
                {
                  target: 'avisCommissionDepartementaleDesMinesEnGuyaneEtOutreMerARendre',
                  cond: (context: PrmOctContext) => isOutreMer(context.paysId),
                },
                {
                  target: 'rapportDREALAFaire',
                  cond: (context: PrmOctContext) => isMetropole(context.paysId),
                },
              ],
            },
            avisCommissionDepartementaleDesMinesEnGuyaneEtOutreMerARendre: {
              on: {
                RENDRE_AVIS_CDM: 'rapportDREALAFaire',
              },
            },
            rapportDREALAFaire: {
              id: 'rapportDREALAFaire',
              on: {
                RENDRE_RAPPORT_DREAL: 'avisPrefetARendre',
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
                DEPOSER_DEMANDE_CONCURRENTE: { target: 'participationDuPublicPasEncorePossible', cond: context => !estExempteDeLaMiseEnConcurrence(context) },
                OUVRIR_PARTICIPATION_DU_PUBLIC: { target: 'clotureParticipationDuPublicAFaire', cond: peutOuvrirParticipationDuPublic },
              },
            },
            clotureParticipationDuPublicAFaire: {
              on: {
                CLOTURER_PARTICIPATION_DU_PUBLIC: 'done',
              },
            },
            done: { type: 'final' },
          },
        },
      },
      onDone: 'rapportAdministrationCentraleAFaire',
    },
    rapportAdministrationCentraleAFaire: {
      on: {
        FAIRE_RAPPORT_ADMINISTRATION_CENTRALE: 'saisineDuConseilGeneralChargeDesMinesAFaire',
      },
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
          actions: assign<PrmOctContext, { type: 'RENDRE_DECISION_ADMINISTRATION_REJETE' }>({
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
        },
      },
    },
    publicationAuJORFAFaire: {
      on: {
        FAIRE_PUBLICATION_AU_JORF: {
          target: 'notificationsAFaire',
          actions: assign<PrmOctContext, { type: 'FAIRE_PUBLICATION_AU_JORF' }>({
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
                RENDRE_DECISION_RETRAIT: 'publicationAuJORFAFaireSuiteAuRejet',
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
