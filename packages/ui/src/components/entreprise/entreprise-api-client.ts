import { uploadCall } from '@/api/_upload'
import { deleteWithJson, getWithJson, postWithJson, putWithJson } from '@/api/client-rest'
import { CaminoAnnee } from 'camino-common/src/date'
import { EntrepriseId, EntrepriseType, Siren, EntrepriseDocument, DocumentId, entrepriseDocumentInputValidator, documentIdValidator } from 'camino-common/src/entreprise'
import { Fiscalite } from 'camino-common/src/fiscalite'
import { z } from 'zod'

export interface EntrepriseApiClient {
  getFiscaliteEntreprise: (annee: CaminoAnnee, entrepriseId: string) => Promise<Fiscalite>
  modifierEntreprise: (entreprise: { id: EntrepriseId; telephone?: string; email?: string; url?: string; archive?: boolean }) => Promise<void>
  creerEntreprise: (siren: Siren) => Promise<void>
  getEntreprise: (id: EntrepriseId) => Promise<EntrepriseType>
  getEntrepriseDocuments: (id: EntrepriseId) => Promise<EntrepriseDocument[]>
  creerEntrepriseDocument: (entrepriseId: EntrepriseId, entrepriseDocumentInput: UiEntrepriseDocumentInput) => Promise<DocumentId>
  deleteEntrepriseDocument: (entrepriseId: EntrepriseId, documentId: DocumentId) => Promise<void>
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
  creerEntrepriseDocument: async (entrepriseId: EntrepriseId, uiEntrepriseDocumentInput: UiEntrepriseDocumentInput): Promise<DocumentId> => {
    const tempDocumentName = await uploadCall(uiEntrepriseDocumentInput.document, _progress => {})

    const { document, ...entrepriseDocumentInput } = uiEntrepriseDocumentInput

    const createDocument = await postWithJson('/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...entrepriseDocumentInput, tempDocumentName })
    const parsed = documentIdValidator.safeParse(createDocument)
    if (parsed.success) {
      return parsed.data
    } else {
      throw createDocument
    }
  },
  deleteEntrepriseDocument: async (entrepriseId: EntrepriseId, documentId: DocumentId): Promise<void> => {
    return deleteWithJson('/rest/entreprises/:entrepriseId/documents/:documentId', { entrepriseId, documentId })
  },
}
