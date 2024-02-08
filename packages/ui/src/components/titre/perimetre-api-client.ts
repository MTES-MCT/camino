import { FeatureCollectionPoints, FeatureMultiPolygon, GeojsonImportBody, GeojsonImportPointsBody, GeojsonInformations, PerimetreInformations } from 'camino-common/src/perimetre'
import { TransformableGeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { getWithJson, postWithJson } from '../../api/client-rest'
import { EtapeId, EtapeIdOrSlug } from 'camino-common/src/etape'
import { DemarcheId, DemarcheIdOrSlug } from 'camino-common/src/demarche'

export interface PerimetreApiClient {
  getGeojsonByGeoSystemeId: (geojson: FeatureMultiPolygon, geoSystemeId: TransformableGeoSystemeId) => Promise<FeatureMultiPolygon>
  geojsonImport: (body: GeojsonImportBody, geoSystemeId: TransformableGeoSystemeId) => Promise<GeojsonInformations | Error>
  geojsonPointsImport: (body: GeojsonImportPointsBody, geoSystemeId: TransformableGeoSystemeId) => Promise<FeatureCollectionPoints | Error>
  getPerimetreInfosByEtapeId: (etapeId: EtapeIdOrSlug) => Promise<PerimetreInformations>
  getPerimetreInfosByDemarcheId: (demarcheId: DemarcheIdOrSlug) => Promise<PerimetreInformations>
}

export const perimetreApiClient: PerimetreApiClient = {
  getGeojsonByGeoSystemeId: (geojson: FeatureMultiPolygon, geoSystemeId: TransformableGeoSystemeId): Promise<FeatureMultiPolygon> => {
    return postWithJson('/rest/geojson/:geoSystemeId', { geoSystemeId }, geojson)
  },
  geojsonImport: (body: GeojsonImportBody, geoSystemeId: TransformableGeoSystemeId) => {
    return postWithJson('/rest/geojson/import/:geoSystemeId', { geoSystemeId }, body)
  },
  geojsonPointsImport: (body: GeojsonImportPointsBody, geoSystemeId: TransformableGeoSystemeId) => {
    return postWithJson('/rest/geojson_points/import/:geoSystemeId', { geoSystemeId }, body)
  },
  getPerimetreInfosByEtapeId: (etapeId: EtapeIdOrSlug) => {
    return getWithJson('/rest/etapes/:etapeId/geojson', { etapeId })
  },
  getPerimetreInfosByDemarcheId: (demarcheId: DemarcheIdOrSlug) => {
    return getWithJson('/rest/demarches/:demarcheId/geojson', { demarcheId })
  },
}
