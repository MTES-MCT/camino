import { FeatureMultiPolygon, GeojsonImportBody, GeojsonInformations } from 'camino-common/src/perimetre'
import { TransformableGeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { postWithJson } from '../../api/client-rest'

export interface PerimetreApiClient {
  getGeojsonByGeoSystemeId: (geojson: FeatureMultiPolygon, geoSystemeId: TransformableGeoSystemeId) => Promise<FeatureMultiPolygon>
  geojsonImport: (body: GeojsonImportBody, geoSystemeId: TransformableGeoSystemeId) => Promise<GeojsonInformations | Error>
}

export const perimetreApiClient: PerimetreApiClient = {
  getGeojsonByGeoSystemeId: (geojson: FeatureMultiPolygon, geoSystemeId: TransformableGeoSystemeId): Promise<FeatureMultiPolygon> => {
    return postWithJson('/rest/geojson/:geoSystemeId', { geoSystemeId }, geojson)
  },
  geojsonImport: (body: GeojsonImportBody, geoSystemeId: TransformableGeoSystemeId) => {
    return postWithJson('/rest/geojson/import/:geoSystemeId', { geoSystemeId }, body)
  }
}
