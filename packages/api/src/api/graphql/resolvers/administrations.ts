import { GraphQLResolveInfo } from 'graphql'

import { IAdministrationActiviteTypeEmail, Context } from '../../../types.js'

import { administrationGet, administrationsGet, administrationActiviteTypeEmailCreate, administrationActiviteTypeEmailDelete } from '../../../database/queries/administrations.js'

import { fieldsBuild } from './_fields-build.js'

import { administrationFormat } from '../../_format/administrations.js'
import { emailCheck } from '../../../tools/email-check.js'
import { canReadActivitesTypesEmails, canReadAdministrations, canEditEmails } from 'camino-common/src/permissions/administrations.js'
import administrationsActivitesTypesEmails from '../../../database/models/administrations-activites-types-emails.js'
import { isAdministrationId } from 'camino-common/src/static/administrations.js'

const administration = async ({ id }: { id: string }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!canReadAdministrations(user)) {
      return null
    }
    const fields = fieldsBuild(info)

    const administration = await administrationGet(id, { fields }, user)

    if (!administration) {
      return null
    }

    return administrationFormat(administration)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const administrationActivitesTypesEmails = async ({ id }: { id: string }, { user }: Context): Promise<IAdministrationActiviteTypeEmail[]> => {
  try {
    if (isAdministrationId(id)) {
      if (!canReadActivitesTypesEmails(user, id)) {
        throw new Error('droit insuffisant')
      }

      return administrationsActivitesTypesEmails.query().where('administrationId', id)
    } else {
      throw new Error('l’identifiant est inconnu')
    }
  } catch (e) {
    console.error(e)

    throw e
  }
}

const administrations = async (_: unknown, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!canReadAdministrations(user)) {
      return []
    }
    const fields = fieldsBuild(info)

    const administrations = await administrationsGet({ fields }, user)

    if (!administrations.length) return []

    return administrations.map(administrationFormat)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const administrationActiviteTypeEmailCreer = async (
  { administrationActiviteTypeEmail }: { administrationActiviteTypeEmail: IAdministrationActiviteTypeEmail },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    const administration = await administrationGet(administrationActiviteTypeEmail.administrationId, { fields: { id: {} } }, user)

    if (!administration || !canEditEmails(user, administration.id)) {
      throw new Error('droits insuffisants')
    }

    const fields = fieldsBuild(info)
    const email = administrationActiviteTypeEmail.email?.toLowerCase()
    if (!email || !emailCheck(email)) throw new Error('email invalide')

    await administrationActiviteTypeEmailCreate({
      ...administrationActiviteTypeEmail,
      email,
    })

    return await administrationGet(administrationActiviteTypeEmail.administrationId, { fields }, user)
  } catch (e) {
    console.error(e)

    // Un doublon d'email + admin ID + type d'activité génère une erreur spécifique.
    if ((e as Error).name === 'UniqueViolationError') {
      throw new Error('cette notification est déjà prise en compte')
    }

    throw e
  }
}

const administrationActiviteTypeEmailSupprimer = async (
  { administrationActiviteTypeEmail }: { administrationActiviteTypeEmail: IAdministrationActiviteTypeEmail },
  { user }: Context,
  info: GraphQLResolveInfo
) => {
  try {
    const administration = await administrationGet(administrationActiviteTypeEmail.administrationId, { fields: { id: {} } }, user)

    if (!administration || !canEditEmails(user, administration.id)) {
      throw new Error('droits insuffisants')
    }

    const fields = fieldsBuild(info)
    const email = administrationActiviteTypeEmail.email?.toLowerCase()
    if (!email || !emailCheck(email)) throw new Error('email invalide')

    await administrationActiviteTypeEmailDelete({
      ...administrationActiviteTypeEmail,
      email,
    })

    return await administrationGet(administrationActiviteTypeEmail.administrationId, { fields }, user)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export { administration, administrations, administrationActiviteTypeEmailCreer, administrationActiviteTypeEmailSupprimer }
