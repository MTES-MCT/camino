import { Model, Modifiers } from 'objection'

import { ITitreSubstance } from '../../types'

interface TitresSubstances extends ITitreSubstance {}

class TitresSubstances extends Model {
  public static tableName = 'titresSubstances'

  public static jsonSchema = {
    type: 'object',
    required: ['titreEtapeId', 'substanceId', 'ordre'],

    properties: {
      titreEtapeId: { type: 'string', maxLength: 128 },
      substanceId: { type: 'string' },
      ordre: { type: 'number' }
    }
  }

  public static idColumn = ['titreEtapeId', 'substanceId']

  public static modifiers: Modifiers = {
    orderAsc: builder => {
      builder.orderBy('ordre', 'asc')
    }
  }
}

export default TitresSubstances
