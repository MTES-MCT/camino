import { apiGraphQLFetch } from '@/api/_client'
import { CaminoAnnee } from 'camino-common/src/date'
import { ActivitesStatutId } from 'camino-common/src/static/activitesStatuts'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'

import gql from 'graphql-tag'

export interface Activite {
  id: string
  slug: string
  typeId: ActivitesTypesId
  activiteStatutId: ActivitesStatutId
  periodeId: number
  annee: CaminoAnnee
  titre: {
    id: string
    nom: string
    titulaires: {
      nom: string
    }[]
  }
}

export interface ActiviteApiClient {
  getActivites: (params: GetActivitesParams) => Promise<{ elements: Activite[]; total: number }>
}

export type GetActivitesParams = {
  page?: number
  colonne?: string
  ordre?: 'asc' | 'desc'
}
export const activiteApiClient: ActiviteApiClient = {
  getActivites: async (params: GetActivitesParams) => {
    const data = await apiGraphQLFetch(gql`
      query Activites(
        $intervalle: Int
        $page: Int
        $colonne: String
        $ordre: String
        $typesIds: [ID]
        $statutsIds: [ID]
        $annees: [Int]
        $titresTypesIds: [ID]
        $titresDomainesIds: [ID]
        $titresStatutsIds: [ID]
        $titresIds: [String]
        $titresEntreprisesIds: [String]
        $titresSubstancesIds: [String]
        $titresReferences: String
        $titresTerritoires: String
      ) {
        activites(
          intervalle: $intervalle
          page: $page
          colonne: $colonne
          ordre: $ordre
          typesIds: $typesIds
          statutsIds: $statutsIds
          annees: $annees
          titresTypesIds: $titresTypesIds
          titresDomainesIds: $titresDomainesIds
          titresStatutsIds: $titresStatutsIds
          titresIds: $titresIds
          titresEntreprisesIds: $titresEntreprisesIds
          titresSubstancesIds: $titresSubstancesIds
          titresReferences: $titresReferences
          titresTerritoires: $titresTerritoires
        ) {
          elements {
            id
            slug
            typeId
            activiteStatutId
            periodeId
            annee
            titre {
              id
              nom
              titulaires {
                id
                nom
              }
              amodiataires {
                id
                nom
              }
            }
          }
          total
        }
      }
    `)({
      ...params,
    })
    return data
  },
}
