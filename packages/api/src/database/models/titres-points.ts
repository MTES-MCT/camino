import { Model, Modifiers, Pojo, QueryContext } from 'objection'

import { ITitrePoint, ITitrePointReference } from '../../types'
import { idGenerate } from './_format/id-create'
import TitresPointsReferences from './titres-points-references'

interface TitresPoints extends ITitrePoint {}

class TitresPoints extends Model {
  public static tableName = 'titresPoints'

  public static jsonSchema = {
    type: 'object',
    required: ['titreEtapeId', 'coordonnees', 'groupe', 'contour', 'point'],

    properties: {
      id: { type: 'string' },
      slug: { type: 'string' },
      titreEtapeId: { type: 'string', maxLength: 128 },
      nom: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      coordonnees: {
        type: 'object',
        properties: { x: { type: 'number' }, y: { type: 'number' } }
      },
      groupe: { type: 'integer' },
      contour: { type: 'integer' },
      point: { type: 'integer' },
      lot: { type: ['integer', 'null'] },
      securite: { type: ['boolean', 'null'] },
      subsidiaire: { type: ['boolean', 'null'] }
    }
  }

  static relationMappings = () => ({
    references: {
      relation: Model.HasManyRelation,
      modelClass: TitresPointsReferences,
      join: {
        from: 'titresPoints.id',
        to: 'titresPointsReferences.titrePointId'
      }
    }
  })

  public static modifiers: Modifiers = {
    orderAsc: builder => {
      builder.orderBy([
        { column: 'groupe' },
        { column: 'contour' },
        { column: 'point' }
      ])
    }
  }

  async $beforeInsert(context: QueryContext) {
    if (!this.id) {
      this.id = idGenerate()
    }
    if (
      !this.slug &&
      this.titreEtapeId &&
      this.groupe &&
      this.contour &&
      this.point
    ) {
      this.slug = `${this.titreEtapeId}-g${this.groupe
        .toString()
        .padStart(2, '0')}-c${this.contour
        .toString()
        .padStart(2, '0')}-p${this.point.toString().padStart(3, '0')}`
    }

    return super.$beforeInsert(context)
  }

  public $parseJson(json: Pojo) {
    json = super.$parseJson(json)

    if (json.references) {
      json.references.forEach((reference: ITitrePointReference) => {
        reference.titrePointId = json.id
      })
    }

    return json
  }

  public $formatDatabaseJson(json: Pojo) {
    if (json.coordonnees) {
      json.coordonnees = `${json.coordonnees.x},${json.coordonnees.y}`
    }

    json = super.$formatDatabaseJson(json)

    return json
  }
}

export default TitresPoints
