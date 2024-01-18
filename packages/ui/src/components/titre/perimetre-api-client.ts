import { FeatureMultiPolygon } from 'camino-common/src/demarche'
import { TransformableGeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { postWithJson } from '../../api/client-rest'

export interface PerimetreApiClient {
  getGeojsonByGeoSystemeId: (geojson: FeatureMultiPolygon, geoSystemeId: TransformableGeoSystemeId) => Promise<FeatureMultiPolygon>
}

export const perimetreApiClient: PerimetreApiClient = {
  getGeojsonByGeoSystemeId: (geojson: FeatureMultiPolygon, geoSystemeId: TransformableGeoSystemeId): Promise<FeatureMultiPolygon> => {
    return postWithJson('/rest/geojson/:geoSystemeId', { geoSystemeId }, geojson)
  },
}