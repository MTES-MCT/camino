import { assign, setup } from 'xstate'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { CaminoMachine } from '../machine-helper'
import { CaminoCommonContext, DBEtat, getDemarcheDateDebut, getDemarcheDateEffet, getDemarcheDateFin, globalGuards } from '../machine-common'
import { DemarchesStatutsIds } from 'camino-common/src/static/demarchesStatuts'
import { CaminoDate } from 'camino-common/src/date'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
type RendreAvisDesServicesEtCommissionsConsultatives = {
  type: 'RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES'
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
type FaireDemande = {
  type: 'FAIRE_DEMANDE'
  date: CaminoDate
  dateDebut: CaminoDate | null
  dateFin: CaminoDate | null
  duree: number | null
}
type DesisterParLeDemandeur = {
  type: 'DESISTER_PAR_LE_DEMANDEUR'
  date: CaminoDate
  dateDebut: CaminoDate | null
  dateFin: CaminoDate | null
  duree: number | null
}

type ClasserSansSuite = {
  type: 'CLASSER_SANS_SUITE'
  date: CaminoDate
  dateDebut: CaminoDate | null
  dateFin: CaminoDate | null
  duree: number | null
}
type XStateEvent =
  | FaireDemande
  | { type: 'ENREGISTRER_DEMANDE' }
  | { type: 'DEMANDER_COMPLEMENTS_POUR_RECEVABILITE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_FAVORABLE' }
  | { type: 'FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE' }
  | { type: 'RECEVOIR_MODIFICATION_DE_LA_DEMANDE' }
  | { type: 'RECEVOIR_COMPLEMENTS_POUR_RECEVABILITE' }
  | RendreAvisDesServicesEtCommissionsConsultatives
  | FaireAvenantArm
  | { type: 'NOTIFIER_AVENANT_ARM' }
  | DesisterParLeDemandeur
  | ClasserSansSuite
  | { type: 'NOTIFIER_DEMANDEUR_APRES_CLASSEMENT_SANS_SUITE' }

type Event = XStateEvent['type']
// TODO 2024-06-12 on finit toujours en statut accepté après l'avis, et on fait l'avenant à l'autorisation de recherch minière (aco)
// Si un jour on a un cas de rejet (peu probable car cette arbre ne sera plus utilisé avec la réforme), il faudra probablement rajouter une étape intermédiaire
const trad: { [key in Event]: { db: DBEtat; mainStep: boolean } } = {
  FAIRE_DEMANDE: { db: EtapesTypesEtapesStatuts.demande, mainStep: true },
  ENREGISTRER_DEMANDE: { db: EtapesTypesEtapesStatuts.enregistrementDeLaDemande, mainStep: true },
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

export class ArmRenProMachine extends CaminoMachine<CaminoCommonContext, XStateEvent> {
  constructor(titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) {
    super(armRenProMachine(titreTypeId, demarcheTypeId), trad)
  }
}

const armRenProMachine = (_titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId) =>
  setup({
    types: {} as { context: CaminoCommonContext; events: XStateEvent },
    guards: { ...globalGuards },
  }).createMachine({
    id: 'ArmRenPro',
    initial: 'demandeAFaire',
    context: {
      visibilite: 'confidentielle',
      demarcheStatut: DemarchesStatutsIds.EnConstruction,
      demarcheTypeId,
      demarcheDateDebut: { dateDebut: null, dateEtape: null },
      demarcheDateFin: { dateFin: null, duree: null },
      demarcheDateEffet: null,
    },
    on: {
      DESISTER_PAR_LE_DEMANDEUR: {
        target: '.done',
        guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction || context.demarcheStatut === DemarchesStatutsIds.Depose,
        actions: assign({
          demarcheStatut: DemarchesStatutsIds.Desiste,
          visibilite: 'publique',
          demarcheDateFin: ({ event }) => ({ dateFin: event.date, duree: null }),
        }),
      },
      CLASSER_SANS_SUITE: {
        target: '.notificationDuDemandeurApresClassementSansSuiteAFaire',
        guard: ({ context }) => context.demarcheStatut === DemarchesStatutsIds.EnInstruction,
        actions: assign({
          demarcheStatut: DemarchesStatutsIds.ClasseSansSuite,
          visibilite: 'publique',
          demarcheDateFin: ({ event }) => ({ dateFin: event.date, duree: null }),
        }),
      },
    },
    states: {
      demandeAFaire: {
        on: {
          FAIRE_DEMANDE: {
            target: 'enregistrementDeLaDemandeAFaire',
            actions: assign({
              demarcheDateDebut: ({ context, event }) => getDemarcheDateDebut(demarcheTypeId, context.demarcheDateDebut, event),
            }),
          },
        },
      },
      enregistrementDeLaDemandeAFaire: {
        on: {
          ENREGISTRER_DEMANDE: {
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
        on: {
          FAIRE_AVENANT_ARM: {
            target: 'notificationAvenantARMAFaire',
            actions: assign({
              demarcheDateDebut: ({ context, event }) => getDemarcheDateDebut(demarcheTypeId, context.demarcheDateDebut, event),
              demarcheDateFin: ({ context, event }) => getDemarcheDateFin(demarcheTypeId, context.demarcheDateFin, event),
              demarcheDateEffet: ({ context, event }) => getDemarcheDateEffet(demarcheTypeId, context.demarcheDateEffet, event),
            }),
          },
        },
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
