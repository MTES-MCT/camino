import { Entreprise } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { DomaineId } from 'camino-common/src/static/domaines'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import {
  administration,
  administrationActivitesTypesEmails,
  administrationActiviteTypeEmailDelete,
  administrationActiviteTypeEmailUpdate,
  administrationUtilisateurs
} from './administrations'

export type ActiviteTypeEmail = {
  email: string
  activiteTypeId: ActivitesTypesId
}

export type Utilisateur = {
  id: string
  prenom: string
  nom: string
  email: string
  entreprises?: Entreprise[]
} & User

export type AdministrationMeta = {
  titresTypesTitresStatuts: {
    titreType: {
      id: TitreTypeId
      nom: string
      type: {
        nom: string
      }
      domaine: {
        id: DomaineId
      }
    }
    titreStatutId: TitreStatutId
    titresModificationInterdit: boolean
    etapesModificationInterdit: boolean
    demarchesModificationInterdit: boolean
  }[]
  activitesTypes: {
    id: ActivitesTypesId
    nom: string
    modificationInterdit: boolean
    lectureInterdit: boolean
  }[]
  titresTypesEtapesTypes: {
    etapeType: {
      id: EtapeTypeId
      nom: string
    }
    titreType: {
      id: TitreTypeId
      nom: string
      type: {
        nom: string
      }
      domaine: {
        id: DomaineId
      }
    }
    titreStatutId: TitreStatutId
    creationInterdit: boolean
    modificationInterdit: boolean
    lectureInterdit: boolean
  }[]
}

export interface ApiClient {
  activitesTypesEmails: (
    administrationId: AdministrationId
  ) => Promise<ActiviteTypeEmail[]>
  administrationUtilisateurs: (
    administrationId: AdministrationId
  ) => Promise<Utilisateur[]>
  administrationActiviteTypeEmailUpdate: (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) => Promise<void>
  administrationActiviteTypeEmailDelete: (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) => Promise<void>
  administrationMetas: (
    administrationId: AdministrationId
  ) => Promise<AdministrationMeta>
}

export const apiClient: ApiClient = {
  activitesTypesEmails: async (administrationId: AdministrationId) =>
    await administrationActivitesTypesEmails({ id: administrationId }),
  administrationUtilisateurs: async (administrationId: AdministrationId) => {
    const { utilisateurs } = await administrationUtilisateurs({
      id: administrationId
    })
    return utilisateurs
  },
  administrationActiviteTypeEmailUpdate: async (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) => await administrationActiviteTypeEmailUpdate(activiteTypeEmail),
  administrationActiviteTypeEmailDelete: async (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) => await administrationActiviteTypeEmailDelete(activiteTypeEmail),
  administrationMetas: async (administrationId: AdministrationId) =>
    await administration({ id: administrationId })
}
