import { apiGraphQLFetch } from '@/api/_client'
import { getWithJson } from '@/api/client-rest'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { DemarcheGet, DemarcheId } from 'camino-common/src/demarche'
import gql from 'graphql-tag'

export interface InputDemarcheCreation {
  titreId: string
  typeId: DemarcheTypeId
  description: string
}

export type InputDemarcheUpdation = InputDemarcheCreation & {
  id: DemarcheId
}

export interface DemarcheApiClient {
  createDemarche: (demarche: InputDemarcheCreation) => Promise<void>
  updateDemarche: (demarche: InputDemarcheUpdation) => Promise<void>
  deleteDemarche: (demarcheId: DemarcheId) => Promise<void>
  getDemarche: (demarcheId: DemarcheId) => Promise<DemarcheGet>
}

export const demarcheApiClient: DemarcheApiClient = {
  createDemarche: async (demarche): Promise<void> => {
    await apiGraphQLFetch(gql`
      mutation DemarcheCreer($demarche: InputDemarcheCreation!) {
        demarcheCreer(demarche: $demarche) {
          slug
        }
      }
    `)({
      demarche,
    })
  },

  updateDemarche: async (demarche): Promise<void> => {
    await apiGraphQLFetch(gql`
      mutation DemarcheModifier($demarche: InputDemarcheModification!) {
        demarcheModifier(demarche: $demarche) {
          slug
        }
      }
    `)({
      demarche,
    })
  },

  deleteDemarche: async (demarcheId: string): Promise<void> => {
    await apiGraphQLFetch(gql`
      mutation DemarcheSupprimer($id: ID!) {
        demarcheSupprimer(id: $id) {
          slug
        }
      }
    `)({ id: demarcheId })
  },
  getDemarche: (demarcheId: DemarcheId): Promise<DemarcheGet> => {
    return getWithJson('/rest/demarches/:demarcheId', { demarcheId })
  },
}
