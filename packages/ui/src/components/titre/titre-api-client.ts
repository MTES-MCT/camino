import { EditableTitre, Section, TitreGet, TitreId } from 'camino-common/src/titres'
import { deleteWithJson, getWithJson, postWithJson } from '../../api/client-rest'
import { CaminoDate } from 'camino-common/src/date'
import { Commune } from 'camino-common/src/static/communes'

export interface TitreApiClient {
  loadTitreSections: (titreId: TitreId) => Promise<Section[]>
  removeTitre: (titreId: TitreId) => Promise<void>
  titreUtilisateurAbonne: (titreId: TitreId, abonne: boolean) => Promise<void>
  editTitre: (titre: EditableTitre) => Promise<void>
  getTitreById: (titreId: TitreId) => Promise<TitreGet>
  getLastModifiedDate: (titreId: TitreId) => Promise<CaminoDate | null>
  getTitreCommunes: (titreId: TitreId) => Promise<Commune[]>
}

export const titreApiClient: TitreApiClient = {
  loadTitreSections: async (titreId: TitreId): Promise<Section[]> => {
    return getWithJson('/rest/titreSections/:titreId', { titreId })
  },
  removeTitre: async (titreId: TitreId): Promise<void> => {
    return deleteWithJson('/rest/titres/:titreId', { titreId })
  },
  titreUtilisateurAbonne: async (titreId: TitreId, abonne: boolean): Promise<void> => {
    return postWithJson('/rest/titres/:titreId/abonne', { titreId }, { abonne })
  },
  editTitre: (titre: EditableTitre): Promise<void> => {
    return postWithJson('/rest/titres/:titreId', { titreId: titre.id }, titre)
  },
  getTitreById: (titreId: TitreId): Promise<TitreGet> => {
    return getWithJson('/rest/titres/:titreId', { titreId })
  },
  getLastModifiedDate: (titreId: TitreId): Promise<CaminoDate | null> => {
    return getWithJson('/rest/titres/:titreId/date', { titreId })
  },
  getTitreCommunes: (id: TitreId): Promise<Commune[]> => {
    return getWithJson('/rest/titres/:id/communes', { id })
  },
}
