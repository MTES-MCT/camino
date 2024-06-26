import { Model, Modifiers, QueryContext } from 'objection'

import { ITitreDemarche } from '../../types.js'
import { newDemarcheId } from './_format/id-create.js'
import Titres from './titres.js'
import TitresEtapes from './titres-etapes.js'
import { demarcheSlugValidator } from 'camino-common/src/demarche.js'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools.js'

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
      this.slug = demarcheSlugValidator.parse(`${this.titreId}-${this.typeId}99`)
    }

    return super.$beforeInsert(context)
  }
}

export default TitresDemarches
