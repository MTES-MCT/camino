import { apiGraphQLFetch } from '@/api/_client'
import { Utilisateur } from 'camino-common/src/entreprise'
import { QGISToken, UtilisateurToEdit, UtilisateursSearchParamsInput, UtilisateursTable } from 'camino-common/src/utilisateur'

import gql from 'graphql-tag'
import { getWithJson, newGetWithJson, postWithJson } from '../../api/client-rest'
import { UtilisateurId } from 'camino-common/src/roles'

export interface UtilisateurApiClient {
  getUtilisateur: (userId: UtilisateurId) => Promise<Utilisateur>
  getUtilisateurNewsletter: (userId: UtilisateurId) => Promise<boolean>
  updateUtilisateurNewsletter: (userId: UtilisateurId, subscribe: boolean) => Promise<void>
  registerToNewsletter: (email: string) => Promise<void>
  removeUtilisateur: (userId: UtilisateurId) => Promise<void>
  updateUtilisateur: (user: UtilisateurToEdit) => Promise<void>
  getQGISToken: () => Promise<QGISToken>
  getUtilisateurs: (params: UtilisateursSearchParamsInput) => Promise<UtilisateursTable>
}

export const utilisateurApiClient: UtilisateurApiClient = {
  getUtilisateurs: async (params: UtilisateursSearchParamsInput) => {
    return newGetWithJson('/rest/utilisateurs', {}, params)
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
