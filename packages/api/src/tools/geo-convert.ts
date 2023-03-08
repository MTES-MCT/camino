import proj4 from 'proj4'
import { ICoordonnees } from '../types.js'
import { GEO_SYSTEME_IDS, GeoSystemeId } from 'camino-common/src/static/geoSystemes.js'

export const geoConvert = (epsgId: GeoSystemeId, coords: ICoordonnees): ICoordonnees => {
  const fromProjection = `EPSG:${epsgId}`
  const toProjection = `EPSG:${GEO_SYSTEME_IDS.WGS84}`

  if (fromProjection === toProjection) {
    return coords
  }

  return proj4(fromProjection, toProjection, coords)
}
