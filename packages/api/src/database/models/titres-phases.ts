import { Model } from 'objection'
import { ITitrePhase } from '../../types.js'

interface TitresPhases extends ITitrePhase {}

class TitresPhases extends Model {
  public static tableName = 'titresPhases'

  public static jsonSchema = {
    type: 'object',
    required: ['titreDemarcheId', 'phaseStatutId'],

    properties: {
      titreDemarcheId: { type: 'string', maxLength: 128 },
      phaseStatutId: { type: 'string', maxLength: 3 },
      dateDebut: { type: 'string' },
      dateFin: { type: ['string', 'null'] },
    },
  }

  public static idColumn = 'titreDemarcheId'
}

export default TitresPhases
