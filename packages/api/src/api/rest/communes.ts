import { Commune, communeIdValidator } from 'camino-common/src/static/communes.js'
import { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { getCommunes as getCommunesQuery } from '../../database/queries/communes.queries.js'
import { z } from 'zod'

export const getCommunes = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<Commune[]>) => {
  try {
    const communeIds = z.array(communeIdValidator).nonempty().safeParse(req.query.ids)
    if (communeIds.success) {
      const communes = await getCommunesQuery(pool, { ids: communeIds.data })
      res.json(communes)
    } else {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    }
  } catch (e) {
    console.error(e)

    res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
  }
}
