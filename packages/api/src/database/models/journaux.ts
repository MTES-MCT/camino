/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Model } from 'objection'

import { IJournaux } from '../../types'
import { idGenerate } from './_format/id-create'
import Utilisateurs from './utilisateurs'
import Titres from './titres'

interface Journaux extends IJournaux {}

class Journaux extends Model {
  public static override tableName = 'journaux'

  public static override jsonSchema = {
    type: 'object',

    properties: {
      id: { type: 'string' },
      utilisateurId: { type: 'string' },
      date: { type: 'string' },
      elementId: { type: 'string' },
      titreId: { type: 'string' },
      operation: { enum: ['create', 'update', 'delete'] },
      differences: { type: ['object', 'null'] },
    },
  }

  static override relationMappings = () => ({
    utilisateur: {
      relation: Model.BelongsToOneRelation,
      modelClass: Utilisateurs,
      join: {
        from: 'journaux.utilisateurId',
        to: 'utilisateurs.id',
      },
    },
    titre: {
      relation: Model.BelongsToOneRelation,
      modelClass: Titres,
      join: {
        from: 'journaux.titreId',
        to: 'titres.id',
      },
    },
  })

  override async $beforeInsert(queryContext: any) {
    await super.$beforeInsert(queryContext)

    this.id = idGenerate()
    this.date = new Date().toISOString()
  }
}

export default Journaux
