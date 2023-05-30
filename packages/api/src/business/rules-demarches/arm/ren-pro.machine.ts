import { assign, createMachine } from 'xstate'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { CaminoMachine } from '../machine-helper.js'
import { CaminoCommonContext, DBEtat, Etape } from '../machine-common.js'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts.js'

export type XStateEvent =
  | { type: 'FAIRE_DEMANDE' }
  | { type: 'DEPOSER_DEMANDE' }
  | { type: 'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE' }
  | { type: 'RECEVOIR_MODIFICATION_DE_LA_DEMANDE' }
  | { type: 'RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'DEMANDER_INFORMATION_EXPERTISE_ONF' }
  | { type: 'RECEVOIR_INFORMATION_EXPERTISE_ONF' }
  | { type: 'FAIRE_EXPERTISE_ONF' }
  | { type: 'DEMANDER_INFORMATION_AVIS_ONF' }
  | { type: 'RECEVOIR_INFORMATION_AVIS_ONF' }
  | { type: 'RENDRE_AVIS_ONF_FAVORABLE' }
  | { type: 'RENDRE_AVIS_ONF_DEFAVORABLE' }
  | { type: 'NOTIFIER_DEMANDEUR_APRES_AVIS_ONF_DEFAVORABLE' }
  | { type: 'FAIRE_AVENANT_ARM' }
  | { type: 'NOTIFIER_AVENANT_ARM' }
  | { type: 'DESISTER_PAR_LE_DEMANDEUR' }
  | { type: 'CLASSER_SANS_SUITE' }
  | { type: 'NOTIFIER_DEMANDEUR_APRES_CLASSEMENT_SANS_SUITE' }

export type Event = XStateEvent['type']

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
  DEMANDER_INFORMATION_EXPERTISE_ONF: { db: EtapesTypesEtapesStatuts.demandeDinformations_ExpertiseDeLOfficeNationalDesForets_, mainStep: false },
  RECEVOIR_INFORMATION_EXPERTISE_ONF: { db: EtapesTypesEtapesStatuts.receptionDinformation_ExpertiseDeLOfficeNationalDesForets_, mainStep: false },
  FAIRE_EXPERTISE_ONF: { db: EtapesTypesEtapesStatuts.expertiseDeLOfficeNationalDesForets, mainStep: true },
  DEMANDER_INFORMATION_AVIS_ONF: { db: EtapesTypesEtapesStatuts.demandeDinformations_AvisDeLOfficeNationalDesForets_, mainStep: false },
  RECEVOIR_INFORMATION_AVIS_ONF: { db: EtapesTypesEtapesStatuts.receptionDinformation_AvisDeLOfficeNationalDesForets_, mainStep: false },
  RENDRE_AVIS_ONF_FAVORABLE: { db: { FAVORABLE: EtapesTypesEtapesStatuts.avisDeLOfficeNationalDesForets.FAVORABLE }, mainStep: true },
  RENDRE_AVIS_ONF_DEFAVORABLE: { db: { DEFAVORABLE: EtapesTypesEtapesStatuts.avisDeLOfficeNationalDesForets.DEFAVORABLE }, mainStep: true },
  NOTIFIER_DEMANDEUR_APRES_AVIS_ONF_DEFAVORABLE: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_AvisDefavorable_, mainStep: true },
  FAIRE_AVENANT_ARM: { db: EtapesTypesEtapesStatuts.avenantALautorisationDeRechercheMiniere, mainStep: true },
  NOTIFIER_AVENANT_ARM: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_SignatureDeLavenantALautorisationDeRechercheMiniere_, mainStep: true },
  DESISTER_PAR_LE_DEMANDEUR: { db: EtapesTypesEtapesStatuts.desistementDuDemandeur, mainStep: false },
  CLASSER_SANS_SUITE: { db: EtapesTypesEtapesStatuts.classementSansSuite, mainStep: false },
  NOTIFIER_DEMANDEUR_APRES_CLASSEMENT_SANS_SUITE: { db: EtapesTypesEtapesStatuts.notificationAuDemandeur_ClassementSansSuite_, mainStep: false },
} as const

// Related to https://github.com/Microsoft/TypeScript/issues/12870
export const EVENTS = Object.keys(trad) as Array<Extract<keyof typeof trad, string>>

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

const armRenProMachine = createMachine<CaminoCommonContext, XStateEvent>({
  predictableActionArguments: true,
  id: 'renpro',
  initial: 'demandeAFaire',
  context: {
    visibilite: 'confidentielle',
    demarcheStatut: DemarchesStatutsIds.EnConstruction,
  },
  on: {
    DESISTER_PAR_LE_DEMANDEUR: {
      target: 'done',
      cond: context => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
      actions: assign<CaminoCommonContext, { type: 'DESISTER_PAR_LE_DEMANDEUR' }>({
        demarcheStatut: DemarchesStatutsIds.Desiste,
        visibilite: 'publique',
      }),
    },
    CLASSER_SANS_SUITE: {
      target: 'notificationDuDemandeurApresClassementSansSuiteAFaire',
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
        FAIRE_DEMANDE: 'depotDeLaDemandeAFaire',
      },
    },
    depotDeLaDemandeAFaire: {
      on: {
        DEPOSER_DEMANDE: {
          target: 'recevabiliteDeLaDemandeAFaire',
          actions: assign<CaminoCommonContext, { type: 'DEPOSER_DEMANDE' }>({
            demarcheStatut: DemarchesStatutsIds.Depose,
          }),
        },
      },
    },
    recevabiliteDeLaDemandeAFaire: {
      on: {
        DEMANDER_COMPLEMENTS_POUR_RECEVABILITE: 'complementsPourRecevabiliteAFaire',
        FAIRE_RECEVABILITE_DEMANDE_FAVORABLE: {
          target: 'expertiseONFAFaire',
          actions: assign<CaminoCommonContext, { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }>({
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
          target: 'expertiseONFAFaire',
          actions: assign<CaminoCommonContext, { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }>({
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
        RENDRE_AVIS_ONF_FAVORABLE: {
          target: 'avenantARMAFaire',
          actions: assign<CaminoCommonContext, { type: 'RENDRE_AVIS_ONF_FAVORABLE' }>({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
        RENDRE_AVIS_ONF_DEFAVORABLE: {
          target: 'notificationDuDemandeurApresAvisONFDefavorableAFaire',
          actions: assign<CaminoCommonContext, { type: 'RENDRE_AVIS_ONF_DEFAVORABLE' }>({
            demarcheStatut: DemarchesStatutsIds.Rejete,
          }),
        },
      },
    },
    receptionInformationAvisONFAFaire: {
      on: {
        RECEVOIR_INFORMATION_AVIS_ONF: 'demandeAvisONFAFaire',
        RENDRE_AVIS_ONF_FAVORABLE: {
          target: 'avenantARMAFaire',
          actions: assign<CaminoCommonContext, { type: 'RENDRE_AVIS_ONF_FAVORABLE' }>({
            demarcheStatut: DemarchesStatutsIds.Accepte,
          }),
        },
        RENDRE_AVIS_ONF_DEFAVORABLE: {
          target: 'notificationDuDemandeurApresAvisONFDefavorableAFaire',
          actions: assign<CaminoCommonContext, { type: 'RENDRE_AVIS_ONF_DEFAVORABLE' }>({
            demarcheStatut: DemarchesStatutsIds.Rejete,
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
    notificationDuDemandeurApresAvisONFDefavorableAFaire: {
      on: {
        NOTIFIER_DEMANDEUR_APRES_AVIS_ONF_DEFAVORABLE: 'done',
      },
    },
    notificationDuDemandeurApresClassementSansSuiteAFaire: {
      on: { NOTIFIER_DEMANDEUR_APRES_CLASSEMENT_SANS_SUITE: 'done' },
    },
    done: { type: 'final' },
  },
})
