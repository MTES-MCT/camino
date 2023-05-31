import { assign, createMachine } from 'xstate'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { CaminoMachine } from '../machine-helper.js'
import { CaminoCommonContext, DBEtat, Etape } from '../machine-common.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'
import { CaminoDate, dateAddMonths, daysBetween } from 'camino-common/src/date.js'

type RendreAvisMiseEnConcurrentJORF = {
  date: CaminoDate
  type: 'RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF'
}

type OuvrirParticipationDuPublic = {
  date: CaminoDate
  type: 'OUVRIR_PARTICIPATION_DU_PUBLIC'
}
export type XStateEvent =
  | { type: 'FAIRE_DEMANDE' }
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

export type Event = XStateEvent['type']

// FIXME faire les mainstep
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
  RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF: { db: { FAIT: EtapesTypesEtapesStatuts.avisDeMiseEnConcurrenceAuJORF.FAIT }, mainStep: true },
  DEPOSER_DEMANDE_CONCURRENTE: { db: EtapesTypesEtapesStatuts.avisDeDemandeConcurrente, mainStep: true },
  OUVRIR_PARTICIPATION_DU_PUBLIC: { db: { FAIT: EtapesTypesEtapesStatuts.ouvertureDeLaParticipationDuPublic.FAIT }, mainStep: true },
  CLOTURER_PARTICIPATION_DU_PUBLIC: { db: EtapesTypesEtapesStatuts.clotureDeLaParticipationDuPublic, mainStep: true },
} as const

// Related to https://github.com/Microsoft/TypeScript/issues/12870
export const EVENTS = Object.keys(trad) as Array<Extract<keyof typeof trad, string>>

export class PrmOctMachine extends CaminoMachine<PrmOctContext, XStateEvent> {
  constructor() {
    super(prmOctMachine, trad)
  }

  toPotentialCaminoXStateEvent(event: XStateEvent['type'], date: CaminoDate): XStateEvent[] {
    switch (event) {
      case 'RENDRE_AVIS_DE_MISE_EN_CONCURRENCE_AU_JORF':
      case 'OUVRIR_PARTICIPATION_DU_PUBLIC':
        return [{ type: event, date }]
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
          return { type: eventFromEntry, date: etape.date }
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
}

const peutOuvrirParticipationDuPublic = (context: PrmOctContext, event: OuvrirParticipationDuPublic): boolean => {
  return context.dateAvisMiseEnConcurrentJorf !== null && daysBetween(dateAddMonths(context.dateAvisMiseEnConcurrentJorf, 1), event.date) >= 0
}
const prmOctMachine = createMachine<PrmOctContext, XStateEvent>({
  predictableActionArguments: true,
  id: 'oct',
  initial: 'demandeAFaire',
  context: {
    dateAvisMiseEnConcurrentJorf: null,
    visibilite: 'confidentielle',
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
  },
  on: {
    // DESISTER_PAR_LE_DEMANDEUR: {
    //   target: 'done',
    //   cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
    //   actions: assign<CaminoCommonContext, { type: 'DESISTER_PAR_LE_DEMANDEUR' }>({
    //     demarcheStatut: DemarchesStatutsIds.Desiste,
    //     visibilite: 'publique',
    //   }),
    // },
    // CLASSER_SANS_SUITE: {
    //   target: 'notificationDuDemandeurApresClassementSansSuiteAFaire',
    //   cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
    //   actions: assign<CaminoCommonContext, { type: 'CLASSER_SANS_SUITE' }>({
    //     demarcheStatut: DemarchesStatutsIds.ClasseSansSuite,
    //     visibilite: 'publique',
    //   }),
    // },
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
            // FIXME à voir avec Patrick et l’ancien code
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
          target: 'avisDeMiseEnConcurrenceAuJORFAFaire',
          actions: assign<CaminoCommonContext, { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }>({
            demarcheStatut: DemarchesStatutsIds.EnInstruction,
            visibilite: 'publique',
          }),
        },
        FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE: 'modificationDeLaDemandeAFaire',
      },
    },
    // FIXME gérer guyane et superficie < 50km²
    avisDeMiseEnConcurrenceAuJORFAFaire: {
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
    // FIXME gérer la fin de mise en concurrence (générer automatiquement l’étape à sa date future, ajouter une description à l’avis de mise en concurrence…)
    saisinesEtMiseEnConcurrence: {
      type: 'parallel',
      states: {
        saisinesMachine: {
          type: 'parallel',
          states: {},
        },
        miseEnConcurrenceMachine: {
          initial: 'participationDuPublicPasEncorePossible',
          states: {
            participationDuPublicPasEncorePossible: {
              on: {
                DEPOSER_DEMANDE_CONCURRENTE: 'participationDuPublicPasEncorePossible',
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
    rapportAdministrationCentraleAFaire: {},
    done: { type: 'final' },
  },
})
