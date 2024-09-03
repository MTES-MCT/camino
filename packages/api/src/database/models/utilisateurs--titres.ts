/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Model } from 'objection'
import { IUtilisateurTitre } from '../../types'
import Utilisateurs from './utilisateurs'

interface UtilisateursTitres extends IUtilisateurTitre {}

class UtilisateursTitres extends Model {
  public static override tableName = 'utilisateurs__titres'

  public static override jsonSchema = {
    type: 'object',
    required: ['utilisateurId', 'titreId'],

    properties: {
      utilisateurId: { type: 'string' },
      titreId: { type: 'string' },
    },
  }

  public static override idColumn = ['utilisateurId', 'titreId']

  static override relationMappings = () => ({
    utilisateur: {
      relation: Model.BelongsToOneRelation,
      modelClass: Utilisateurs,
      join: {
        from: 'utilisateurs__titres.utilisateurId',
        to: 'utilisateurs.id',
      },
    },
  })
}

export default UtilisateursTitres
