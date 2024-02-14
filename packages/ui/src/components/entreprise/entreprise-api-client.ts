import { apiGraphQLFetch } from '@/api/_client'
import { deleteWithJson, getWithJson, postWithJson, putWithJson } from '@/api/client-rest'
import { CaminoAnnee } from 'camino-common/src/date'
import {
  EntrepriseId,
  EntrepriseType,
  Siren,
  EtapeEntrepriseDocument,
  entrepriseDocumentInputValidator,
  EntrepriseDocumentId,
  entrepriseDocumentIdValidator,
  EntrepriseDocument,
  Entreprise,
} from 'camino-common/src/entreprise'
import { TempDocumentName } from 'camino-common/src/document'
import { EtapeId } from 'camino-common/src/etape'
import { Fiscalite } from 'camino-common/src/validators/fiscalite'
import gql from 'graphql-tag'
import { z } from 'zod'

type GetEntreprisesParams = {
  page: number
  colonne: string
  ordre: 'asc' | 'desc'
  nomsEntreprise: string
}

export type GetEntreprisesEntreprise = Pick<EntrepriseType, 'id' | 'nom'> & { legalEtranger: string | null; legalSiren: string | null }
export interface EntrepriseApiClient {
  getFiscaliteEntreprise: (annee: CaminoAnnee, entrepriseId: EntrepriseId) => Promise<Fiscalite>
  modifierEntreprise: (entreprise: { id: EntrepriseId; telephone?: string; email?: string; url?: string; archive?: boolean }) => Promise<void>
  creerEntreprise: (siren: Siren) => Promise<void>
  getEntreprise: (id: EntrepriseId) => Promise<EntrepriseType>
  getFilteredEntreprises: (params: GetEntreprisesParams) => Promise<{ total: number; elements: GetEntreprisesEntreprise[] }>
  getEntrepriseDocuments: (id: EntrepriseId) => Promise<EntrepriseDocument[]>
  getEtapeEntrepriseDocuments: (etapeId: EtapeId) => Promise<EtapeEntrepriseDocument[]>
  creerEntrepriseDocument: (entrepriseId: EntrepriseId, entrepriseDocumentInput: UiEntrepriseDocumentInput, tempDocumentName: TempDocumentName) => Promise<EntrepriseDocumentId>
  deleteEntrepriseDocument: (entrepriseId: EntrepriseId, documentId: EntrepriseDocumentId) => Promise<void>
  getEntreprises: () => Promise<Entreprise[]>
}
export const uiEntrepriseDocumentInputValidator = entrepriseDocumentInputValidator.omit({ tempDocumentName: true })

type UiEntrepriseDocumentInput = z.infer<typeof uiEntrepriseDocumentInputValidator>

export const entrepriseApiClient: EntrepriseApiClient = {
  getFiscaliteEntreprise: async (annee, entrepriseId): Promise<Fiscalite> => {
    return getWithJson('/rest/entreprises/:entrepriseId/fiscalite/:annee', {
      annee,
      entrepriseId,
    })
  },
  modifierEntreprise: async (entreprise): Promise<void> => {
    return putWithJson('/rest/entreprises/:entrepriseId', { entrepriseId: entreprise.id }, entreprise)
  },
  creerEntreprise: async (siren: Siren): Promise<void> => {
    return postWithJson('/rest/entreprises', {}, { siren })
  },
  getEntreprise: async (entrepriseId: EntrepriseId): Promise<EntrepriseType> => {
    return getWithJson('/rest/entreprises/:entrepriseId', {
      entrepriseId,
    })
  },
  getFilteredEntreprises: async params => {
    const values = await apiGraphQLFetch(gql`
      query Entreprises($page: Int, $colonne: String, $ordre: String, $nomsEntreprise: String) {
        entreprises(intervalle: 10, page: $page, colonne: $colonne, ordre: $ordre, noms: $nomsEntreprise) {
          elements {
            id
            nom
            legalSiren
            legalEtranger
          }
          total
        }
      }
    `)(params)
    return values
  },
  getEntrepriseDocuments: async (entrepriseId: EntrepriseId): Promise<EntrepriseDocument[]> => {
    return getWithJson('/rest/entreprises/:entrepriseId/documents', {
      entrepriseId,
    })
  },
  getEtapeEntrepriseDocuments: async (etapeId: EtapeId): Promise<EtapeEntrepriseDocument[]> => {
    return getWithJson('/rest/etapes/:etapeId/entrepriseDocuments', {
      etapeId,
    })
  },
  creerEntrepriseDocument: async (entrepriseId: EntrepriseId, uiEntrepriseDocumentInput: UiEntrepriseDocumentInput, tempDocumentName: TempDocumentName): Promise<EntrepriseDocumentId> => {
    const createDocument = await postWithJson('/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...uiEntrepriseDocumentInput, tempDocumentName })
    const parsed = entrepriseDocumentIdValidator.safeParse(createDocument)
    if (parsed.success) {
      return parsed.data
    } else {
      throw createDocument
    }
  },
  deleteEntrepriseDocument: async (entrepriseId: EntrepriseId, entrepriseDocumentId: EntrepriseDocumentId): Promise<void> => {
    return deleteWithJson('/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId', { entrepriseId, entrepriseDocumentId })
  },
  getEntreprises: async (): Promise<Entreprise[]> => {
    return getWithJson('/rest/entreprises', {})
  },
}
