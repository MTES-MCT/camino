/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Model } from 'objection'
import { ITitreTitre } from '../../types'

interface TitreTitre extends ITitreTitre {}

interface TitresTitres extends TitreTitre {}

class TitresTitres extends Model {
  public static override tableName = 'titres__titres'

  public static override jsonSchema = {
    type: 'object',
    required: ['titreFromId', 'titreToId'],
    properties: {
      titreFromId: { type: 'string' },
      titreToId: { type: 'string' },
    },
  }

  public static override idColumn = ['titreFromId', 'titreToId']
}

export default TitresTitres
