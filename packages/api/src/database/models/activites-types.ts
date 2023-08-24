import { Model, Modifiers } from 'objection'
import { IActiviteType } from '../../types.js'
import Administrations from './administrations.js'

interface ActivitesTypes extends IActiviteType {}

class ActivitesTypes extends Model {
  public static tableName = 'activitesTypes'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom', 'frequenceId'],

    properties: {
      id: { type: 'string', maxLength: 3 },
      nom: { type: 'string' },
      description: { type: ['string', 'null'] },
      frequenceId: { type: 'string', maxLength: 3 },
      dateDebut: { type: 'string' },
      delaiMois: { type: 'integer' },
      ordre: { type: 'integer' },
    },
  }

  static relationMappings = () => ({
    administrations: {
      relation: Model.ManyToManyRelation,
      modelClass: Administrations,
      join: {
        from: 'activitesTypes.id',
        through: {
          from: 'administrations__activitesTypes.activiteTypeId',
          to: 'administrations__activitesTypes.administrationId',
          extra: ['modificationInterdit', 'lectureInterdit'],
        },
        to: 'administrations.id',
      },
    },
    administrationsEmails: {
      relation: Model.ManyToManyRelation,
      modelClass: Administrations,
      join: {
        from: 'activitesTypes.id',
        through: {
          from: 'administrations__activitesTypes__emails.activiteTypeId',
          to: 'administrations__activitesTypes__emails.administrationId',
          extra: ['email'],
        },
        to: 'administrations.id',
      },
    },
  })

  public static modifiers: Modifiers = {
    orderAsc: builder => {
      builder.orderBy('activitesTypes.ordre', 'asc')
    },
  }
}

export default ActivitesTypes
