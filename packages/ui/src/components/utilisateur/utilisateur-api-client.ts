import { Utilisateur } from '@/api/api-client'
import { fragmentEntreprises } from '@/api/fragments/entreprises'
import { fragmentUtilisateur } from '@/api/fragments/utilisateur'
import { apiGraphQLFetch } from '@/api/_client'
import { Entreprise } from 'camino-common/src/entreprise'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import gql from 'graphql-tag'
import { fetchWithJson } from '../../api/client-rest'

export interface UtilisateurApiClient {
  getUtilisateur: (userId: string) => Promise<Utilisateur>
  getUtilisateurNewsletter: (userId: string) => Promise<boolean>
  removeUtilisateur: (userId: string) => Promise<void>
  updateUtilisateur: (user: Utilisateur) => Promise<void>
  createUtilisateur: (user: Omit<Utilisateur, 'id'>) => Promise<Utilisateur>
  getEntreprises: () => Promise<Entreprise[]>
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
    id: userId
  })
  return data
},
getUtilisateurNewsletter: async (userId: string) => {
    return await fetchWithJson(CaminoRestRoutes.newsletter, {id: userId}, 'get')
},
removeUtilisateur: async (userId: string) => {
    await apiGraphQLFetch(gql`
  mutation UtilisateurSupprimer($id: ID!) {
    utilisateurSupprimer(id: $id) {
      ...utilisateur
    }
  }

  ${fragmentUtilisateur}
`)({id: userId})
},
createUtilisateur: async (utilisateur: Omit<Utilisateur, 'id'>) => {
   const data = await apiGraphQLFetch(gql`
  mutation UtilisateurCreer(
    $utilisateur: InputUtilisateurCreation!
    $token: String
  ) {
    utilisateurCreer(utilisateur: $utilisateur, token: $token) {
      ...utilisateur
    }
  }

  ${fragmentUtilisateur}
`)({utilisateur})
return data

},
updateUtilisateur: async (utilisateur: Utilisateur) => {
    await apiGraphQLFetch(gql`
  mutation UtilisateurModifier($utilisateur: InputUtilisateurModification!) {
    utilisateurModifier(utilisateur: $utilisateur) {
      ...utilisateur
    }
  }

  ${fragmentUtilisateur}
`)({utilisateur})
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
      
}
}
