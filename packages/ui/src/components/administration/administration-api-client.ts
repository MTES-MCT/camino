import { AdministrationId } from 'camino-common/src/static/administrations'
import { apiGraphQLFetch } from '@/api/_client'
import gql from 'graphql-tag'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { AdminUserNotNull } from 'camino-common/src/roles'
import { getWithJson } from '../../api/client-rest'

export type ActiviteTypeEmail = {
  email: string
  activiteTypeId: ActivitesTypesId
}

export interface AdministrationApiClient {
  administrationActivitesTypesEmails: (administrationId: AdministrationId) => Promise<ActiviteTypeEmail[]>
  administrationUtilisateurs: (administrationId: AdministrationId) => Promise<AdminUserNotNull[]>
  administrationActiviteTypeEmailUpdate: (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) => Promise<ActiviteTypeEmail[]>
  administrationActiviteTypeEmailDelete: (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) => Promise<ActiviteTypeEmail[]>
}

export const administrationApiClient: AdministrationApiClient = {
  administrationActivitesTypesEmails: async (administrationId: AdministrationId) =>
    await apiGraphQLFetch(gql`
      query AdministrationActivitesTypesEmails($id: ID!) {
        administrationActivitesTypesEmails(id: $id) {
          email
          activiteTypeId
        }
      }
    `)({ id: administrationId }),

  administrationUtilisateurs: async (administrationId: AdministrationId) => {
    return getWithJson('/rest/administrations/:administrationId/utilisateurs', { administrationId })
  },
  administrationActiviteTypeEmailUpdate: async (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) =>
    await apiGraphQLFetch(gql`
      mutation AdministrationActiviteTypeEmailCreer($administrationActiviteTypeEmail: InputAdministrationActiviteTypeEmail!) {
        administrationActiviteTypeEmailCreer(administrationActiviteTypeEmail: $administrationActiviteTypeEmail)
      }
    `)({ administrationActiviteTypeEmail: activiteTypeEmail }),

  administrationActiviteTypeEmailDelete: async (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) =>
    await apiGraphQLFetch(gql`
      mutation AdministrationActiviteTypeEmailSupprimer($administrationActiviteTypeEmail: InputAdministrationActiviteTypeEmail!) {
        administrationActiviteTypeEmailSupprimer(administrationActiviteTypeEmail: $administrationActiviteTypeEmail)
      }
    `)({ administrationActiviteTypeEmail: activiteTypeEmail }),
}
