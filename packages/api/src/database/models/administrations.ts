import { Model } from 'objection'

import { IAdministration } from '../../types.js'

import Utilisateurs from './utilisateurs.js'

interface Administrations extends IAdministration {}

class Administrations extends Model {
  public static tableName = 'administrations'

  public static jsonSchema = {
    type: 'object',
    required: ['id'],

    properties: {
      id: { type: 'string', maxLength: 64 },
    },
  }

  static relationMappings = () => ({
    utilisateurs: {
      relation: Model.HasManyRelation,
      modelClass: Utilisateurs,
      join: {
        from: 'administrations.id',
        to: 'utilisateurs.administrationId',
      },
    },
  })
}

export default Administrations
