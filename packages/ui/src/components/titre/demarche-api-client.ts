import { apiGraphQLFetch } from '@/api/_client'
import { getWithJson } from '@/api/client-rest'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { DemarcheGet, DemarcheId } from 'camino-common/src/demarche'
import gql from 'graphql-tag'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { ReferenceTypeId } from 'camino-common/src/static/referencesTypes'
import { TitreId } from 'camino-common/src/titres'
import { DomaineId, domainesIds } from 'camino-common/src/static/domaines'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'

export interface InputDemarcheCreation {
  titreId: string
  typeId: DemarcheTypeId
  description: string
}

export type InputDemarcheUpdation = InputDemarcheCreation & {
  id: DemarcheId
}

export interface GetDemarchesParams {
  page?: number
  colonne?: string
  ordre?: 'asc' | 'desc'
  travaux: boolean
  titreIds?: TitreId[]
  typesIds?: TitreTypeTypeId[]
  domainesIds?: DomaineId[]
  statutsIds?: TitreStatutId[]
  entreprisesIds?: EntrepriseId[]
  substancesIds?: SubstanceLegaleId[]
  references?: string
  titresTerritoires?: string
  demarchesTypesIds?: DemarcheTypeId[]
  demarchesStatutsIds?: DemarcheStatutId[]
}

export interface GetDemarchesDemarche {
  id: DemarcheId | string
  typeId: DemarcheTypeId
  statutId: DemarcheStatutId
  titre: {
    slug: string
    titreStatutId: TitreStatutId
    typeId: TitreTypeId
    nom: string
    references: { referenceTypeId: ReferenceTypeId; nom: string }[]
  }
}
export interface DemarcheApiClient {
  createDemarche: (demarche: InputDemarcheCreation) => Promise<void>
  updateDemarche: (demarche: InputDemarcheUpdation) => Promise<void>
  deleteDemarche: (demarcheId: DemarcheId) => Promise<void>
  getDemarche: (demarcheId: DemarcheId) => Promise<DemarcheGet>
  getDemarches: (params: GetDemarchesParams) => Promise<{ elements: GetDemarchesDemarche[]; total: number }>
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
  getDemarches: async (params: GetDemarchesParams) => {
    const data = await apiGraphQLFetch(gql`
      query Demarches(
        $page: Int
        $colonne: String
        $ordre: String
        $typesIds: [ID!]
        $statutsIds: [ID!]
        $etapesInclues: [InputEtapeFiltre!]
        $etapesExclues: [InputEtapeFiltre!]
        $domainesIds: [ID!]
        $demarchesTypesIds: [ID!]
        $demarchesStatutsIds: [ID!]
        $titresIds: [String]
        $entreprisesIds: [String]
        $substancesIds: [String]
        $references: String
        $titresTerritoires: String
        $travaux: Boolean
      ) {
        demarches(
          page: $page
          intervalle: 10
          colonne: $colonne
          ordre: $ordre
          typesIds: $demarchesTypesIds
          statutsIds: $demarchesStatutsIds
          etapesInclues: $etapesInclues
          etapesExclues: $etapesExclues
          titresDomainesIds: $domainesIds
          titresTypesIds: $typesIds
          titresStatutsIds: $statutsIds
          titresIds: $titresIds
          titresEntreprisesIds: $entreprisesIds
          titresSubstancesIds: $substancesIds
          titresReferences: $references
          titresTerritoires: $titresTerritoires
          travaux: $travaux
        ) {
          elements {
            id
            typeId
            statutId
            titre {
              slug
              titreStatutId
              typeId
              nom
              references {
                referenceTypeId
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
