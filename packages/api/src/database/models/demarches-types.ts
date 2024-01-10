import { Model, Modifiers } from 'objection'

import { IDemarcheType } from '../../types.js'

interface DemarchesTypes extends IDemarcheType {}

class DemarchesTypes extends Model {
  public static tableName = 'demarchesTypes'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom'],

    properties: {
      id: { type: 'string', maxLength: 3 },
      nom: { type: 'string' },
      ordre: { type: ['integer', 'null'] },
      duree: { type: ['boolean', 'null'] },
      points: { type: ['boolean', 'null'] },
      substances: { type: ['boolean', 'null'] },
      titulaires: { type: ['boolean', 'null'] },
      renouvelable: { type: ['boolean', 'null'] },
      exception: { type: ['boolean', 'null'] },
    },
  }


  public static modifiers: Modifiers = {
    orderAsc: builder => {
      builder.orderBy('ordre', 'asc')
    },
  }
}

export default DemarchesTypes
