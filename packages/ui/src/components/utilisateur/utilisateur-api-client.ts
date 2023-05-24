import { apiGraphQLFetch } from '@/api/_client'
import { Entreprise, Utilisateur } from 'camino-common/src/entreprise'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { QGISToken, UtilisateurToEdit } from 'camino-common/src/utilisateur'

import gql from 'graphql-tag'
import { deleteWithJson, getWithJson, postWithJson } from '../../api/client-rest'

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
  removeUtilisateur: async (userId: string) => {
    return await deleteWithJson('/rest/utilisateurs/:id', { id: userId })
  },
  updateUtilisateur: async (utilisateur: UtilisateurToEdit) => {
    return await postWithJson('/rest/utilisateurs/:id/permission', { id: utilisateur.id }, utilisateur)
  },
  getEntreprises: async () => {
    const { elements } = await apiGraphQLFetch(
      gql`
        query UtilisateurMetas {
          entreprises {
            elements {
              id
              nom
              paysId
              legalSiren
              legalEtranger
            }
          }
        }
      `
    )()
    return elements
  },
  getQGISToken: async () => postWithJson('/rest/utilisateur/generateQgisToken', {}, undefined),
}
