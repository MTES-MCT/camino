import { HTTP_STATUS } from 'camino-common/src/http.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import type { Pool } from 'pg'
import { DemarcheGet, demarcheGetValidator, demarcheIdOrSlugValidator } from 'camino-common/src/demarche.js'
import { getDemarcheQuery } from './demarches.queries.js'

export const getDemarche = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<DemarcheGet>) => {
  const demarcheId = demarcheIdOrSlugValidator.safeParse(req.params.demarcheId)
  const user = req.auth
  if (!demarcheId.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      const demarche: DemarcheGet = await getDemarcheQuery(pool, demarcheId.data, user)

      res.json(demarcheGetValidator.parse(demarche))
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)
    }
  }
}
