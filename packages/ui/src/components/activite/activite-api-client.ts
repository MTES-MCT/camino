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
        $page: Int
        $colonne: String
        $ordre: String
        $activiteTypesIds: [ID]
        $activiteStatutsIds: [ID]
        $annees: [String]
        $typesIds: [ID]
        $domainesIds: [ID]
        $statutsIds: [ID]
        $titresIds: [String]
        $entreprisesIds: [String]
        $substancesIds: [String]
        $references: String
        $titresTerritoires: String
      ) {
        activites(
          intervalle: 10
          page: $page
          colonne: $colonne
          ordre: $ordre
          typesIds: $activiteTypesIds
          statutsIds: $activiteStatutsIds
          annees: $annees
          titresTypesIds: $typesIds
          titresDomainesIds: $domainesIds
          titresStatutsIds: $statutsIds
          titresIds: $titresIds
          titresEntreprisesIds: $entreprisesIds
          titresSubstancesIds: $substancesIds
          titresReferences: $references
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
