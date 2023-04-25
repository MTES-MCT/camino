import { fetchWithJson } from '@/api/client-rest'
import { CaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeTypeEtapeStatutWithMainStep } from 'camino-common/src/etape'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { etape } from '../../api/titres-etapes'

export type EtapeGet = { demarche: { id: DemarcheId } }

export interface EtapeApiClient {
  getEtapesTypesEtapesStatuts: (titreDemarcheId: DemarcheId, titreEtapeId: string | null, date: CaminoDate) => Promise<EtapeTypeEtapeStatutWithMainStep[]>
  getEtapeById: (titreEtapeId: string) => Promise<EtapeGet>
}

export const etapeApiClient: EtapeApiClient = {
  getEtapesTypesEtapesStatuts: async (demarcheId: DemarcheId, etapeId: string | null, date: CaminoDate): Promise<EtapeTypeEtapeStatutWithMainStep[]> =>
    fetchWithJson(CaminoRestRoutes.etapesTypesEtapesStatusWithMainStep, { demarcheId, date }, 'get', etapeId ? { etapeId } : {}),

  getEtapeById: async (titreEtapeId: string) => {
    const result = await etape({ id: titreEtapeId })

    return result
  },
}
