import { Model, Modifiers, Pojo, QueryContext } from 'objection'

import { ITitreActivite } from '../../types'
import { idGenerate } from './_format/id-create'
import Titres from './titres'
import Utilisateurs from './utilisateurs'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'

interface TitresActivites extends ITitreActivite {}

class TitresActivites extends Model {
  public static tableName = 'titresActivites'

  public static jsonSchema = {
    type: 'object',

    required: ['titreId', 'date', 'typeId', 'activiteStatutId', 'periodeId', 'annee'],

    properties: {
      id: { type: 'string' },
      slug: { type: 'string' },
      titreId: { type: 'string' },
      utilisateurId: { type: ['string', 'null'] },
      date: { type: 'string' },
      dateSaisie: { type: ['string', 'null'] },
      contenu: { type: ['object', 'null'] },
      typeId: { type: 'string', maxLength: 3 },
      activiteStatutId: { type: 'string', maxLength: 3 },
      periodeId: { type: 'integer' },
      annee: { type: 'integer' },
      sections: {},
    },
  }

  static relationMappings = () => ({
    titre: {
      relation: Model.BelongsToOneRelation,
      modelClass: Titres,
      join: {
        from: 'titresActivites.titreId',
        to: 'titres.id',
      },
    },

    utilisateur: {
      relation: Model.BelongsToOneRelation,
      modelClass: Utilisateurs,
      join: {
        from: 'titresActivites.utilisateurId',
        to: 'utilisateurs.id',
      },
    },
  })

  public static modifiers: Modifiers = {
    orderDesc: builder => {
      builder.orderByRaw('date desc')
    },
  }

  async $beforeInsert(context: QueryContext) {
    if (isNullOrUndefined(this.id)) {
      this.id = idGenerate()
    }
    if (isNullOrUndefined(this.slug) && isNotNullNorUndefined(this.titreId) && isNotNullNorUndefined(this.typeId) && isNotNullNorUndefined(this.periodeId)) {
      this.slug = `${this.titreId}-${this.typeId}-${this.annee}-${this.periodeId.toString().padStart(2, '0')}`
    }

    return super.$beforeInsert(context)
  }

  public $parseJson(json: Pojo) {
    delete json.modification
    json = super.$parseJson(json)

    return json
  }

  public $formatDatabaseJson(json: Pojo) {
    delete json.modification
    json = super.$formatDatabaseJson(json)

    return json
  }
}

export default TitresActivites
