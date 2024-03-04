import { EditableTitre, TitreDemande, TitreGet } from 'camino-common/src/titres'
import { TitreId, TitreIdOrSlug } from 'camino-common/src/validators/titres'
import { deleteWithJson, getWithJson, postWithJson } from '../../api/client-rest'
import { CaminoDate } from 'camino-common/src/date'
import { CommuneId } from 'camino-common/src/static/communes'
import { Entreprise, EntrepriseId } from 'camino-common/src/entreprise'
import { apiGraphQLFetch } from '@/api/_client'
import gql from 'graphql-tag'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DomaineId } from 'camino-common/src/static/domaines'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { DepartementId } from 'camino-common/src/static/departement'
import { RegionId } from 'camino-common/src/static/region'
import { FacadesMaritimes, SecteursMaritimes } from 'camino-common/src/static/facades'
import { ReferenceTypeId } from 'camino-common/src/static/referencesTypes'
import { TitreWithPerimetre } from '../titres/mapUtil'
import { EtapeId } from 'camino-common/src/etape'

export type TitreForTable = {
  id: TitreId
  slug: string
  nom: string
  typeId: TitreTypeId
  titreStatutId: TitreStatutId
  substances: SubstanceLegaleId[]
  activitesEnConstruction: number | null
  activitesAbsentes: number | null
  titulaires: {
    id: EntrepriseId
    nom: string
  }[]
  communes?: { id: CommuneId }[]
  secteursMaritime?: SecteursMaritimes[]
  references?: { referenceTypeId: ReferenceTypeId; nom: string }[]
}

export type TitreForTitresRerchercherByNom = {
  id: TitreId
  nom: string
  typeId: TitreTypeId
  demarches: { demarcheDateDebut: CaminoDate | null }[]
}
export interface TitreApiClient {
  removeTitre: (titreId: TitreId) => Promise<void>
  titreUtilisateurAbonne: (titreId: TitreId, abonne: boolean) => Promise<void>
  getTitreUtilisateurAbonne: (titreId: TitreId) => Promise<boolean>
  editTitre: (titre: EditableTitre) => Promise<void>
  getTitreById: (titreId: TitreIdOrSlug) => Promise<TitreGet>
  getTitresForTable: (params: {
    page?: number
    colonne?: string
    ordre?: 'asc' | 'desc'
    titresIds: TitreId[]
    typesIds: TitreTypeTypeId[]
    domainesIds: DomaineId[]
    statutsIds: TitreStatutId[]
    substancesIds: SubstanceLegaleId[]
    // noms
    entreprisesIds: EntrepriseId[]
    references: string
    communes: string
    departements: DepartementId[]
    regions: RegionId[]
    facadesMaritimes: FacadesMaritimes[]
  }) => Promise<{ elements: TitreForTable[]; total: number }>
  getTitresForCarte: (params: {
    page?: number
    colonne?: string
    ordre?: 'asc' | 'desc'
    titresIds: TitreId[]
    typesIds: TitreTypeTypeId[]
    domainesIds: DomaineId[]
    statutsIds: TitreStatutId[]
    substancesIds: SubstanceLegaleId[]
    // noms
    entreprisesIds: EntrepriseId[]
    references: string
    communes: string
    departements: DepartementId[]
    regions: RegionId[]
    facadesMaritimes: FacadesMaritimes[]
    perimetre?: [number, number, number, number]
  }) => Promise<{ elements: TitreWithPerimetre[]; total: number }>
  getTitresWithPerimetreForCarte: (params: {
    page?: number
    colonne?: string
    ordre?: 'asc' | 'desc'
    titresIds: TitreId[]
    typesIds: TitreTypeTypeId[]
    domainesIds: DomaineId[]
    statutsIds: TitreStatutId[]
    substancesIds: SubstanceLegaleId[]
    // noms
    entreprisesIds: EntrepriseId[]
    references: string
    communes: string
    departements: DepartementId[]
    regions: RegionId[]
    facadesMaritimes: FacadesMaritimes[]
    perimetre?: [number, number, number, number]
  }) => Promise<{ elements: TitreWithPerimetre[]; total: number }>
  titresRechercherByNom: (nom: string) => Promise<{ elements: TitreForTitresRerchercherByNom[] }>
  getTitresByIds: (titreIds: TitreId[], cacheKey: string) => Promise<{ elements: Pick<TitreForTable, 'id' | 'nom'>[] }>
  createTitre: (titreDemande: TitreDemande) => Promise<EtapeId>
}

export const titreApiClient: TitreApiClient = {
  removeTitre: async (titreId: TitreId): Promise<void> => {
    return deleteWithJson('/rest/titres/:titreId', { titreId })
  },
  titreUtilisateurAbonne: async (titreId: TitreId, abonne: boolean): Promise<void> => {
    return postWithJson('/rest/titres/:titreId/abonne', { titreId }, { abonne })
  },
  getTitreUtilisateurAbonne: async (titreId: TitreId): Promise<boolean> => {
    return getWithJson('/rest/titres/:titreId/abonne', { titreId })
  },
  editTitre: (titre: EditableTitre): Promise<void> => {
    return postWithJson('/rest/titres/:titreId', { titreId: titre.id }, titre)
  },
  getTitreById: (titreId: TitreIdOrSlug): Promise<TitreGet> => {
    return getWithJson('/rest/titres/:titreId', { titreId })
  },
  getTitresForTable: async params => {
    const { elements, total } = await apiGraphQLFetch(
      gql`
        query TitresForTable(
          $page: Int
          $colonne: String
          $ordre: String
          $titresIds: [ID!]
          $typesIds: [ID!]
          $domainesIds: [ID!]
          $statutsIds: [ID!]
          $substancesIds: [ID!]
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
              titulaires {
                id
                nom
              }
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
      `
    )(params)
    return { elements, total }
  },
  getTitresForCarte: async params => {
    // TODO 2023-07-20 si zoom > 7 alors autre appel
    const result = await apiGraphQLFetch(
      gql`
        query TitresForCarte(
          $titresIds: [ID!]
          $typesIds: [ID!]
          $domainesIds: [ID!]
          $statutsIds: [ID!]
          $substancesIds: [ID!]
          $entreprisesIds: [ID!]
          $references: String
          $communes: String
          $departements: [String]
          $regions: [String]
          $facadesMaritimes: [String]
          $perimetre: [Float!]
        ) {
          titres(
            ids: $titresIds
            typesIds: $typesIds
            domainesIds: $domainesIds
            statutsIds: $statutsIds
            substancesIds: $substancesIds
            entreprisesIds: $entreprisesIds
            references: $references
            communes: $communes
            departements: $departements
            regions: $regions
            facadesMaritimes: $facadesMaritimes
            perimetre: $perimetre
            demandeEnCours: true
          ) {
            elements {
              id
              slug
              nom
              typeId
              titreStatutId
              titulaires {
                id
                nom
              }
              amodiataires {
                id
                nom
              }
              geojson4326Centre
            }
            total
          }
        }
      `
    )(params)
    return result
  },
  getTitresWithPerimetreForCarte: async params => {
    const result = await apiGraphQLFetch(
      gql`
        query TitresWithPerimetreForCarte(
          $titresIds: [ID!]
          $typesIds: [ID!]
          $domainesIds: [ID!]
          $statutsIds: [ID!]
          $substancesIds: [ID!]
          $entreprisesIds: [ID!]
          $references: String
          $communes: String
          $departements: [String]
          $regions: [String]
          $facadesMaritimes: [String]
          $perimetre: [Float!]
        ) {
          titres(
            ids: $titresIds
            typesIds: $typesIds
            domainesIds: $domainesIds
            statutsIds: $statutsIds
            substancesIds: $substancesIds
            entreprisesIds: $entreprisesIds
            references: $references
            communes: $communes
            departements: $departements
            regions: $regions
            facadesMaritimes: $facadesMaritimes
            perimetre: $perimetre
            demandeEnCours: true
          ) {
            elements {
              id
              slug
              nom
              typeId
              titreStatutId
              titulaires {
                id
                nom
              }
              amodiataires {
                id
                nom
              }

              geojson4326Centre
              geojson4326Perimetre
            }
            total
          }
        }
      `
    )(params)
    return result
  },
  titresRechercherByNom: async noms => {
    const result = await apiGraphQLFetch(
      gql`
        query TitresRechercherByNom($noms: String) {
          titres(intervalle: 20, noms: $noms) {
            elements {
              id
              nom
              typeId
              demarches {
                demarcheDateDebut
              }
            }
          }
        }
      `
    )({ noms })
    return result
  },

  getTitresByIds: async (titresIds, cacheKey) => {
    const result = await apiGraphQLFetch(
      gql`
        query TitresById($titresIds: [ID!]) {
          titres(ids: $titresIds) {
            elements {
              id
              nom
            }
          }
        }
      `,
      cacheKey
    )({ titresIds })
    return result
  },

  createTitre: async titreDemande => {
    return postWithJson('/rest/titres', {}, titreDemande)
  },
}
