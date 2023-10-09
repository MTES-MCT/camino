import { Model, Pojo } from 'objection'

import { IDocument } from '../../types.js'
import DocumentsTypes from './documents-types.js'
import TitresEtapes from './titres-etapes.js'

interface Document extends IDocument {}
class Document extends Model {
  public static tableName = 'documents'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'typeId', 'date'],

    properties: {
      id: { type: 'string' },
      typeId: { type: 'string' },
      date: { type: 'string' },
      titreEtapeId: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      fichier: { type: ['boolean', 'null'] },
      fichierTypeId: { type: ['string', 'null'] },
      publicLecture: { type: ['boolean', 'null'] },
      entreprisesLecture: { type: ['boolean', 'null'] },
    },
  }

  static relationMappings = () => ({
    type: {
      relation: Model.BelongsToOneRelation,
      modelClass: DocumentsTypes,
      join: {
        from: 'documents.typeId',
        to: 'documentsTypes.id',
      },
    },

    etape: {
      relation: Model.HasOneRelation,
      modelClass: TitresEtapes,
      join: {
        from: 'documents.titreEtapeId',
        to: 'titresEtapes.id',
      },
    },
  })

  public $formatDatabaseJson(json: Pojo): Pojo {
    delete json.modification
    delete json.suppression
    delete json.fichierNouveau
    delete json.nomTemporaire
    json = super.$formatDatabaseJson(json)

    return json
  }

  public $parseJson(json: Pojo): Pojo {
    delete json.modification
    delete json.suppression
    delete json.fichierNouveau
    delete json.nomTemporaire
    json = super.$parseJson(json)

    return json
  }
}

export default Document
