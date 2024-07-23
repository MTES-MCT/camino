import { Model, Modifiers, QueryContext } from 'objection'

import { ITitreDemarche } from '../../types'
import { newDemarcheId, newDemarcheSlug } from './_format/id-create'
import Titres from './titres'
import TitresEtapes from './titres-etapes'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'

export interface DBTitresDemarches extends ITitreDemarche {
  archive: boolean
}

interface TitresDemarches extends DBTitresDemarches {}

class TitresDemarches extends Model {
  public static tableName = 'titresDemarches'

  public static jsonSchema = {
    type: 'object',
    required: ['titreId', 'typeId'],

    properties: {
      id: { type: 'string', maxLength: 128 },
      slug: { type: 'string' },
      titreId: { type: 'string', maxLength: 128 },
      typeId: { type: 'string', maxLength: 8 },
      statutId: { type: 'string', maxLength: 3 },
      ordre: { type: 'integer' },
      description: { type: ['string', 'null'] },
      demarcheDateDebut: { type: ['string', 'null'] },
      demarcheDateFin: { type: ['string', 'null'] },
      archive: { type: 'boolean' },
    },
  }

  static relationMappings = () => ({
    titre: {
      relation: Model.BelongsToOneRelation,
      modelClass: Titres,
      join: {
        from: 'titresDemarches.titreId',
        to: 'titres.id',
      },
    },

    etapes: {
      relation: Model.HasManyRelation,
      modelClass: TitresEtapes,
      join: {
        from: 'titresDemarches.id',
        to: 'titresEtapes.titreDemarcheId',
      },
    },
  })

  public static modifiers: Modifiers = {
    orderDesc: builder => {
      builder.orderBy('ordre', 'desc')
    },
  }

  async $beforeInsert(context: QueryContext) {
    if (isNullOrUndefined(this.id)) {
      this.id = newDemarcheId()
    }

    if (isNullOrUndefined(this.slug) && isNotNullNorUndefined(this.titreId) && isNotNullNorUndefined(this.typeId)) {
      this.slug = newDemarcheSlug(this.titreId, this.typeId)
    }

    return super.$beforeInsert(context)
  }
}

export default TitresDemarches
