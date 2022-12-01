import { ITitrePoint } from '../../types.js'

import { geojsonCenter } from '../../tools/geojson.js'

export const titreCoordonneesFind = (titrePoints?: ITitrePoint[] | null) => {
  if (!titrePoints?.length) return null

  const [x, y] = geojsonCenter(titrePoints)

  return { x, y }
}
