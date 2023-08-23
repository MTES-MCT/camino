import { Model } from 'objection'

import { DocumentType } from 'camino-common/src/static/documentsTypes.js'

interface DocumentsTypes extends DocumentType {}

class DocumentsTypes extends Model {
  public static tableName = 'documentsTypes'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom'],

    properties: {
      id: { type: 'string', maxLength: 3 },
      nom: { type: 'string', maxLength: 128 },
      description: { type: ['string', 'null'] },
    },
  }
}

export default DocumentsTypes
