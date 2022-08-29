import { Model } from 'objection'
import { IForet } from '../../types'

interface Forets extends IForet {}

class Forets extends Model {
  public static tableName = 'forets'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom'],

    properties: {
      id: { type: 'string', maxLength: 30 },
      nom: { type: 'string' }
    }
  }

  // Attention, ici, c'est un ugly hack pour ne pas retourner le champ geometry, qui est énorme et fait des oom...
  // Ça veut dire que si vous ajouter un champ à cette table, il faut le rajouter en dessous, sinon il n'apparaitra pas
  static modifiers = {
    defaultSelects(query: any) {
      query.select('id', 'nom')
    }
  }
}

export default Forets
