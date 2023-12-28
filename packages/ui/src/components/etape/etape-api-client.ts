import { deleteWithJson, getWithJson, putWithJson } from '@/api/client-rest'
import { CaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeId, EtapeTypeEtapeStatutWithMainStep } from 'camino-common/src/etape'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreId } from 'camino-common/src/titres'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'

export interface EtapeApiClient {
  getEtapesTypesEtapesStatuts: (titreDemarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) => Promise<EtapeTypeEtapeStatutWithMainStep[]>
  deleteEtape: (titreEtapeId: EtapeId) => Promise<void>
  deposeEtape: (titreEtapeId: EtapeId) => Promise<void>
}

export const etapeApiClient: EtapeApiClient = {
  getEtapesTypesEtapesStatuts: async (demarcheId, etapeId, date) => getWithJson('/rest/etapesTypes/:demarcheId/:date', { demarcheId, date }, etapeId ? { etapeId } : {}),

  deleteEtape: async etapeId => {
    await deleteWithJson('/rest/etapes/:etapeId', { etapeId })
  },
  deposeEtape: async etapeId => {
    await putWithJson('/rest/etapes/:etapeId/depot', { etapeId }, undefined)
  },
}
