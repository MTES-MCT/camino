import { Commune, communeIdValidator } from 'camino-common/src/static/communes'
import { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { CaminoRequest, CustomResponse } from './express-type'
import { getCommunes as getCommunesQuery } from '../../database/queries/communes.queries'
import { z } from 'zod'

export const getCommunes = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<Commune[]>) => {
  try {
    const communeIds = z.array(communeIdValidator).nonempty().safeParse(req.query.ids)
    if (communeIds.success) {
      const communes = await getCommunesQuery(pool, { ids: communeIds.data })
      res.json(communes)
    } else {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    }
  } catch (e) {
    console.error(e)

    res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
