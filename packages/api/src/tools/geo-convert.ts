import proj4 from 'proj4'
import { ICoordonnees } from '../types'
import { GEO_SYSTEME_IDS } from 'camino-common/src/geoSystemes'

const geoConvert = (epsgId: string, coords: ICoordonnees): ICoordonnees => {
  const fromProjection = `EPSG:${epsgId}`
  const toProjection = `EPSG:${GEO_SYSTEME_IDS.WGS84}`

  if (fromProjection === toProjection) {
    return coords
  }

  return proj4(fromProjection, toProjection, coords)
}

export { geoConvert }
