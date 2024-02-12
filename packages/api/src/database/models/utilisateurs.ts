import { Model, Pojo } from 'objection'

import { IUtilisateur } from '../../types.js'
import Entreprises from './entreprises.js'

interface Utilisateurs extends IUtilisateur {}

class Utilisateurs extends Model {
  public static tableName = 'utilisateurs'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'email', 'role'],

    properties: {
      id: { type: 'string', minLength: 1, maxLength: 64 },
      keycloakId: { type: ['string', 'null'] },
      email: { type: ['string', 'null'] },
      nom: { type: ['string', 'null'] },
      prenom: { type: ['string', 'null'] },
      telephoneFixe: { type: ['string', 'null'] },
      telephoneMobile: { type: ['string', 'null'] },
      role: { type: 'string' },
      administrationId: { type: ['string', 'null'] },
    },
  }

  static relationMappings = () => ({
    entreprises: {
      relation: Model.ManyToManyRelation,
      modelClass: Entreprises,
      join: {
        from: 'utilisateurs.id',
        through: {
          from: 'utilisateurs__entreprises.utilisateurId',
          to: 'utilisateurs__entreprises.entrepriseId',
        },
        to: 'entreprises.id',
      },
    },
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
