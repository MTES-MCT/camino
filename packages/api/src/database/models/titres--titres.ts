import { Model } from 'objection'
import { ITitreTitre } from '../../types.js'

export interface TitreTitre extends ITitreTitre {}

interface TitresTitres extends TitreTitre {}

class TitresTitres extends Model {
  public static tableName = 'titres__titres'

  public static jsonSchema = {
    type: 'object',
    required: ['titreFromId', 'titreToId'],
    properties: {
      titreFromId: { type: 'string' },
      titreToId: { type: 'string' },
    },
  }

  public static idColumn = ['titreFromId', 'titreToId']
}

export default TitresTitres
