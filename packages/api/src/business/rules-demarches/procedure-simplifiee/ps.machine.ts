import { assign, createMachine } from 'xstate'
import { CaminoMachine } from '../machine-helper.js'
import { CaminoCommonContext, DBEtat, Etape } from '../machine-common.js'
import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'

type ProcedureSimplifieeXStateEvent =
  | { type: 'FAIRE_DEMANDE' }
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'FAIRE_RECEVABILITE_DE_LA_DEMANDE' }
  | { type: 'OUVRIR_PARTICIPATION_DU_PUBLIC' }

type Event = ProcedureSimplifieeXStateEvent['type']

const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: ETES.demande, mainStep: true },
  DEPOSER_DEMANDE: { db: ETES.depotDeLaDemande, mainStep: true },
  FAIRE_RECEVABILITE_DE_LA_DEMANDE: { db: { FAVORABLE: ETES.recevabiliteDeLaDemande.FAVORABLE }, mainStep: true},
  OUVRIR_PARTICIPATION_DU_PUBLIC: {db: ETES.ouvertureDeLaParticipationDuPublic, mainStep: true },
}

// Related to https://github.com/Microsoft/TypeScript/issues/12870
const EVENTS = Object.keys(trad) as Array<Extract<keyof typeof trad, string>>

// basé sur https://drive.google.com/file/d/1Rfm1aiE_vfl8jlSAKYF_SfBfIJXKi_3l/view?usp=drive_link
export class ProcedureSimplifieeMachine extends CaminoMachine<ProcedureSimplifieeContext, ProcedureSimplifieeXStateEvent> {
  constructor() {
    super(procedureSimplifieeMachine, trad)
  }

  eventFrom(etape: Etape): ProcedureSimplifieeXStateEvent {
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

interface ProcedureSimplifieeContext extends CaminoCommonContext {
  receptionDeLaDemandeFaite: boolean
  ouverturePublicFaite: boolean
  decisionAdministrationFaite: boolean
}


const procedureSimplifieeMachine = createMachine({
  types: {} as { context: ProcedureSimplifieeContext; events: ProcedureSimplifieeXStateEvent },
  id: 'PS',
  initial: 'demandeAFaire',
  context: {
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
    visibilite: 'confidentielle',
    receptionDeLaDemandeFaite: false,
    ouverturePublicFaite: false,
    decisionAdministrationFaite: false
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
          target: 'receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.EnInstruction
          })
        },
      },
    },
    receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire: {
      on: {
        FAIRE_RECEVABILITE_DE_LA_DEMANDE: {
          guard: ({ context }) => !context.ouverturePublicFaite && !context.decisionAdministrationFaite && !context.receptionDeLaDemandeFaite,
          actions: assign({
            receptionDeLaDemandeFaite: true
          }),
          target: 'receptionDeLaDemandeOuOuverturePublicOuDecisionAdministrationAFaire'
        },
        OUVRIR_PARTICIPATION_DU_PUBLIC: {
          guard: ({ context }) => !context.decisionAdministrationFaite,
          actions: assign({
            ouverturePublicFaite: true
          }),
          target: 'clotureDeLaParticipationDuPublic',
        },
        // DECISION_ADMINISTRATION: {
        //   actions: assign({
        //     decisionAdministrationFaite: true
        //   })
        // },
      }
    },
    clotureDeLaParticipationDuPublic: {

    }
  },
})
