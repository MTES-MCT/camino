import { uploadCall } from '@/api/_upload'
import { deleteWithJson, getWithJson, postWithJson, putWithJson } from '@/api/client-rest'
import { CaminoAnnee } from 'camino-common/src/date'
import {
  EntrepriseId,
  EntrepriseType,
  Siren,
  EntrepriseDocument,
  EtapeEntrepriseDocument,
  entrepriseDocumentInputValidator,
  EntrepriseDocumentId,
  entrepriseDocumentIdValidator,
} from 'camino-common/src/entreprise'
import { EtapeId } from 'camino-common/src/etape'
import { Fiscalite } from 'camino-common/src/fiscalite'
import { z } from 'zod'

export interface EntrepriseApiClient {
  getFiscaliteEntreprise: (annee: CaminoAnnee, entrepriseId: EntrepriseId) => Promise<Fiscalite>
  modifierEntreprise: (entreprise: { id: EntrepriseId; telephone?: string; email?: string; url?: string; archive?: boolean }) => Promise<void>
  creerEntreprise: (siren: Siren) => Promise<void>
  getEntreprise: (id: EntrepriseId) => Promise<EntrepriseType>
  getEntrepriseDocuments: (id: EntrepriseId) => Promise<EntrepriseDocument[]>
  getEtapeEntrepriseDocuments: (etapeId: EtapeId) => Promise<EtapeEntrepriseDocument[]>
  creerEntrepriseDocument: (entrepriseId: EntrepriseId, entrepriseDocumentInput: UiEntrepriseDocumentInput) => Promise<EntrepriseDocumentId>
  deleteEntrepriseDocument: (entrepriseId: EntrepriseId, documentId: EntrepriseDocumentId) => Promise<void>
}
export const uiEntrepriseDocumentInputValidator = entrepriseDocumentInputValidator.omit({ tempDocumentName: true }).extend({
  document: z.instanceof(File),
})

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
  creerEntrepriseDocument: async (entrepriseId: EntrepriseId, uiEntrepriseDocumentInput: UiEntrepriseDocumentInput): Promise<EntrepriseDocumentId> => {
    const tempDocumentName = await uploadCall(uiEntrepriseDocumentInput.document, _progress => {})

    const { document, ...entrepriseDocumentInput } = uiEntrepriseDocumentInput

    const createDocument = await postWithJson('/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...entrepriseDocumentInput, tempDocumentName })
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
}
