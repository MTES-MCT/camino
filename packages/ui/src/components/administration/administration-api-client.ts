import { AdministrationId } from 'camino-common/src/static/administrations'
import { apiGraphQLFetch } from '@/api/_client'
import gql from 'graphql-tag'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { Utilisateur } from 'camino-common/src/entreprise'

export type ActiviteTypeEmail = {
  email: string
  activiteTypeId: ActivitesTypesId
}

export type AdministrationMetas = {
  activitesTypes: {
    id: ActivitesTypesId
    modificationInterdit: boolean
    lectureInterdit: boolean
  }[]
}

export interface AdministrationApiClient {
  administrationActivitesTypesEmails: (administrationId: AdministrationId) => Promise<ActiviteTypeEmail[]>
  administrationUtilisateurs: (administrationId: AdministrationId) => Promise<Utilisateur[]>
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

  administrationMetas: (administrationId: AdministrationId) => Promise<AdministrationMetas>
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
    const result = await apiGraphQLFetch(gql`
      query AdministrationUtilisateurs($id: ID!) {
        administration(id: $id) {
          utilisateurs {
            id
            nom
            prenom
            role
            email
            administrationId
            entreprises {
              id
            }
          }
        }
      }
    `)({
      id: administrationId,
    })
    return result ? result.utilisateurs : []
  },
  administrationActiviteTypeEmailUpdate: async (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) =>
    await apiGraphQLFetch(gql`
      mutation AdministrationActiviteTypeEmailCreer($administrationActiviteTypeEmail: InputAdministrationActiviteTypeEmail!) {
        administrationActiviteTypeEmailCreer(administrationActiviteTypeEmail: $administrationActiviteTypeEmail) {
          id
        }
      }
    `)({ administrationActiviteTypeEmail: activiteTypeEmail }),

  administrationActiviteTypeEmailDelete: async (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) =>
    await apiGraphQLFetch(gql`
      mutation AdministrationActiviteTypeEmailSupprimer($administrationActiviteTypeEmail: InputAdministrationActiviteTypeEmail!) {
        administrationActiviteTypeEmailSupprimer(administrationActiviteTypeEmail: $administrationActiviteTypeEmail) {
          id
        }
      }
    `)({ administrationActiviteTypeEmail: activiteTypeEmail }),

  administrationMetas: async (administrationId: AdministrationId) =>
    await apiGraphQLFetch(gql`
      query Administration($id: ID!) {
        administration(id: $id) {
          activitesTypes {
            id
            modificationInterdit
            lectureInterdit
          }
        }
      }
    `)({ id: administrationId }),
}
