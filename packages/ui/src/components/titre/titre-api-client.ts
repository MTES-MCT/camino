import { CaminoRestRoutes } from 'camino-common/src/rest'
import { Section } from 'camino-common/src/titres'
import { fetchWithJson, postWithJson } from '../../api/client-rest'

export interface TitreApiClient {
  loadTitreSections: (titreId: string) => Promise<Section[]>
  removeTitre: (titreId: string) => Promise<void>
  titreUtilisateurAbonne: (titreId: string, abonne: boolean) => Promise<void>
}

export const titreApiClient: TitreApiClient = {
  loadTitreSections: async (titreId: string): Promise<Section[]> => {
    return fetchWithJson(CaminoRestRoutes.titreSections, { titreId })
  },
  removeTitre: async (titreId: string): Promise<void> => {
    return fetchWithJson(CaminoRestRoutes.titre, { titreId }, 'delete')
  },
  titreUtilisateurAbonne: async (titreId: string, abonne: boolean): Promise<void> => {
    return postWithJson(CaminoRestRoutes.titreUtilisateurAbonne, { titreId }, { abonne })
  },
}
