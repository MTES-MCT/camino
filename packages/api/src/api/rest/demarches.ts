import { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { demarcheIdOrSlugValidator } from 'camino-common/src/demarche.js'
import { isSuper } from 'camino-common/src/roles.js'
import { getDemarcheByIdOrSlug as getDemarcheByIdOrSlugDb } from './demarches.queries.js'
import { GetDemarcheByIdOrSlugValidator } from 'camino-common/src/titres.js'

export const getDemarcheByIdOrSlug = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<GetDemarcheByIdOrSlugValidator>) => {
  try {
    const demarcheIdOrSlugParsed = demarcheIdOrSlugValidator.safeParse(req.params.demarcheIdOrSlug)
    const user = req.auth
    if (!isSuper(user)) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    } else if (!demarcheIdOrSlugParsed.success) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    } else {
      try {
        const result = await getDemarcheByIdOrSlugDb(pool, demarcheIdOrSlugParsed.data)
        res.json(result)
      } catch (e) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  } catch (e) {
    console.error(e)

    res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
  }
}
