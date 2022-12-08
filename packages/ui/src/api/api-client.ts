import {
  AdministrationApiClient,
  administrationApiClient
} from '@/components/administration/administration-api-client.js'
import { Entreprise } from 'camino-common/src/entreprise'
import { User } from 'camino-common/src/roles'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import { AdministrationId } from 'camino-common/src/static/administrations'
import gql from 'graphql-tag'
import { apiGraphQLFetch } from './_client.js'

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

export interface ApiClient extends AdministrationApiClient {
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
    await apiGraphQLFetch(gql`
      query AdministrationActivitesTypesEmails($id: ID!) {
        administrationActivitesTypesEmails(id: $id) {
          email
          activiteTypeId
        }
      }
    `)({ id: administrationId }),

  administrationUtilisateurs: async (administrationId: AdministrationId) => {
    const { utilisateurs } = await apiGraphQLFetch(gql`
      query AdministrationUtilisateurs($id: ID!) {
        administration(id: $id) {
          utilisateurs {
            id
            nom
            prenom
            role
            email
          }
        }
      }
    `)({
      id: administrationId
    })
    return utilisateurs
  },
  administrationActiviteTypeEmailUpdate: async (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) =>
    await apiGraphQLFetch(gql`
      mutation AdministrationActiviteTypeEmailCreer(
        $administrationActiviteTypeEmail: InputAdministrationActiviteTypeEmail!
      ) {
        administrationActiviteTypeEmailCreer(
          administrationActiviteTypeEmail: $administrationActiviteTypeEmail
        ) {
          id
        }
      }
    `)(activiteTypeEmail),

  administrationActiviteTypeEmailDelete: async (
    activiteTypeEmail: ActiviteTypeEmail & {
      administrationId: AdministrationId
    }
  ) =>
    await apiGraphQLFetch(gql`
      mutation AdministrationActiviteTypeEmailSupprimer(
        $administrationActiviteTypeEmail: InputAdministrationActiviteTypeEmail!
      ) {
        administrationActiviteTypeEmailSupprimer(
          administrationActiviteTypeEmail: $administrationActiviteTypeEmail
        ) {
          id
        }
      }
    `)(activiteTypeEmail),
  ...administrationApiClient
}
