import { deleteWithJson, getWithJson } from '@/api/client-rest'
import { CaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeId, EtapeTypeEtapeStatutWithMainStep } from 'camino-common/src/etape'
import { etape } from '../../api/titres-etapes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreId } from 'camino-common/src/titres'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { apiGraphQLFetch } from '@/api/_client'
import gql from 'graphql-tag'

export type EtapeGet = { id: EtapeId; typeId: EtapeTypeId; demarche: { id: DemarcheId; typeId: DemarcheTypeId; titre: { id: TitreId } } }

export interface EtapeApiClient {
  getEtapesTypesEtapesStatuts: (titreDemarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) => Promise<EtapeTypeEtapeStatutWithMainStep[]>
  getEtapeById: (titreEtapeId: EtapeId) => Promise<EtapeGet>
  deleteEtape: (titreEtapeId: EtapeId) => Promise<void>
}

export const etapeApiClient: EtapeApiClient = {
  getEtapesTypesEtapesStatuts: async (demarcheId, etapeId, date) => getWithJson('/rest/etapesTypes/:demarcheId/:date', { demarcheId, date }, etapeId ? { etapeId } : {}),

  getEtapeById: async titreEtapeId => {
    const result = await etape({ id: titreEtapeId })

    return result
  },
  deleteEtape: async etapeId => {
    await deleteWithJson('/rest/etapes/:etapeId', { etapeId })
  },
}
