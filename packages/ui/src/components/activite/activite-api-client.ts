import { apiGraphQLFetch } from '@/api/_client'
import { Activite, ActiviteDocumentId, ActiviteId, ActiviteIdOrSlug, TempActiviteDocument } from 'camino-common/src/activite'
import { CaminoAnnee } from 'camino-common/src/date'
import { ActivitesStatutId } from 'camino-common/src/static/activitesStatuts'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes'
import gql from 'graphql-tag'
import { deleteWithJson, getWithJson, putWithJson } from '../../api/client-rest'
import { SectionWithValue } from 'camino-common/src/sections'
import { DeepReadonly } from 'vue'
import { EntrepriseId } from 'camino-common/src/entreprise'

export interface UiGraphqlActivite {
  id: string
  slug: string
  typeId: ActivitesTypesId
  activiteStatutId: ActivitesStatutId
  periodeId: number
  annee: CaminoAnnee
  titre: {
    id: string
    nom: string
    titulaireIds: EntrepriseId[]
  }
}

export interface ActiviteApiClient {
  getActivites: (params: GetActivitesParams) => Promise<{ elements: UiGraphqlActivite[]; total: number }>
  getActivite: (activiteIdOrSlug: ActiviteIdOrSlug) => Promise<Activite>
  deposerActivite: (activiteId: ActiviteId) => Promise<void>
  supprimerActivite: (activiteId: ActiviteId) => Promise<void>
  updateActivite: (
    activiteId: ActiviteId,
    activiteTypeId: ActivitesTypesId,
    sectionsWithValue: DeepReadonly<SectionWithValue[]>,
    activiteDocumentIds: ActiviteDocumentId[],
    newTempDocuments: TempActiviteDocument[]
  ) => Promise<void>
}

type GetActivitesParams = {
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
              titulaireIds
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
  getActivite: async (activiteIdOrSlug: ActiviteIdOrSlug) => {
    return getWithJson('/rest/activites/:activiteId', {
      activiteId: activiteIdOrSlug,
    })
  },
  deposerActivite: async (activiteId: ActiviteId) => {
    await apiGraphQLFetch(gql`
      mutation ActiviteDeposer($id: ID!) {
        activiteDeposer(id: $id) {
          id
        }
      }
    `)({ id: activiteId })
  },
  supprimerActivite: async (activiteId: ActiviteId) => {
    return deleteWithJson('/rest/activites/:activiteId', {
      activiteId,
    })
  },
  updateActivite: async (
    activiteId: ActiviteId,
    _activiteTypeId: ActivitesTypesId,
    sectionsWithValue: DeepReadonly<SectionWithValue[]>,
    activiteDocumentIds: ActiviteDocumentId[],
    newTempDocuments: TempActiviteDocument[]
  ) => {
    return putWithJson(
      '/rest/activites/:activiteId',
      {
        activiteId,
      },
      {
        sectionsWithValue,
        activiteDocumentIds,
        newTempDocuments,
      }
    )
  },
}
