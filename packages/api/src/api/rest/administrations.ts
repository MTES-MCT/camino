import { Request as JWTRequest } from 'express-jwt'
import { HTTP_STATUS } from 'camino-common/src/http.js'

import { CustomResponse } from './express-type.js'
import { AdminUserNotNull, User } from 'camino-common/src/roles.js'
import { Pool } from 'pg'
import { administrationIdValidator } from 'camino-common/src/static/administrations.js'
import { canReadAdministrations } from 'camino-common/src/permissions/administrations.js'
import { getUtilisateursByAdministrationId } from './administrations.queries.js'

export const getAdministrationUtilisateurs = (pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<AdminUserNotNull[]>) => {
  const user = req.auth

  const parsed = administrationIdValidator.safeParse(req.params.administrationId)

  if (!parsed.success) {
    console.warn(`l'administrationId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!canReadAdministrations(user)) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    try {
      res.json(await getUtilisateursByAdministrationId(pool, parsed.data))
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}
