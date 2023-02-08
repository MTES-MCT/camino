import { apiGraphQLFetch } from '@/api/_client'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import gql from 'graphql-tag'

export interface InputDemarcheCreation {
  titreId: string, typeId: DemarcheTypeId, description: string
}


export type InputDemarcheUpdation = InputDemarcheCreation & {
  id: string
}


export interface DemarcheApiClient {
  createDemarche: (demarche: InputDemarcheCreation) => Promise<void>
  updateDemarche: (demarche: InputDemarcheUpdation) => Promise<void>
}

export const demarcheApiClient: DemarcheApiClient = {

  createDemarche: async (demarche): Promise<void> => {
    await apiGraphQLFetch(gql`
    mutation DemarcheCreer($demarche: InputDemarcheCreation!) {
      demarcheCreer(demarche: $demarche) {
        slug
      }
    }`)({
          demarche
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
          demarche
        })
  } 
}
