import { Request as JWTRequest } from 'express-jwt'
import { HTTP_STATUS } from 'camino-common/src/http.js'

import TE from 'fp-ts/lib/TaskEither.js'
import { CustomResponse } from './express-type.js'
import { AdminUserNotNull, User, UserNotNull } from 'camino-common/src/roles.js'
import { Pool } from 'pg'
import { AdministrationId, administrationIdValidator } from 'camino-common/src/static/administrations.js'
import { canReadAdministrations } from 'camino-common/src/permissions/administrations.js'
import { deleteAdministrationActiviteTypeEmail, getActiviteTypeEmailsByAdministrationId, getUtilisateursByAdministrationId, insertAdministrationActiviteTypeEmail } from './administrations.queries.js'
import { AdministrationActiviteTypeEmail } from 'camino-common/src/administrations.js'
import { CaminoApiError } from '../../types.js'
import { pipe } from 'fp-ts/lib/function.js'
import { ZodUnparseable } from '../../tools/fp-tools.js'
import { DeepReadonly, exhaustiveCheck } from 'camino-common/src/typescript-tools.js'
import { DbQueryAccessError } from '../../pg-database.js'

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

export const getAdministrationActiviteTypeEmails = (pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<AdministrationActiviteTypeEmail[]>) => {
  const user = req.auth

  const parsed = administrationIdValidator.safeParse(req.params.administrationId)

  if (!parsed.success) {
    console.warn(`l'administrationId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!canReadAdministrations(user)) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    try {
      res.json(await getActiviteTypeEmailsByAdministrationId(pool, parsed.data))
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export const addAdministrationActiviteTypeEmails = (
  pool: Pool,
  user: DeepReadonly<UserNotNull>,
  body: DeepReadonly<AdministrationActiviteTypeEmail>,
  params: { administrationId: AdministrationId }
): TE.TaskEither<CaminoApiError<'Accès interdit' | ZodUnparseable | DbQueryAccessError>, boolean> => {
  return pipe(
    TE.Do,
    TE.filterOrElseW(
      () => canReadAdministrations(user),
      () => ({ message: 'Accès interdit' as const })
    ),
    TE.flatMap(() => insertAdministrationActiviteTypeEmail(pool, params.administrationId, body)),
    TE.mapLeft(caminoError => {
      const message = caminoError.message
      switch (message) {
        case 'Accès interdit':
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_FORBIDDEN }
        case "Impossible d'accéder à la base de données":
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR }
        case 'Problème de validation de données':
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_BAD_REQUEST }
        default:
          exhaustiveCheck(message)
          throw new Error('impossible')
      }
    })
  )
}

export const deleteAdministrationActiviteTypeEmails = (
  pool: Pool,
  user: DeepReadonly<UserNotNull>,
  body: DeepReadonly<AdministrationActiviteTypeEmail>,
  params: { administrationId: AdministrationId }
): TE.TaskEither<CaminoApiError<'Accès interdit' | ZodUnparseable | DbQueryAccessError>, boolean> => {
  return pipe(
    TE.Do,
    TE.filterOrElseW(
      () => canReadAdministrations(user),
      () => ({ message: 'Accès interdit' as const })
    ),
    TE.flatMap(() => deleteAdministrationActiviteTypeEmail(pool, params.administrationId, body)),
    TE.mapLeft(caminoError => {
      const message = caminoError.message
      switch (message) {
        case 'Accès interdit':
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_FORBIDDEN }
        case "Impossible d'accéder à la base de données":
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR }
        case 'Problème de validation de données':
          return { ...caminoError, status: HTTP_STATUS.HTTP_STATUS_BAD_REQUEST }
        default:
          exhaustiveCheck(message)
          throw new Error('impossible')
      }
    })
  )
}
