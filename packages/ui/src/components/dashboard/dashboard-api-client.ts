import { apiGraphQLFetch } from '@/api/_client'
import { getWithJson } from '@/api/client-rest'
import { EntrepriseId, TitreEntreprise } from 'camino-common/src/entreprise'
import { StatistiquesDGTM } from 'camino-common/src/statistiques'
import { CommonTitreAdministration } from 'camino-common/src/titres'
import gql from 'graphql-tag'

export interface DashboardApiClient {
  getAdministrationTitres: () => Promise<CommonTitreAdministration[]>
  getDgtmStats: () => Promise<StatistiquesDGTM>
  getEntreprisesTitres: (entreprisesIds: EntrepriseId[]) => Promise<TitreEntreprise[]>
}
const titres = apiGraphQLFetch(gql`
  query Titres(
    $intervalle: Int
    $page: Int
    $colonne: String
    $ordre: String
    $titresIds: [ID!]
    $typesIds: [ID!]
    $domainesIds: [ID!]
    $statutsIds: [ID!]
    $substancesIds: [ID!]
    $noms: String
    $entreprisesIds: [ID!]
    $references: String
    $communes: String
    $departements: [String]
    $regions: [String]
    $facadesMaritimes: [String]
  ) {
    titres(
      intervalle: $intervalle
      page: $page
      colonne: $colonne
      ordre: $ordre
      ids: $titresIds
      typesIds: $typesIds
      domainesIds: $domainesIds
      statutsIds: $statutsIds
      substancesIds: $substancesIds
      noms: $noms
      entreprisesIds: $entreprisesIds
      references: $references
      communes: $communes
      departements: $departements
      regions: $regions
      facadesMaritimes: $facadesMaritimes
    ) {
      elements {
        id
        slug
        nom
        typeId
        titreStatutId
        substances
        activitesEnConstruction
        activitesAbsentes
        titulaireIds
        communes {
          id
        }
        secteursMaritime
        references {
          referenceTypeId
          nom
        }
      }
      total
    }
  }
`)

export const dashboardApiClient: DashboardApiClient = {
  getAdministrationTitres: async (): Promise<CommonTitreAdministration[]> => getWithJson('/rest/titresAdministrations', {}),
  getDgtmStats: async (): Promise<StatistiquesDGTM> => getWithJson('/rest/statistiques/dgtm', {}),
  getEntreprisesTitres: async (entreprisesIds: EntrepriseId[]) => {
    return (await titres({ entreprisesIds })).elements
  },
}
