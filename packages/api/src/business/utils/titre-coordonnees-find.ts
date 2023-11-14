import { ITitrePoint } from '../../types.js'

import { geojsonCenter } from '../../tools/geojson.js'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools.js'

export const titreCoordonneesFind = (titrePoints?: ITitrePoint[] | null): null | { x: number; y: number } => {
  if (isNotNullNorUndefinedNorEmpty(titrePoints)) {
    const [x, y] = geojsonCenter(titrePoints)

    return { x, y }
  }

  return null
}
