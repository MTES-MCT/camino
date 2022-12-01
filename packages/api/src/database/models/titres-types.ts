import { Model, Modifiers } from 'objection'

import { ITitreType } from '../../types.js'

import Domaines from './domaines.js'
import DemarchesTypes from './demarches-types.js'
import TitresTypesTypes from './titres-types-types.js'

interface TitresTypes extends ITitreType {}

class TitresTypes extends Model {
  public static tableName = 'titresTypes'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'typeId', 'domaineId'],

    properties: {
      id: { type: 'string', maxLength: 3 },
      typeId: { type: 'string', maxLength: 3 },
      domaineId: { type: 'string', maxLength: 3 },
      archive: { type: ['boolean', 'null'] },
      contenuIds: { type: ['object', 'null'] }
    }
  }

  static relationMappings = () => ({
    type: {
      relation: Model.BelongsToOneRelation,
      modelClass: TitresTypesTypes,
      join: {
        from: 'titresTypes.typeId',
        to: 'titresTypesTypes.id'
      }
    },

    domaine: {
      relation: Model.BelongsToOneRelation,
      modelClass: Domaines,
      join: {
        from: 'titresTypes.domaineId',
        to: 'domaines.id'
      }
    },

    demarchesTypes: {
      relation: Model.ManyToManyRelation,
      modelClass: DemarchesTypes,
      join: {
        from: 'titresTypes.id',
        through: {
          from: 'titresTypes__demarchesTypes.titreTypeId',
          to: 'titresTypes__demarchesTypes.demarcheTypeId',
          extra: [
            'dureeMax',
            'acceptationImplicite',
            'delaiImplicite',
            'delaiRecours',
            'legalRef',
            'legalLien',
            'dateDebut',
            'dateFin'
          ]
        },
        to: 'demarchesTypes.id'
      }
    }
  })

  public static modifiers: Modifiers = {
    orderAsc: builder => {
      builder.joinRelated('type').orderBy('type.ordre', 'asc')
    }
  }
}

export default TitresTypes
