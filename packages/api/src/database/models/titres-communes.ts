import { Model } from 'objection'
import { ITitreCommune } from '../../types.js'

interface TitresCommunes extends ITitreCommune {}

class TitresCommunes extends Model {
  public static tableName = 'titresCommunes'

  public static jsonSchema = {
    type: 'object',
    required: ['titreEtapeId', 'communeId'],

    properties: {
      communeId: { type: 'string', maxLength: 8 },
      titreEtapeId: { type: 'string', maxLength: 128 }
    }
  }

  public static idColumn = ['communeId', 'titreEtapeId']
}

export default TitresCommunes
