import { fetchWithJson, postWithJson } from '@/api/client-rest'
import { CaminoAnnee } from 'camino-common/src/date'
import { EntrepriseId } from 'camino-common/src/entreprise'
import { Fiscalite } from 'camino-common/src/fiscalite'
import { CaminoRestRoutes } from 'camino-common/src/rest'


export interface EntrepriseApiClient {
  getFiscaliteEntreprise: (annee: CaminoAnnee, entrepriseId: string) => Promise<Fiscalite>
  modifierEntreprise: (entreprise: {
    id: EntrepriseId
    telephone?: string,
    email?: string,
    url?: string,
    archive?: boolean
  }) => Promise<void>
}

export const entrepriseApiClient: EntrepriseApiClient = {
  getFiscaliteEntreprise: async (annee, entrepriseId): Promise<Fiscalite> => {
    return fetchWithJson(CaminoRestRoutes.fiscaliteEntreprise, {
      annee,
      entrepriseId,
    })
    
  },
  modifierEntreprise: async (entreprise): Promise<void> => {
    return postWithJson(CaminoRestRoutes.entreprise, {entrepriseId: entreprise.id}, entreprise, 'put')
  }
}
