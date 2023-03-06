import { Model, Pojo } from 'objection'

import { IUtilisateur } from '../../types.js'
import Entreprises from './entreprises.js'
import Administrations from './administrations.js'

interface Utilisateurs extends IUtilisateur {}

class Utilisateurs extends Model {
  public static tableName = 'utilisateurs'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'email', 'role'],

    properties: {
      id: { type: 'string', minLength: 1, maxLength: 64 },
      email: { type: ['string', 'null'] },
      nom: { type: ['string', 'null'] },
      prenom: { type: ['string', 'null'] },
      telephoneFixe: { type: ['string', 'null'] },
      telephoneMobile: { type: ['string', 'null'] },
      role: { type: 'string' },
      preferences: { type: ['object', 'null'] },
      administrationId: { type: ['string', 'null'] }
    }
  }

  static relationMappings = () => ({
    entreprises: {
      relation: Model.ManyToManyRelation,
      modelClass: Entreprises,
      join: {
        from: 'utilisateurs.id',
        through: {
          from: 'utilisateurs__entreprises.utilisateurId',
          to: 'utilisateurs__entreprises.entrepriseId'
        },
        to: 'entreprises.id'
      }
    },

    administration: {
      relation: Model.BelongsToOneRelation,
      modelClass: Administrations,
      join: {
        from: 'utilisateurs.administrationId',
        to: 'administrations.id'
      }
    }
  })

  public $parseJson(json: Pojo) {

    json = super.$parseJson(json)

    return json
  }

  public $formatDatabaseJson(json: Pojo) {

    json = super.$formatDatabaseJson(json)

    return json
  }
}
export default Utilisateurs
