import {
  IAdministrationActiviteType,
  IAdministrationActiviteTypeEmail,
  IAdministrationTitreType,
  IAdministrationTitreTypeEtapeType,
  IAdministrationTitreTypeTitreStatut,
  IFields,
  IUtilisateur
} from '../../types'

import graphBuild from './graph/build'
import { fieldsFormat } from './graph/fields-format'
import options from './_options'

import Administrations from '../models/administrations'
import AdministrationsTitresTypes from '../models/administrations-titres-types'
import { administrationsQueryModify } from './permissions/administrations'
import AdministrationsTitresTypesTitresStatuts from '../models/administrations-titres-types-titres-statuts'
import AdministrationsTitresTypesEtapesTypes from '../models/administrations-titres-types-etapes-types'
import AdministrationsActivitesTypes from '../models/administrations-activites-types'
import AdministrationsActivitesTypesEmails from '../models/administrations-activites-types-emails'

const administrationsQueryBuild = (
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const graph = fields
    ? graphBuild(fields, 'administrations', fieldsFormat)
    : options.administrations.graph

  const q = Administrations.query().withGraphFetched(graph)

  administrationsQueryModify(q, user)

  return q
}

const administrationGet = async (
  id: string,
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  const q = administrationsQueryBuild({ fields }, user)

  return q.findById(id)
}

const administrationsGet = async (
  { fields }: { fields?: IFields },
  user: IUtilisateur | null | undefined
) => {
  return administrationsQueryBuild({ fields }, user)
}

const administrationTitreTypeUpsert = async (
  administrationTitreType: IAdministrationTitreType
) =>
  AdministrationsTitresTypes.query().upsertGraph(administrationTitreType, {
    insertMissing: true
  })

const administrationTitreTypeDelete = async (
  administrationId: string,
  titreTypeId: string
) =>
  AdministrationsTitresTypes.query().deleteById([administrationId, titreTypeId])

const administrationTitreTypeTitreStatutUpsert = async (
  administrationTitreTypeTitreStatut: IAdministrationTitreTypeTitreStatut
) =>
  AdministrationsTitresTypesTitresStatuts.query().upsertGraph(
    administrationTitreTypeTitreStatut,
    { insertMissing: true }
  )

const administrationTitreTypeTitreStatutDelete = async (
  administrationId: string,
  titreTypeId: string,
  statutTypeId: string
) =>
  AdministrationsTitresTypesTitresStatuts.query().deleteById([
    administrationId,
    titreTypeId,
    statutTypeId
  ])

const administrationTitreTypeEtapeTypeUpsert = async (
  administrationTitreTypeEtapeType: IAdministrationTitreTypeEtapeType
) =>
  AdministrationsTitresTypesEtapesTypes.query().upsertGraph(
    administrationTitreTypeEtapeType,
    { insertMissing: true }
  )

const administrationTitreTypeEtapeTypeDelete = async (
  administrationId: string,
  titreTypeId: string,
  etapeTypeId: string
) =>
  AdministrationsTitresTypesEtapesTypes.query().deleteById([
    administrationId,
    titreTypeId,
    etapeTypeId
  ])

const administrationActiviteTypeUpsert = async (
  administrationActiviteType: IAdministrationActiviteType
) =>
  AdministrationsActivitesTypes.query().upsertGraph(
    administrationActiviteType,
    {
      insertMissing: true
    }
  )

const administrationActiviteTypeDelete = async (
  administrationId: string,
  ActiviteTypeId: string
) =>
  AdministrationsActivitesTypes.query().deleteById([
    administrationId,
    ActiviteTypeId
  ])

const administrationActiviteTypeEmailCreate = async (
  administrationActiviteTypeEmail: IAdministrationActiviteTypeEmail
) =>
  AdministrationsActivitesTypesEmails.query().insertGraph(
    administrationActiviteTypeEmail
  )

const administrationActiviteTypeEmailDelete = async (
  administrationActiviteTypeEmail: IAdministrationActiviteTypeEmail
) => {
  const { activiteTypeId, administrationId, email } =
    administrationActiviteTypeEmail

  return AdministrationsActivitesTypesEmails.query().delete().where({
    activite_type_id: activiteTypeId,
    administration_id: administrationId,
    email
  })
}

export {
  administrationGet,
  administrationsGet,
  administrationTitreTypeUpsert,
  administrationTitreTypeDelete,
  administrationTitreTypeTitreStatutUpsert,
  administrationTitreTypeTitreStatutDelete,
  administrationTitreTypeEtapeTypeUpsert,
  administrationTitreTypeEtapeTypeDelete,
  administrationActiviteTypeUpsert,
  administrationActiviteTypeDelete,
  administrationActiviteTypeEmailCreate,
  administrationActiviteTypeEmailDelete
}
