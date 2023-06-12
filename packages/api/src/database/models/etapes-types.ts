import { Model, Modifiers } from 'objection'

import { IEtapeType } from '../../types.js'

interface EtapesTypes extends IEtapeType {}

class EtapesTypes extends Model {
  public static tableName = 'etapesTypes'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom'],

    properties: {
      id: { type: 'string', maxLength: 3 },
      nom: { type: 'string', maxLength: 128 },
      description: { type: ['string', 'null'] },
      acceptationAuto: { type: ['boolean', 'null'] },
      fondamentale: { type: ['boolean', 'null'] },
      dateFin: { type: ['string', 'null'] },
      unique: { type: ['boolean', 'null'] },
      ordre: { type: 'integer' },
      publicLecture: { type: 'boolean' },
      entreprisesLecture: { type: 'boolean' },
    },
  }


  public static modifiers: Modifiers = {
    orderAsc: builder => {
      builder.orderBy('etapesTypes.ordre', 'asc')
    },
  }
}

export default EtapesTypes
