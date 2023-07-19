import { EditableTitre, Section, TitreGet, TitreId } from 'camino-common/src/titres'
import { deleteWithJson, getWithJson, postWithJson } from '../../api/client-rest'
import { CaminoDate } from 'camino-common/src/date'
import { Commune } from 'camino-common/src/static/communes'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { apiGraphQLFetch } from '@/api/_client'
import gql from 'graphql-tag'
import { fragmentTitres } from '@/api/fragments/titre'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'

export interface TitreApiClient {
  loadTitreSections: (titreId: TitreId) => Promise<Section[]>
  removeTitre: (titreId: TitreId) => Promise<void>
  titreUtilisateurAbonne: (titreId: TitreId, abonne: boolean) => Promise<void>
  editTitre: (titre: EditableTitre) => Promise<void>
  getTitreById: (titreId: TitreId) => Promise<TitreGet>
  getLastModifiedDate: (titreId: TitreId) => Promise<CaminoDate | null>
  getTitreCommunes: (titreId: TitreId) => Promise<Commune[]>
  getTitresMetas: () => Promise<Pick<Entreprise, 'id' | 'nom'>[]>
  getTitresForTable: (params: {
    page?: number
    colonne?: string
    ordre?: 'asc' | 'desc'
    titresIds: TitreId[]
    typesIds: TitreTypeId[]
    domainesIds: DomaineId[]
    statutsIds: TitreStatutId[]
    substancesIds: SubstanceLegaleId[]
    // noms
    entreprisesIds: EntrepriseId[]
    // references
    communes: string
    // departements
    // regions
    // facadesMaritimes
  }) => Promise<{ elements: any[]; total: number }>
}

export const titreApiClient: TitreApiClient = {
  loadTitreSections: async (titreId: TitreId): Promise<Section[]> => {
    return getWithJson('/rest/titreSections/:titreId', { titreId })
  },
  removeTitre: async (titreId: TitreId): Promise<void> => {
    return deleteWithJson('/rest/titres/:titreId', { titreId })
  },
  titreUtilisateurAbonne: async (titreId: TitreId, abonne: boolean): Promise<void> => {
    return postWithJson('/rest/titres/:titreId/abonne', { titreId }, { abonne })
  },
  editTitre: (titre: EditableTitre): Promise<void> => {
    return postWithJson('/rest/titres/:titreId', { titreId: titre.id }, titre)
  },
  getTitreById: (titreId: TitreId): Promise<TitreGet> => {
    return getWithJson('/rest/titres/:titreId', { titreId })
  },
  getLastModifiedDate: (titreId: TitreId): Promise<CaminoDate | null> => {
    return getWithJson('/rest/titres/:titreId/date', { titreId })
  },
  getTitreCommunes: (id: TitreId): Promise<Commune[]> => {
    return getWithJson('/rest/titres/:id/communes', { id })
  },
  getTitresMetas: async () => {
    const { elements } = await apiGraphQLFetch(
      gql`
        query TitresMetas {
          entreprises {
            elements {
              id
              nom
            }
          }
        }
      `
    )()
    return elements
  },
  getTitresForTable: async params => {
    const { elements, total } = await apiGraphQLFetch(
      gql`
        query Titres(
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
            intervalle: 10
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
              ...titres
            }
            total
          }
        }

        ${fragmentTitres}
      `
    )(params)
    return { elements, total }
  },
}
