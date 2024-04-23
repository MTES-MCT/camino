import { apiGraphQLFetch } from '@/api/_client'
import { Journaux, JournauxQueryParams } from 'camino-common/src/journaux'
import gql from 'graphql-tag'

export interface JournauxApiClient {
  getJournaux: (params: JournauxQueryParams) => Promise<Journaux>
}

export const journauxApiClient: JournauxApiClient = {
  // TODO 2023-06-22 check with zod?
  getJournaux: async (params: JournauxQueryParams): Promise<Journaux> =>
    apiGraphQLFetch(gql`
      query Journaux($page: Int!, $recherche: String, $titresIds: [String]) {
        journaux(page: $page, recherche: $recherche, titresIds: $titresIds) {
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
    }),
}
