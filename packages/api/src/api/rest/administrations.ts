import { Request as JWTRequest } from 'express-jwt'
import { HTTP_STATUS } from 'camino-common/src/http'

import { CustomResponse } from './express-type'
import { AdminUserNotNull, User, UserNotNull } from 'camino-common/src/roles'
import { Pool } from 'pg'
import { AdministrationId, administrationIdValidator } from 'camino-common/src/static/administrations'
import { canReadAdministrations } from 'camino-common/src/permissions/administrations'
import { deleteAdministrationActiviteTypeEmail, getActiviteTypeEmailsByAdministrationId, getUtilisateursByAdministrationId, insertAdministrationActiviteTypeEmail } from './administrations.queries'
import { AdministrationActiviteTypeEmail } from 'camino-common/src/administrations'
import { CaminoApiError } from '../../types'
import { ZodUnparseable } from '../../tools/fp-tools'
import { DeepReadonly } from 'camino-common/src/typescript-tools'
import { DbQueryAccessError } from '../../pg-database'
import { Effect, Match } from 'effect'
import { RestNewPostCall } from '../../server/rest'

export const getAdministrationUtilisateurs = (pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<AdminUserNotNull[]>) => {
  const user = req.auth

  const parsed = administrationIdValidator.safeParse(req.params.administrationId)

  if (!parsed.success) {
    console.warn(`l'administrationId est obligatoire`)
    res.sendStatus(HTTP_STATUS.FORBIDDEN)
  } else if (!canReadAdministrations(user)) {
    res.sendStatus(HTTP_STATUS.FORBIDDEN)
  } else {
    try {
      res.json(await getUtilisateursByAdministrationId(pool, parsed.data))
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }
}

export const getAdministrationActiviteTypeEmails = (pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<AdministrationActiviteTypeEmail[]>) => {
  const user = req.auth

  const parsed = administrationIdValidator.safeParse(req.params.administrationId)

  if (!parsed.success) {
    console.warn(`l'administrationId est obligatoire`)
    res.sendStatus(HTTP_STATUS.FORBIDDEN)
  } else if (!canReadAdministrations(user)) {
    res.sendStatus(HTTP_STATUS.FORBIDDEN)
  } else {
    try {
      res.json(await getActiviteTypeEmailsByAdministrationId(pool, parsed.data))
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }
}

export const addAdministrationActiviteTypeEmails: RestNewPostCall<'/rest/administrations/:administrationId/activiteTypeEmails'> = (
  pool: Pool,
  user: DeepReadonly<UserNotNull>,
  body: DeepReadonly<AdministrationActiviteTypeEmail>,
  params: { administrationId: AdministrationId }
): Effect.Effect<boolean, CaminoApiError<'Accès interdit' | ZodUnparseable | DbQueryAccessError>> => {
  return Effect.Do.pipe(
    Effect.filterOrFail(
      () => canReadAdministrations(user),
      () => ({ message: 'Accès interdit' as const })
    ),
    Effect.flatMap(() => insertAdministrationActiviteTypeEmail(pool, params.administrationId, body)),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when('Accès interdit', () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.when('Problème de validation de données', () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })),
        Match.when("Impossible d'accéder à la base de données", () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })),
        Match.exhaustive
      )
    )
  )
}

export const deleteAdministrationActiviteTypeEmails: RestNewPostCall<'/rest/administrations/:administrationId/activiteTypeEmails/delete'> = (
  pool: Pool,
  user: DeepReadonly<UserNotNull>,
  body: DeepReadonly<AdministrationActiviteTypeEmail>,
  params: { administrationId: AdministrationId }
): Effect.Effect<boolean, CaminoApiError<'Accès interdit' | ZodUnparseable | DbQueryAccessError>> => {
  return Effect.Do.pipe(
    Effect.filterOrFail(
      () => canReadAdministrations(user),
      () => ({ message: 'Accès interdit' as const })
    ),
    Effect.flatMap(() => deleteAdministrationActiviteTypeEmail(pool, params.administrationId, body)),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.when('Accès interdit', () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.when('Problème de validation de données', () => ({ ...caminoError, status: HTTP_STATUS.BAD_REQUEST })),
        Match.when("Impossible d'accéder à la base de données", () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })),
        Match.exhaustive
      )
    )
  )
}
