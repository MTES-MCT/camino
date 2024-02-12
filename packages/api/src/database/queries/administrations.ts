import { IAdministrationActiviteTypeEmail } from '../../types.js'
import AdministrationsActivitesTypesEmails from '../models/administrations-activites-types-emails.js'

export const administrationActiviteTypeEmailCreate = async (administrationActiviteTypeEmail: IAdministrationActiviteTypeEmail) =>
  AdministrationsActivitesTypesEmails.query().insertGraph(administrationActiviteTypeEmail)

export const administrationActiviteTypeEmailDelete = async (administrationActiviteTypeEmail: IAdministrationActiviteTypeEmail) => {
  const { activiteTypeId, administrationId, email } = administrationActiviteTypeEmail

  return AdministrationsActivitesTypesEmails.query().delete().where({
    activite_type_id: activiteTypeId,
    administration_id: administrationId,
    email,
  })
}
