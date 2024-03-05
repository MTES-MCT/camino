import { apiGraphQLFetch } from '@/api/_client'
import { Entreprise, EntrepriseId, Utilisateur } from 'camino-common/src/entreprise'
import { QGISToken, UtilisateurToEdit } from 'camino-common/src/utilisateur'

import gql from 'graphql-tag'
import { getWithJson, postWithJson } from '../../api/client-rest'
import { Role } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'

export interface UtilisateurApiClient {
  getUtilisateur: (userId: string) => Promise<Utilisateur>
  getUtilisateurNewsletter: (userId: string) => Promise<boolean>
  updateUtilisateurNewsletter: (userId: string, subscribe: boolean) => Promise<void>
  newsletterInscrire: (email: string) => Promise<void>
  removeUtilisateur: (userId: string) => Promise<void>
  updateUtilisateur: (user: UtilisateurToEdit) => Promise<void>
  getQGISToken: () => Promise<QGISToken>
  getUtilisateurs: (params: UtilisateursParams) => Promise<{ elements: Utilisateur[]; total: number }>
}

type UtilisateursParams = {
  page?: number
  colonne?: string
  ordre?: 'asc' | 'desc'
  noms?: string
  emails?: string
  roles?: Role[]
  administrationIds?: AdministrationId[]
  entreprisesIds?: EntrepriseId[]
}
export const utilisateurApiClient: UtilisateurApiClient = {
  getUtilisateurs: async (params: UtilisateursParams) => {
    const data = await apiGraphQLFetch(gql`
      query Utilisateurs($page: Int, $colonne: String, $ordre: String, $entreprisesIds: [ID], $administrationIds: [ID], $roles: [ID], $noms: String, $emails: String) {
        utilisateurs(
          intervalle: 10
          page: $page
          colonne: $colonne
          ordre: $ordre
          entreprisesIds: $entreprisesIds
          administrationIds: $administrationIds
          roles: $roles
          noms: $noms
          emails: $emails
        ) {
          elements {
            id
            nom
            prenom
            email
            telephoneMobile
            telephoneFixe
            entreprises {
              id
              nom
              paysId
              legalSiren
              legalEtranger
            }
            administrationId
            role
          }
          total
        }
      }
    `)({
      ...params,
    })
    return data
  },
  getUtilisateur: async (userId: string) => {
    const data = await apiGraphQLFetch(gql`
      query Utilisateur($id: ID!) {
        utilisateur(id: $id) {
          id
          nom
          prenom
          email
          telephoneMobile
          telephoneFixe
          entreprises {
            id
            nom
            paysId
            legalSiren
            legalEtranger
          }
          administrationId
          role
        }
      }
    `)({
      id: userId,
    })
    return data
  },
  getUtilisateurNewsletter: async (userId: string) => {
    return await getWithJson('/rest/utilisateurs/:id/newsletter', { id: userId })
  },
  updateUtilisateurNewsletter: async (userId: string, newsletter: boolean) => {
    await postWithJson('/rest/utilisateurs/:id/newsletter', { id: userId }, { newsletter })
  },
  newsletterInscrire: async (email: string) => {
    await apiGraphQLFetch(gql`
      mutation NewsletterInscrire($email: String!) {
        newsletterInscrire(email: $email)
      }
    `)({ email })
  },
  removeUtilisateur: async (userId: string) => {
    return await getWithJson('/rest/utilisateurs/:id/delete', { id: userId })
  },
  updateUtilisateur: async (utilisateur: UtilisateurToEdit) => {
    return await postWithJson('/rest/utilisateurs/:id/permission', { id: utilisateur.id }, utilisateur)
  },
  getQGISToken: async () => postWithJson('/rest/utilisateur/generateQgisToken', {}, undefined),
}
