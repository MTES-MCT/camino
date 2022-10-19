import { Model } from 'objection'

import { DocumentType } from 'camino-common/src/static/documentsTypes'
import ActivitesTypes from './activites-types'

interface DocumentsTypes extends DocumentType {}

class DocumentsTypes extends Model {
  public static tableName = 'documentsTypes'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom'],

    properties: {
      id: { type: 'string', maxLength: 3 },
      nom: { type: 'string', maxLength: 128 },
      description: { type: ['string', 'null'] }
    }
  }

  static relationMappings = () => ({
    activitesTypes: {
      relation: Model.ManyToManyRelation,
      modelClass: ActivitesTypes,
      join: {
        from: 'documentsTypes.id',
        through: {
          from: 'activitesTypes__documentsTypes.documentTypeId',
          to: 'activitesTypes__documentsTypes.activiteTypeId',
          extra: ['optionnel']
        },
        to: 'activitesTypes.id'
      }
    }
  })
}

export default DocumentsTypes
