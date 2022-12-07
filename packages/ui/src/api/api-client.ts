import { Entreprise } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { AdministrationId } from 'camino-common/src/static/administrations'
import {
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
  ) => await administrationActiviteTypeEmailDelete(activiteTypeEmail)
}
