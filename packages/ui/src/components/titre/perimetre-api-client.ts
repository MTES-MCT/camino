import {
  FeatureCollectionPoints,
  GeojsonImportBody,
  GeojsonImportForagesBody,
  GeojsonImportForagesResponse,
  GeojsonImportPointsBody,
  GeojsonImportPointsResponse,
  GeojsonInformations,
  PerimetreInformations,
} from 'camino-common/src/perimetre'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { getWithJson, newPostWithJson, postWithJson } from '../../api/client-rest'
import { EtapeIdOrSlug } from 'camino-common/src/etape'
import { DemarcheIdOrSlug } from 'camino-common/src/demarche'
import { CaminoError, Either } from 'camino-common/src/either'

export interface PerimetreApiClient {
  getGeojsonByGeoSystemeId: (geojson: FeatureCollectionPoints, geoSystemeId: GeoSystemeId) => Promise<FeatureCollectionPoints>
  geojsonImport: (body: GeojsonImportBody, geoSystemeId: GeoSystemeId) => Promise<GeojsonInformations | Error>
  geojsonPointsImport: (body: GeojsonImportPointsBody, geoSystemeId: GeoSystemeId) => Promise<Either<CaminoError, GeojsonImportPointsResponse>>
  geojsonForagesImport: (body: GeojsonImportForagesBody, geoSystemeId: GeoSystemeId) => Promise<GeojsonImportForagesResponse | Error>
  getPerimetreInfosByEtapeId: (etapeId: EtapeIdOrSlug) => Promise<PerimetreInformations>
  getPerimetreInfosByDemarcheId: (demarcheId: DemarcheIdOrSlug) => Promise<PerimetreInformations>
}

export const perimetreApiClient: PerimetreApiClient = {
  getGeojsonByGeoSystemeId: (geojson: FeatureCollectionPoints, geoSystemeId: GeoSystemeId): Promise<FeatureCollectionPoints> => {
    return postWithJson('/rest/geojson_points/:geoSystemeId', { geoSystemeId }, geojson)
  },
  geojsonImport: (body: GeojsonImportBody, geoSystemeId: GeoSystemeId) => {
    return postWithJson('/rest/geojson/import/:geoSystemeId', { geoSystemeId }, body)
  },
  geojsonPointsImport: (body: GeojsonImportPointsBody, geoSystemeId: GeoSystemeId) => {
    return newPostWithJson('/rest/geojson_points/import/:geoSystemeId', { geoSystemeId }, body)
  },
  geojsonForagesImport: (body: GeojsonImportForagesBody, geoSystemeId: GeoSystemeId) => {
    return postWithJson('/rest/geojson_forages/import/:geoSystemeId', { geoSystemeId }, body)
  },
  getPerimetreInfosByEtapeId: (etapeId: EtapeIdOrSlug) => {
    return getWithJson('/rest/etapes/:etapeId/geojson', { etapeId })
  },
  getPerimetreInfosByDemarcheId: (demarcheId: DemarcheIdOrSlug) => {
    return getWithJson('/rest/demarches/:demarcheId/geojson', { demarcheId })
  },
}
