import { Model } from 'objection'
import { ISecteurMaritime } from '../../types'

interface SecteursMaritime extends ISecteurMaritime {}

class SecteursMaritime extends Model {
  public static tableName = 'secteurs_maritime'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom', 'facade'],

    properties: {
      id: { type: 'integer' },
      nom: { type: 'string' },
      facade: { type: 'string' }
    }
  }
}

export default SecteursMaritime
