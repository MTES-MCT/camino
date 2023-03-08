import { CaminoRestRoutes } from 'camino-common/src/rest'
import { Section } from 'camino-common/src/titres'
import { fetchWithJson } from '../../api/client-rest'

export interface TitreApiClient {
  loadTitreSections: (titreId: string) => Promise<Section[]>
}

export const titreApiClient: TitreApiClient = {
  loadTitreSections: async (titreId: string): Promise<Section[]> => {
    return fetchWithJson(CaminoRestRoutes.titreSections, { titreId })
  },
}
