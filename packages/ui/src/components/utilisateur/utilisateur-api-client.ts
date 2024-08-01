import { apiGraphQLFetch } from '@/api/_client'
import { EntrepriseId, Utilisateur } from 'camino-common/src/entreprise'
import { QGISToken, UtilisateurToEdit } from 'camino-common/src/utilisateur'

import gql from 'graphql-tag'
import { getWithJson, newGetWithJson, postWithJson } from '../../api/client-rest'
import { Role, UtilisateurId } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'

export interface UtilisateurApiClient {
  getUtilisateur: (userId: UtilisateurId) => Promise<Utilisateur>
  getUtilisateurNewsletter: (userId: UtilisateurId) => Promise<boolean>
  updateUtilisateurNewsletter: (userId: UtilisateurId, subscribe: boolean) => Promise<void>
  registerToNewsletter: (email: string) => Promise<void>
  removeUtilisateur: (userId: UtilisateurId) => Promise<void>
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
  getUtilisateurNewsletter: async (userId: UtilisateurId) => getWithJson('/rest/utilisateurs/:id/newsletter', { id: userId }),
  updateUtilisateurNewsletter: async (userId: UtilisateurId, newsletter: boolean) => {
    await postWithJson('/rest/utilisateurs/:id/newsletter', { id: userId }, { newsletter })
  },
  registerToNewsletter: async (email: string) => {
    await newGetWithJson('/rest/utilisateurs/registerToNewsletter', {}, { email })
  },
  removeUtilisateur: async (userId: UtilisateurId) => getWithJson('/rest/utilisateurs/:id/delete', { id: userId }),
  updateUtilisateur: async (utilisateur: UtilisateurToEdit) => postWithJson('/rest/utilisateurs/:id/permission', { id: utilisateur.id }, utilisateur),
  getQGISToken: async () => postWithJson('/rest/utilisateur/generateQgisToken', {}, undefined),
}
