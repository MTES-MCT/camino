import { FeatureMultiPolygon, featureMultiPolygonValidator } from 'camino-common/src/demarche.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { Pool } from 'pg'
import { transformableGeoSystemeIdValidator } from 'camino-common/src/static/geoSystemes.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { getGeojsonByGeoSystemeId as getGeojsonByGeoSystemeIdQuery } from './perimetre.queries.js'

export const getGeojsonByGeoSystemeId = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<FeatureMultiPolygon>) => {
  const geoSystemeIdParsed = transformableGeoSystemeIdValidator.safeParse(req.params.geoSystemeId)
  const geojsonParsed = featureMultiPolygonValidator.safeParse(req.body)

  if (!geoSystemeIdParsed.success || !geojsonParsed.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      res.json(await getGeojsonByGeoSystemeIdQuery(pool, geoSystemeIdParsed.data, geojsonParsed.data))
    } catch (e) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      console.error(e)
    }
  }
}
