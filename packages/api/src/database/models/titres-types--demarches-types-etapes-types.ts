import { Model } from 'objection'
import { ITitreTypeDemarcheTypeEtapeType } from '../../types.js'
import EtapesTypes from './etapes-types.js'
import DemarchesTypes from './demarches-types.js'

interface TitresTypesDemarchesTypesEtapesTypes extends ITitreTypeDemarcheTypeEtapeType {}

class TitresTypesDemarchesTypesEtapesTypes extends Model {
  public static tableName = 'titresTypes__demarchesTypes__etapesTypes'

  public static jsonSchema = {
    type: 'object',
    required: ['titreTypeId', 'demarcheTypeId', 'etapeTypeId', 'ordre'],

    properties: {
      titreTypeId: { type: 'string', maxLength: 3 },
      demarcheTypeId: { type: 'string', maxLength: 3 },
      etapeTypeId: { type: 'string', maxLength: 3 },
      ordre: { type: 'integer' },
    },
  }

  public static idColumn = ['titreTypeId', 'demarcheTypeId', 'etapeTypeId']

  static relationMappings = () => ({
    etapeType: {
      relation: Model.BelongsToOneRelation,
      modelClass: EtapesTypes,
      join: {
        from: 'titresTypes__demarchesTypes__etapesTypes.etapeTypeId',
        to: 'etapesTypes.id',
      },
    },

    demarcheType: {
      relation: Model.BelongsToOneRelation,
      modelClass: DemarchesTypes,
      join: {
        from: 'titresTypes__demarchesTypes__etapesTypes.demarcheTypeId',
        to: 'demarchesTypes.id',
      },
    },
  })
}

export default TitresTypesDemarchesTypesEtapesTypes
