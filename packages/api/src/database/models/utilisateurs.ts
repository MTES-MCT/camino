import { Model, Pojo } from 'objection'

import { IUtilisateur } from '../../types'
import Entreprises from './entreprises'
import Administrations from './administrations'

interface Utilisateurs extends IUtilisateur {}

class Utilisateurs extends Model {
  public static tableName = 'utilisateurs'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'email', 'motDePasse', 'role'],

    properties: {
      id: { type: 'string', minLength: 1, maxLength: 64 },
      email: { type: ['string', 'null'] },
      motDePasse: {
        type: 'string',
        minLength: 8,
        maxLength: 255
      },
      nom: { type: ['string', 'null'] },
      prenom: { type: ['string', 'null'] },
      telephoneFixe: { type: ['string', 'null'] },
      telephoneMobile: { type: ['string', 'null'] },
      role: { type: 'string' },
      preferences: { type: ['object', 'null'] },
      refreshToken: { type: ['string', 'null'] },
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
    delete json.modification
    delete json.suppression
    delete json.permissionModification
    delete json.entreprisesCreation
    delete json.utilisateursCreation

    json = super.$parseJson(json)

    return json
  }

  public $formatDatabaseJson(json: Pojo) {
    delete json.modification
    delete json.suppression
    delete json.permissionModification
    delete json.entreprisesCreation
    delete json.utilisateursCreation

    json = super.$formatDatabaseJson(json)

    return json
  }
}
export default Utilisateurs
