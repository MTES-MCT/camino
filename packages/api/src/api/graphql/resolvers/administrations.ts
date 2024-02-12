import { IAdministrationActiviteTypeEmail, Context } from '../../../types.js'
import { administrationActiviteTypeEmailCreate, administrationActiviteTypeEmailDelete } from '../../../database/queries/administrations.js'
import { emailCheck } from '../../../tools/email-check.js'
import { canReadActivitesTypesEmails, canEditEmails } from 'camino-common/src/permissions/administrations.js'
import administrationsActivitesTypesEmails from '../../../database/models/administrations-activites-types-emails.js'
import { administrationIdValidator, isAdministrationId } from 'camino-common/src/static/administrations.js'

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

export const administrationActiviteTypeEmailCreer = async ({ administrationActiviteTypeEmail }: { administrationActiviteTypeEmail: IAdministrationActiviteTypeEmail }, { user }: Context) => {
  try {
    const administrationIdParsed = administrationIdValidator.safeParse(administrationActiviteTypeEmail.administrationId)

    if (!administrationIdParsed.success || !canEditEmails(user, administrationIdParsed.data)) {
      throw new Error('droits insuffisants')
    }

    const email = administrationActiviteTypeEmail.email?.toLowerCase()
    if (!email || !emailCheck(email)) throw new Error('email invalide')

    await administrationActiviteTypeEmailCreate({
      ...administrationActiviteTypeEmail,
      email,
    })

    return true
  } catch (e) {
    console.error(e)

    // Un doublon d'email + admin ID + type d'activité génère une erreur spécifique.
    if ((e as Error).name === 'UniqueViolationError') {
      throw new Error('cette notification est déjà prise en compte')
    }

    throw e
  }
}

export const administrationActiviteTypeEmailSupprimer = async ({ administrationActiviteTypeEmail }: { administrationActiviteTypeEmail: IAdministrationActiviteTypeEmail }, { user }: Context) => {
  try {
    const administrationIdParsed = administrationIdValidator.safeParse(administrationActiviteTypeEmail.administrationId)
    if (!administrationIdParsed.success || !canEditEmails(user, administrationIdParsed.data)) {
      throw new Error('droits insuffisants')
    }

    const email = administrationActiviteTypeEmail.email?.toLowerCase()
    if (!email || !emailCheck(email)) throw new Error('email invalide')

    await administrationActiviteTypeEmailDelete({
      ...administrationActiviteTypeEmail,
      email,
    })

    return true
  } catch (e) {
    console.error(e)

    throw e
  }
}
