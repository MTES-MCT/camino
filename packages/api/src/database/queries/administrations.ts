import { IAdministrationActiviteTypeEmail, IFields } from '../../types.js'

import graphBuild from './graph/build.js'
import { fieldsFormat } from './graph/fields-format.js'
import options from './_options.js'

import Administrations from '../models/administrations.js'
import { administrationsQueryModify } from './permissions/administrations.js'
import AdministrationsActivitesTypesEmails from '../models/administrations-activites-types-emails.js'
import { User } from 'camino-common/src/roles'

const administrationsQueryBuild = ({ fields }: { fields?: IFields }, user: User) => {
  const graph = fields ? graphBuild(fields, 'administrations', fieldsFormat) : options.administrations.graph

  const q = Administrations.query().withGraphFetched(graph)

  administrationsQueryModify(q, user)

  return q
}

const administrationGet = async (id: string, { fields }: { fields?: IFields }, user: User) => {
  const q = administrationsQueryBuild({ fields }, user)

  return q.findById(id)
}

const administrationsGet = async ({ fields }: { fields?: IFields }, user: User) => {
  return administrationsQueryBuild({ fields }, user)
}

const administrationActiviteTypeEmailCreate = async (administrationActiviteTypeEmail: IAdministrationActiviteTypeEmail) =>
  AdministrationsActivitesTypesEmails.query().insertGraph(administrationActiviteTypeEmail)

const administrationActiviteTypeEmailDelete = async (administrationActiviteTypeEmail: IAdministrationActiviteTypeEmail) => {
  const { activiteTypeId, administrationId, email } = administrationActiviteTypeEmail

  return AdministrationsActivitesTypesEmails.query().delete().where({
    activite_type_id: activiteTypeId,
    administration_id: administrationId,
    email,
  })
}

export { administrationGet, administrationsGet, administrationActiviteTypeEmailCreate, administrationActiviteTypeEmailDelete }
