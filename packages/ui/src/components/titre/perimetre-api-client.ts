import {
  GeojsonImportBody,
  GeojsonImportForagesBody,
  GeojsonImportForagesResponse,
  GeojsonImportPointsBody,
  GeojsonImportPointsResponse,
  GeojsonInformations,
  PerimetreInformations,
} from 'camino-common/src/perimetre'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { getWithJson, newPostWithJson } from '../../api/client-rest'
import { EtapeIdOrSlug } from 'camino-common/src/etape'
import { DemarcheIdOrSlug } from 'camino-common/src/demarche'
import { CaminoError } from 'camino-common/src/zod-tools'

export interface PerimetreApiClient {
  geojsonImport: (body: GeojsonImportBody, geoSystemeId: GeoSystemeId) => Promise<CaminoError<string> | GeojsonInformations>
  geojsonPointsImport: (body: GeojsonImportPointsBody, geoSystemeId: GeoSystemeId) => Promise<GeojsonImportPointsResponse | CaminoError<string>>
  geojsonForagesImport: (body: GeojsonImportForagesBody, geoSystemeId: GeoSystemeId) => Promise<GeojsonImportForagesResponse | CaminoError<string>>
  getPerimetreInfosByEtapeId: (etapeId: EtapeIdOrSlug) => Promise<PerimetreInformations>
  getPerimetreInfosByDemarcheId: (demarcheId: DemarcheIdOrSlug) => Promise<PerimetreInformations>
}

export const perimetreApiClient: PerimetreApiClient = {
  geojsonImport: (body: GeojsonImportBody, geoSystemeId: GeoSystemeId) => {
    return newPostWithJson('/rest/geojson/import/:geoSystemeId', { geoSystemeId }, body)
  },
  geojsonPointsImport: (body: GeojsonImportPointsBody, geoSystemeId: GeoSystemeId) => {
    return newPostWithJson('/rest/geojson_points/import/:geoSystemeId', { geoSystemeId }, body)
  },
  geojsonForagesImport: (body: GeojsonImportForagesBody, geoSystemeId: GeoSystemeId) => {
    return newPostWithJson('/rest/geojson_forages/import/:geoSystemeId', { geoSystemeId }, body)
  },
  getPerimetreInfosByEtapeId: (etapeId: EtapeIdOrSlug) => {
    return getWithJson('/rest/etapes/:etapeId/geojson', { etapeId })
  },
  getPerimetreInfosByDemarcheId: (demarcheId: DemarcheIdOrSlug) => {
    return getWithJson('/rest/demarches/:demarcheId/geojson', { demarcheId })
  },
}
