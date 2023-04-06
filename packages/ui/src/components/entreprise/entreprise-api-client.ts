import { uploadCall } from '@/api/_upload'
import { fetchWithJson, postWithJson } from '@/api/client-rest'
import { CaminoAnnee } from 'camino-common/src/date'
import { EntrepriseId, EntrepriseType, Siren, EntrepriseDocument, DocumentId, EntrepriseDocumentInput, entrepriseDocumentInputValidator } from 'camino-common/src/entreprise'
import { Fiscalite } from 'camino-common/src/fiscalite'
import { CaminoRestRoutes } from 'camino-common/src/rest'
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
    return fetchWithJson(CaminoRestRoutes.fiscaliteEntreprise, {
      annee,
      entrepriseId,
    })
  },
  modifierEntreprise: async (entreprise): Promise<void> => {
    return postWithJson(CaminoRestRoutes.entreprise, { entrepriseId: entreprise.id }, entreprise, 'put')
  },
  creerEntreprise: async (siren: Siren): Promise<void> => {
    return postWithJson(CaminoRestRoutes.entreprises, {}, { siren })
  },
  getEntreprise: async (entrepriseId: EntrepriseId): Promise<EntrepriseType> => {
    return fetchWithJson(CaminoRestRoutes.entreprise, {
      entrepriseId,
    })
  },
  getEntrepriseDocuments: async (entrepriseId: EntrepriseId): Promise<EntrepriseDocument[]> => {
    return fetchWithJson(CaminoRestRoutes.entrepriseDocuments, {
      entrepriseId,
    })
  },
  creerEntrepriseDocument: async (entrepriseId: EntrepriseId, uiEntrepriseDocumentInput: UiEntrepriseDocumentInput): Promise<DocumentId> => {
    const tempDocumentName = await uploadCall(uiEntrepriseDocumentInput.document, _progress => {})

    const { document, ...entrepriseDocumentInput } = uiEntrepriseDocumentInput

    return postWithJson(CaminoRestRoutes.entrepriseDocuments, { entrepriseId }, { ...entrepriseDocumentInput, tempDocumentName } as EntrepriseDocumentInput)
  },
  deleteEntrepriseDocument: async (entrepriseId: EntrepriseId, documentId: DocumentId): Promise<void> => {
    return fetchWithJson(CaminoRestRoutes.entrepriseDocument, { entrepriseId, documentId }, 'delete')
  },
}
