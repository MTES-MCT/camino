import proj4 from 'proj4'
import { sortedGeoSystemes } from 'camino-common/src/static/geoSystemes.js'

export const geoSystemesInit = () => {
  // initialise les définitions proj4
  // utilisées dans /tools/geo-convert
  proj4.defs(
    sortedGeoSystemes.map(geoSysteme => [
      `EPSG:${geoSysteme.id}`,
      geoSysteme.definitionProj4
    ])
  )
}
