import { FeatureMultiPolygon } from 'camino-common/src/demarche'
import { GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { postWithJson } from '../../api/client-rest'

export interface PerimetreApiClient {
  getGeojsonByGeoSystemId: (geojson: FeatureMultiPolygon, geoSystemeId: GeoSystemeId) => Promise<FeatureMultiPolygon>
}

export const perimetreApiClient: PerimetreApiClient = {
  getGeojsonByGeoSystemId: (geojson: FeatureMultiPolygon, geoSystemeId: GeoSystemeId): Promise<FeatureMultiPolygon> =>{
    return postWithJson('/rest/geojson/:geoSystemeId',{geoSystemeId}, geojson)
  }
}
