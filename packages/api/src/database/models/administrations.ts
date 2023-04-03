import { Model } from 'objection'

import { IAdministration } from '../../types.js'

import Utilisateurs from './utilisateurs.js'
import ActivitesTypes from './activites-types.js'

interface Administrations extends IAdministration {}

class Administrations extends Model {
  public static tableName = 'administrations'

  public static jsonSchema = {
    type: 'object',
    required: ['id'],

    properties: {
      id: { type: 'string', maxLength: 64 },
    },
  }

  static relationMappings = () => ({
    utilisateurs: {
      relation: Model.HasManyRelation,
      modelClass: Utilisateurs,
      join: {
        from: 'administrations.id',
        to: 'utilisateurs.administrationId',
      },
    },

    activitesTypes: {
      relation: Model.ManyToManyRelation,
      modelClass: ActivitesTypes,
      join: {
        from: 'administrations.id',
        through: {
          from: 'administrations__activitesTypes.administrationId',
          to: 'administrations__activitesTypes.activiteTypeId',
          extra: ['modificationInterdit', 'lectureInterdit'],
        },
        to: 'activitesTypes.id',
      },
    },

    activitesTypesEmails: {
      relation: Model.ManyToManyRelation,
      modelClass: ActivitesTypes,
      join: {
        from: 'administrations.id',
        through: {
          from: 'administrations__activitesTypes__emails.administrationId',
          to: 'administrations__activitesTypes__emails.activiteTypeId',
          extra: ['email'],
        },
        to: 'activitesTypes.id',
      },
    },
  })
}

export default Administrations
