import { Model } from 'objection'

import { ISubstanceLegale } from '../../types'

import Domaines from './domaines'

interface SubstancesLegales extends ISubstanceLegale {}

class SubstancesLegales extends Model {
  public static tableName = 'substancesLegales'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom'],

    properties: {
      id: { type: 'string' },
      nom: { type: ['string', 'null'] },
      domaineId: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      substanceLegaleCodeId: { type: ['string', 'null'] }
    }
  }

  static relationMappings = () => ({
    domaine: {
      relation: Model.BelongsToOneRelation,
      modelClass: Domaines,
      join: {
        from: 'substancesLegales.domaineId',
        to: 'domaines.id'
      }
    }
  })
}

export default SubstancesLegales
