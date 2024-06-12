import { assign, createMachine } from 'xstate'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { CaminoMachine } from '../machine-helper.js'
import { CaminoCommonContext, DBEtat, Etape } from '../machine-common.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'

type XStateEvent =
  | { type: 'FAIRE_DEMANDE' }
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE' }
  | { type: 'RECEVOIR_MODIFICATION_DE_LA_DEMANDE' }
  | { type: 'RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES' }
  | { type: 'FAIRE_AVENANT_ARM' }
  | { type: 'NOTIFIER_AVENANT_ARM' }
  | { type: 'DESISTER_PAR_LE_DEMANDEUR' }
  | { type: 'CLASSER_SANS_SUITE' }
  | { type: 'NOTIFIER_DEMANDEUR_APRES_CLASSEMENT_SANS_SUITE' }

type Event = XStateEvent['type']
// FIXME on fini toujours en statut accepté après l'avis, et on fait l'avenant à l'autorisation de recherch minière (aco)
// Si un jour on a un cas de rejet (peu probable car cette arbre ne sera plus utilisé avec la réforme), il faudra probablement rajouter une étape intermédiaire
const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: EtapesTypesEtapesStatuts.demande, mainStep: true },
  DEPOSER_DEMANDE: { db: EtapesTypesEtapesStatuts.depotDeLaDemande, mainStep: true },
  DEMANDER_COMPLEMENTS_POUR_RECEVABILITE: { db: EtapesTypesEtapesStatuts.demandeDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
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
  RECEVOIR_MODIFICATION_DE_LA_DEMANDE: { db: EtapesTypesEtapesStatuts.modificationDeLaDemande, mainStep: false },
  RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE: { db: EtapesTypesEtapesStatuts.receptionDeComplements_RecevabiliteDeLaDemande_, mainStep: false },
  RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES: { db: EtapesTypesEtapesStatuts.avisDesServicesEtCommissionsConsultatives, mainStep: true },
  FAIRE_AVENANT_ARM: { db: EtapesTypesEtapesStatuts.avenantALautorisationDeRechercheMiniere, mainStep: true },
  NOTIFIER_AVENANT_ARM: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_, mainStep: true },
  DESISTER_PAR_LE_DEMANDEUR: { db: EtapesTypesEtapesStatuts.desistementDuDemandeur, mainStep: false },
  CLASSER_SANS_SUITE: { db: EtapesTypesEtapesStatuts.classementSansSuite, mainStep: false },
  NOTIFIER_DEMANDEUR_APRES_CLASSEMENT_SANS_SUITE: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_ClassementSansSuite_, mainStep: true },
} as const

// Related to https://github.com/Microsoft/TypeScript/issues/12870
const EVENTS = Object.keys(trad) as Array<Extract<keyof typeof trad, string>>

export class ArmRenProMachine extends CaminoMachine<CaminoCommonContext, XStateEvent> {
  constructor() {
    super(armRenProMachine, trad)
  }

  eventFrom(etape: Etape): XStateEvent {
    const entries = Object.entries(trad).filter((entry): entry is [Event, { db: DBEtat; mainStep: boolean }] => EVENTS.includes(entry[0]))

    const entry = entries.find(([_key, { db: dbEtat }]) => {
      return Object.values(dbEtat).some(dbEtatSingle => dbEtatSingle.etapeTypeId === etape.etapeTypeId && dbEtatSingle.etapeStatutId === etape.etapeStatutId)
    })

    if (entry) {
      const eventFromEntry = entry[0]

      // related to https://github.com/microsoft/TypeScript/issues/46497  https://github.com/microsoft/TypeScript/issues/40803 :(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return { type: eventFromEntry }
    }
    throw new Error(`no event from ${JSON.stringify(etape)}`)
  }
}

const armRenProMachine = createMachine({
  types: {} as { context: CaminoCommonContext; events: XStateEvent },
  id: 'renpro',
  initial: 'demandeAFaire',
  context: {
    visibilite: 'confidentielle',
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
  },
  on: {
    DESISTER_PAR_LE_DEMANDEUR: {
      target: '.done',
      guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
      actions: assign({
        demarcheStatut: DemarchesStatutsIds.Desiste,
        visibilite: 'publique',
      }),
    },
    CLASSER_SANS_SUITE: {
      target: '.notificationDuDemandeurApresClassementSansSuiteAFaire',
      guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
      actions: assign({
        demarcheStatut: DemarchesStatutsIds.ClasseSansSuite,
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
      on: {
        DEPOSER_DEMANDE: {
          target: 'recevabiliteDeLaDemandeAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Depose,
          }),
        },
      },
    },
    recevabiliteDeLaDemandeAFaire: {
      on: {
        DEMANDER_COMPLEMENTS_POUR_RECEVABILITE: 'complementsPourRecevabiliteAFaire',
        FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
          target: 'avisDesServicesEtCommissionsConsultativesARendre',
          actions: assign({
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
          target: 'avisDesServicesEtCommissionsConsultativesARendre',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.EnInstruction,
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
    avisDesServicesEtCommissionsConsultativesARendre: {
      on: {
        RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES: {
          target: 'avenantARMAFaire',
          actions: assign({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
      },
    },
    avenantARMAFaire: {
      on: { FAIRE_AVENANT_ARM: 'notificationAvenantARMAFaire' },
    },
    notificationAvenantARMAFaire: {
      on: { NOTIFIER_AVENANT_ARM: 'avenantARMAFaire' },
    },
    notificationDuDemandeurApresClassementSansSuiteAFaire: {
      on: { NOTIFIER_DEMANDEUR_APRES_CLASSEMENT_SANS_SUITE: 'done' },
    },
    done: { type: 'final' },
  },
})
