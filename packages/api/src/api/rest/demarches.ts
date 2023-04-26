import { constants } from 'http2'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { isSuper } from 'camino-common/src/roles.js'
import type { Pool } from 'pg'
import { DemarcheGet, demarcheGetValidator } from 'camino-common/src/demarche.js'
import { getDemarcheDb } from './demarches.queries.js'

export const getDemarche = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<DemarcheGet>) => {
  const demarcheId: string | undefined = req.params.demarcheId
  const user = req.auth
  // TODO  2023-04-25 Route actuellement réservée au super, car il faut réfléchir comment vérifier toutes les permissions
  if (!isSuper(user)) {
    res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
  } else if (!demarcheId) {
    res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      const demarches = await getDemarcheDb.run({ id: demarcheId }, pool)

      if (demarches.length !== 1) {
        res.sendStatus(constants.HTTP_STATUS_NOT_FOUND)
      } else {
        const parsed = demarcheGetValidator.safeParse(demarches[0])
        if (parsed.success) {
          res.json(parsed.data)
        } else {
          console.error(parsed.error)
          res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        }
      }
    } catch (e) {
      console.error(e)

      res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}
