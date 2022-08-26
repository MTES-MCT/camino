import { Model } from 'objection'

import { ICommune } from '../../types'

interface Communes extends ICommune {}

class Communes extends Model {
  public static tableName = 'communes'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom'],

    properties: {
      id: { type: 'string', maxLength: 8 },
      nom: { type: 'string' },
      departementId: { type: 'string' }
    }
  }

  // Attention, ici, c'est un ugly hack pour ne pas retourner le champ geometry, qui est énorme et fait des oom...
  // Ça veut dire que si vous ajouter un champ à cette table, il faut le rajouter en dessous, sinon il n'apparaitra pas
  static modifiers = {
    defaultSelects(query: any) {
      query.select('id', 'nom', 'departementId')
    }
  }
}

export default Communes
