import { Utilisateur } from '@/api/api-client'
import { fragmentEntreprises } from '@/api/fragments/entreprises'
import { fragmentUtilisateur } from '@/api/fragments/utilisateur'
import { apiGraphQLFetch } from '@/api/_client'
import { Entreprise } from 'camino-common/src/entreprise'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { QGISToken, UtilisateurToEdit } from 'camino-common/src/utilisateur'

import gql from 'graphql-tag'
import { fetchWithJson, postWithJson } from '../../api/client-rest'

export interface UtilisateurApiClient {
  getUtilisateur: (userId: string) => Promise<Utilisateur>
  getUtilisateurNewsletter: (userId: string) => Promise<boolean>
  updateUtilisateurNewsletter: (userId: string, subscribe: boolean) => Promise<void>
  removeUtilisateur: (userId: string) => Promise<void>
  updateUtilisateur: (user: UtilisateurToEdit) => Promise<void>
  getEntreprises: () => Promise<Entreprise[]>
  getQGISToken: () => Promise<QGISToken>
}

export const utilisateurApiClient: UtilisateurApiClient = {
  getUtilisateur: async (userId: string) => {
    const data = await apiGraphQLFetch(gql`
      query Utilisateur($id: ID!) {
        utilisateur(id: $id) {
          ...utilisateur
        }
      }

      ${fragmentUtilisateur}
    `)({
      id: userId,
    })
    return data
  },
  getUtilisateurNewsletter: async (userId: string) => {
    return await fetchWithJson(CaminoRestRoutes.newsletter, { id: userId }, 'get')
  },
  updateUtilisateurNewsletter: async (userId: string, newsletter: boolean) => {
    return await postWithJson(CaminoRestRoutes.newsletter, { id: userId }, { newsletter })
  },
  removeUtilisateur: async (userId: string) => {
    return await fetchWithJson(CaminoRestRoutes.utilisateur, { id: userId }, 'delete')
  },
  updateUtilisateur: async (utilisateur: UtilisateurToEdit) => {
    return await postWithJson(CaminoRestRoutes.utilisateurPermission, { id: utilisateur.id }, utilisateur)
  },
  getEntreprises: async () => {
    const { elements } = await apiGraphQLFetch(
      gql`
        query UtilisateurMetas {
          entreprises {
            elements {
              ...entreprises
            }
          }
        }

        ${fragmentEntreprises}
      `
    )()
    return elements
  },
  getQGISToken: async () => fetchWithJson(CaminoRestRoutes.generateQgisToken, {}, 'post'),
}