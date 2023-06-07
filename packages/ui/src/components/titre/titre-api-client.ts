import { EditableTitre, Section, TitreGet } from 'camino-common/src/titres'
import { deleteWithJson, getWithJson, postWithJson } from '../../api/client-rest'
import { CaminoDate } from 'camino-common/src/date'
import { Commune } from 'camino-common/src/static/communes'

export interface TitreApiClient {
  loadTitreSections: (titreId: string) => Promise<Section[]>
  removeTitre: (titreId: string) => Promise<void>
  titreUtilisateurAbonne: (titreId: string, abonne: boolean) => Promise<void>
  editTitre: (titre: EditableTitre) => Promise<void>
  getTitreById: (titreId: string) => Promise<TitreGet>
  getLastModifiedDate: (titreId: string) => Promise<CaminoDate | null>
  getTitreCommunes: (titreId: string) => Promise<Commune[]>
}

export const titreApiClient: TitreApiClient = {
  loadTitreSections: async (titreId: string): Promise<Section[]> => {
    return getWithJson('/rest/titreSections/:titreId', { titreId })
  },
  removeTitre: async (titreId: string): Promise<void> => {
    return deleteWithJson('/rest/titres/:titreId', { titreId })
  },
  titreUtilisateurAbonne: async (titreId: string, abonne: boolean): Promise<void> => {
    return postWithJson('/rest/titres/:titreId/abonne', { titreId }, { abonne })
  },
  editTitre: (titre: EditableTitre): Promise<void> => {
    return postWithJson('/rest/titres/:titreId', { titreId: titre.id }, titre)
  },
  getTitreById: (titreId: string): Promise<TitreGet> => {
    return getWithJson('/rest/titres/:titreId', { titreId })
  },
  getLastModifiedDate: (titreId: string): Promise<CaminoDate | null> => {
    return getWithJson('/rest/titres/:titreId/date', { titreId })
  },
  getTitreCommunes: (id: string): Promise<Commune[]> => {
    return getWithJson('/rest/titres/:id/communes', { id })
  },
}
