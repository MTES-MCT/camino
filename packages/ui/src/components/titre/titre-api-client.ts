import { CaminoRestRoutes } from 'camino-common/src/rest'
import { EditableTitre, Section, TitreGet } from 'camino-common/src/titres'
import { fetchWithJson, postWithJson } from '../../api/client-rest'

export interface TitreApiClient {
  loadTitreSections: (titreId: string) => Promise<Section[]>
  removeTitre: (titreId: string) => Promise<void>
  titreUtilisateurAbonne: (titreId: string, abonne: boolean) => Promise<void>
  editTitre: (titre: EditableTitre) => Promise<void>
  getTitreById: (titreId: string) => Promise<TitreGet>
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
  editTitre: (titre: EditableTitre): Promise<void> => {
    return postWithJson(CaminoRestRoutes.titre, { titreId: titre.id }, titre)
  },
  getTitreById: (titreId: string): Promise<TitreGet> => {
    return fetchWithJson(CaminoRestRoutes.titre, { titreId })
  },
}
