import { apiGraphQLFetch } from '@/api/_client'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { DemarcheCreationInput, DemarcheCreationOutput, DemarcheId, DemarcheIdOrSlug, DemarcheSlug } from 'camino-common/src/demarche'
import gql from 'graphql-tag'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { ReferenceTypeId } from 'camino-common/src/static/referencesTypes'
import { GetDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { TitreId } from 'camino-common/src/validators/titres'
import { DomaineId } from 'camino-common/src/static/domaines'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { deleteWithJson, getWithJson, newPostWithJson } from '../../api/client-rest'
import { DeepReadonly } from 'vue'
import { CaminoError } from 'camino-common/src/zod-tools'

type InputDemarcheUpdation = DemarcheCreationInput & {
  id: DemarcheId
}

interface GetDemarchesParams {
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
  slug: DemarcheSlug
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
  createDemarche: (demarche: DemarcheCreationInput) => Promise<DemarcheCreationOutput | CaminoError<string>>
  updateDemarche: (demarche: InputDemarcheUpdation) => Promise<DemarcheSlug>
  deleteDemarche: (demarcheId: DemarcheId) => Promise<void>
  getDemarcheByIdOrSlug: (demarcheIdOrSlug: DemarcheIdOrSlug) => Promise<DeepReadonly<GetDemarcheByIdOrSlugValidator>>
  getDemarches: (params: GetDemarchesParams) => Promise<{ elements: GetDemarchesDemarche[]; total: number }>
}

export const demarcheApiClient: DemarcheApiClient = {
  createDemarche: async (demarche): Promise<DemarcheCreationOutput | CaminoError<string>> => {
    return newPostWithJson('/rest/demarches', {}, demarche)
  },

  updateDemarche: async (demarche): Promise<DemarcheSlug> => {
    const value = await apiGraphQLFetch(gql`
      mutation DemarcheModifier($demarche: InputDemarcheModification!) {
        demarcheModifier(demarche: $demarche) {
          slug
        }
      }
    `)({
      demarche,
    })

    return value.slug
  },

  deleteDemarche: async (demarcheIdOrSlug: DemarcheId): Promise<void> => {
    await deleteWithJson('/rest/demarches/:demarcheIdOrSlug', { demarcheIdOrSlug })
  },

  getDemarcheByIdOrSlug: async (demarcheIdOrSlug: DemarcheIdOrSlug) => {
    return getWithJson('/rest/demarches/:demarcheIdOrSlug', { demarcheIdOrSlug })
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
        $travauxTypesIds: [ID!]
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
          travauxTypesIds: $travauxTypesIds
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
            slug
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
