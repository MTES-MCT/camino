import { Model } from 'objection'
import { ITitreSecteurMaritime } from '../../types'

interface TitresSecteursMaritime extends ITitreSecteurMaritime {}

class TitresSecteursMaritime extends Model {
  public static tableName = 'titres__secteurs_maritime'

  public static jsonSchema = {
    type: 'object',
    required: ['titreEtapeId', 'secteurMaritimeId'],

    properties: {
      secteurMaritimeId: { type: 'integer' },
      titreEtapeId: { type: 'string', maxLength: 128 }
    }
  }

  public static idColumn = ['secteurMaritimeId', 'titreEtapeId']
}

export default TitresSecteursMaritime
