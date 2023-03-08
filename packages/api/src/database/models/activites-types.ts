import { Model, Modifiers } from 'objection'
import { IActiviteType } from '../../types.js'
import TitresTypes from './titres-types.js'
import Administrations from './administrations.js'
import DocumentsTypes from './documents-types.js'
import ActivitesTypesPays from './activites-types--pays.js'

interface ActivitesTypes extends IActiviteType {}

class ActivitesTypes extends Model {
  public static tableName = 'activitesTypes'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom', 'sections', 'frequenceId'],

    properties: {
      id: { type: 'string', maxLength: 3 },
      nom: { type: 'string' },
      description: { type: ['string', 'null'] },
      sections: {},
      frequenceId: { type: 'string', maxLength: 3 },
      dateDebut: { type: 'string' },
      delaiMois: { type: 'integer' },
      ordre: { type: 'integer' },
    },
  }

  static relationMappings = () => ({
    titresTypes: {
      relation: Model.ManyToManyRelation,
      modelClass: TitresTypes,
      join: {
        from: 'activitesTypes.id',
        through: {
          from: 'activitesTypes__titresTypes.activiteTypeId',
          to: 'activitesTypes__titresTypes.titreTypeId',
        },
        to: 'titresTypes.id',
      },
    },

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
    activitesTypesPays: {
      relation: Model.HasManyRelation,
      modelClass: ActivitesTypesPays,
      join: {
        from: 'activitesTypes.id',
        to: 'activitesTypes__pays.activiteTypeId',
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

    documentsTypes: {
      relation: Model.ManyToManyRelation,
      modelClass: DocumentsTypes,
      join: {
        from: 'activitesTypes.id',
        through: {
          from: 'activitesTypes__documentsTypes.activiteTypeId',
          to: 'activitesTypes__documentsTypes.documentTypeId',
          extra: ['optionnel'],
        },
        to: 'documentsTypes.id',
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
