import { Model } from 'objection'

import { ICommune } from '../../types.js'

interface Communes extends ICommune {}

class Communes extends Model {
  public static tableName = 'communes'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom'],

    properties: {
      id: { type: 'string', maxLength: 8 },
      nom: { type: 'string' },
    },
  }
}

export default Communes
