import { getWithJson, newDeleteWithJson, newGetWithJson, newPostWithJson, newPutWithJson, postWithJson } from '@/api/client-rest'
import { CaminoAnnee } from 'camino-common/src/date'
import { EntrepriseId, EntrepriseType, Siren, EtapeEntrepriseDocument, entrepriseDocumentInputValidator, EntrepriseDocumentId, EntrepriseDocument } from 'camino-common/src/entreprise'
import { TempDocumentName } from 'camino-common/src/document'
import { EtapeId } from 'camino-common/src/etape'
import { Fiscalite } from 'camino-common/src/validators/fiscalite'
import { z } from 'zod'
import { CaminoError } from 'camino-common/src/zod-tools'

export interface EntrepriseApiClient {
  getFiscaliteEntreprise: (annee: CaminoAnnee, entrepriseId: EntrepriseId) => Promise<Fiscalite>
  modifierEntreprise: (entreprise: { id: EntrepriseId; telephone?: string; email?: string; url?: string; archive?: boolean }) => Promise<CaminoError<string> | { id: EntrepriseId }>
  creerEntreprise: (siren: Siren) => Promise<void>
  getEntreprise: (id: EntrepriseId) => Promise<EntrepriseType | CaminoError<string>>
  getEntrepriseDocuments: (id: EntrepriseId) => Promise<EntrepriseDocument[] | CaminoError<string>>
  getEtapeEntrepriseDocuments: (etapeId: EtapeId) => Promise<EtapeEntrepriseDocument[]>
  creerEntrepriseDocument: (
    entrepriseId: EntrepriseId,
    entrepriseDocumentInput: UiEntrepriseDocumentInput,
    tempDocumentName: TempDocumentName
  ) => Promise<{ id: EntrepriseDocumentId } | CaminoError<string>>
  deleteEntrepriseDocument: (entrepriseId: EntrepriseId, documentId: EntrepriseDocumentId) => Promise<CaminoError<string> | void>
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
  modifierEntreprise: async (entreprise): Promise<CaminoError<string> | { id: EntrepriseId }> => {
    return newPutWithJson('/rest/entreprises/:entrepriseId', { entrepriseId: entreprise.id }, entreprise)
  },
  creerEntreprise: async (siren: Siren): Promise<void> => {
    return postWithJson('/rest/entreprises', {}, { siren })
  },
  getEntreprise: async (entrepriseId: EntrepriseId): Promise<EntrepriseType | CaminoError<string>> => {
    return newGetWithJson('/rest/entreprises/:entrepriseId', {
      entrepriseId,
    })
  },
  getEntrepriseDocuments: async (entrepriseId: EntrepriseId): Promise<EntrepriseDocument[] | CaminoError<string>> => {
    return newGetWithJson('/rest/entreprises/:entrepriseId/documents', {
      entrepriseId,
    })
  },
  getEtapeEntrepriseDocuments: async (etapeId: EtapeId): Promise<EtapeEntrepriseDocument[]> => {
    return getWithJson('/rest/etapes/:etapeId/entrepriseDocuments', {
      etapeId,
    })
  },
  creerEntrepriseDocument: async (
    entrepriseId: EntrepriseId,
    uiEntrepriseDocumentInput: UiEntrepriseDocumentInput,
    tempDocumentName: TempDocumentName
  ): Promise<{ id: EntrepriseDocumentId } | CaminoError<string>> => {
    return newPostWithJson('/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...uiEntrepriseDocumentInput, tempDocumentName })
  },
  deleteEntrepriseDocument: async (entrepriseId: EntrepriseId, entrepriseDocumentId: EntrepriseDocumentId): Promise<CaminoError<string> | void> => {
    return newDeleteWithJson('/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId', { entrepriseId, entrepriseDocumentId })
  },
}
