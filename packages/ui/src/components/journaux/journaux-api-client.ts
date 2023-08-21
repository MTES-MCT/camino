import { apiGraphQLFetch } from '@/api/_client'
import { Journaux, JournauxQueryParams } from 'camino-common/src/journaux'
import gql from 'graphql-tag'

export interface JournauxApiClient {
  getJournaux: (params: JournauxQueryParams) => Promise<Journaux>
}

export const journauxApiClient: JournauxApiClient = {
  // TODO 2023-06-22 check with zod?
  getJournaux: async (params: JournauxQueryParams): Promise<Journaux> => {
    return await apiGraphQLFetch(gql`
      query Journaux($page: Int!, $recherche: String, $titreId: String) {
        journaux(intervalle: 10, page: $page, recherche: $recherche, titreId: $titreId) {
          elements {
            id
            date
            differences
            elementId
            operation
            utilisateur {
              nom
              prenom
            }
            titre {
              nom
            }
          }
          total
        }
      }
    `)({
      ...params,
    })
  },
}
