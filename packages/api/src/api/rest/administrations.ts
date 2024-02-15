import { Request as JWTRequest } from 'express-jwt'
import { HTTP_STATUS } from 'camino-common/src/http.js'

import { CustomResponse } from './express-type.js'
import { AdminUserNotNull, User } from 'camino-common/src/roles.js'
import { Pool } from 'pg'
import { administrationIdValidator } from 'camino-common/src/static/administrations.js'
import { canReadAdministrations } from 'camino-common/src/permissions/administrations.js'
import { deleteAdministrationActiviteTypeEmail, getActiviteTypeEmailsByAdministrationId, getUtilisateursByAdministrationId, insertAdministrationActiviteTypeEmail } from './administrations.queries.js'
import { AdministrationActiviteTypeEmail, administrationActiviteTypeEmailValidator } from 'camino-common/src/administrations.js'

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

export const addAdministrationActiviteTypeEmails = (pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<boolean>) => {
  const user = req.auth

  const parsed = administrationIdValidator.safeParse(req.params.administrationId)
  const bodyParsed = administrationActiviteTypeEmailValidator.safeParse(req.body)

  if (!parsed.success) {
    console.warn(`l'administrationId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!bodyParsed.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else if (!canReadAdministrations(user)) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    try {
      await insertAdministrationActiviteTypeEmail(pool, parsed.data, bodyParsed.data)
      res.json(true)
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export const deleteAdministrationActiviteTypeEmails = (pool: Pool) => async (req: JWTRequest<User>, res: CustomResponse<boolean>) => {
  const user = req.auth

  const parsed = administrationIdValidator.safeParse(req.params.administrationId)
  const bodyParsed = administrationActiviteTypeEmailValidator.safeParse(req.body)

  if (!parsed.success) {
    console.warn(`l'administrationId est obligatoire`)
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else if (!bodyParsed.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else if (!canReadAdministrations(user)) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
  } else {
    try {
      await deleteAdministrationActiviteTypeEmail(pool, parsed.data, bodyParsed.data)
      res.json(true)
    } catch (e) {
      console.error(e)

      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}
