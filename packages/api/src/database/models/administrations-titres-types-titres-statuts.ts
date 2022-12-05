import { Model, Modifiers } from 'objection'
import { IAdministrationTitreTypeTitreStatut } from '../../types.js'
import TitresTypes from './titres-types.js'

interface AdministrationsTitresTypesTitresStatuts
  extends IAdministrationTitreTypeTitreStatut {}

class AdministrationsTitresTypesTitresStatuts extends Model {
  public static tableName = 'administrations__titresTypes__titresStatuts'

  public static jsonSchema = {
    type: 'object',
    required: [
      'administrationId',
      'titreTypeId',
      'titreStatutId',
      'titresModificationInterdit',
      'demarchesModificationInterdit',
      'etapesModificationInterdit'
    ],

    properties: {
      administrationId: { type: 'string', maxLength: 64 },
      titreTypeId: { type: 'string', maxLength: 3 },
      titreStatutId: { type: 'string', maxLength: 3 },
      titresModificationInterdit: { type: 'boolean' },
      demarchesModificationInterdit: { type: 'boolean' },
      etapesModificationInterdit: { type: 'boolean' }
    }
  }

  public static idColumn = ['administrationId', 'titreTypeId', 'titreStatutId']

  static relationMappings = () => ({
    titreType: {
      relation: Model.BelongsToOneRelation,
      modelClass: TitresTypes,
      join: {
        from: 'administrations__titresTypes__titresStatuts.titreTypeId',
        to: 'titresTypes.id'
      }
    }
  })

  public static modifiers: Modifiers = {
    orderAsc: builder => {
      return builder
        .joinRelated('titreType.domaine')
        .orderBy('titreType:domaine.id')
        .joinRelated('titreType.type')
        .orderBy('titreType:type.nom')
    }
  }
}

export default AdministrationsTitresTypesTitresStatuts
