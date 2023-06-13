import { Model, Pojo, ref } from 'objection'

import { IEntreprise } from '../../types.js'
import EntreprisesEtablissements from './entreprises-etablissements.js'
import Utilisateurs from './utilisateurs.js'
import Titres from './titres.js'

interface Entreprises extends IEntreprise {}

class Entreprises extends Model {
  public static tableName = 'entreprises'

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'nom'],

    properties: {
      id: { type: 'string', maxLength: 64 },
      nom: { type: 'string' },
      paysId: { type: ['string', 'null'] },
      legalSiren: { type: ['string', 'null'] },
      legalEtranger: { type: ['string', 'null'] },
      legalForme: { type: ['string', 'null'] },
      categorie: { type: ['string', 'null'] },
      dateCreation: { type: ['string', 'null'] },
      adresse: { type: ['string', 'null'] },
      codePostal: { type: ['string', 'null'] },
      commune: { type: ['string', 'null'] },
      cedex: { type: ['string', 'null'] },
      email: { type: ['string', 'null'] },
      telephone: { type: ['string', 'null'] },
      url: { type: ['string', 'null'] },
      archive: { type: 'boolean' },
    },
  }

  static relationMappings = () => ({
    etablissements: {
      relation: Model.HasManyRelation,
      modelClass: EntreprisesEtablissements,
      join: {
        from: 'entreprises.id',
        to: 'entreprisesEtablissements.entrepriseId',
      },
    },

    utilisateurs: {
      relation: Model.ManyToManyRelation,
      modelClass: Utilisateurs,
      join: {
        from: 'entreprises.id',
        through: {
          from: 'utilisateurs__entreprises.entrepriseId',
          to: 'utilisateurs__entreprises.utilisateurId',
        },
        to: 'utilisateurs.id',
      },
    },

    titulaireTitres: {
      relation: Model.ManyToManyRelation,
      modelClass: Titres,
      join: {
        from: 'entreprises.id',
        through: {
          from: 'titresTitulaires.entrepriseId',
          to: 'titresTitulaires.titreEtapeId',
        },
        to: ref('titres.propsTitreEtapesIds:titulaires').castText(),
      },
    },

    amodiataireTitres: {
      relation: Model.ManyToManyRelation,
      modelClass: Titres,
      join: {
        from: 'entreprises.id',
        through: {
          from: 'titresAmodiataires.entrepriseId',
          to: 'titresAmodiataires.titreEtapeId',
        },
        to: ref('titres.propsTitreEtapesIds:amodiataires').castText(),
      },
    },
  })

  public $parseJson(json: Pojo) {
    json = super.$parseJson(json)
    if (json.id) {
      json.id = json.id.toLowerCase()
    }

    if (json.utilisateursIds) {
      json.utilisateurs = json.utilisateursIds.map((id: string) => ({
        id,
      }))

      delete json.utilisateursIds
    }

    return json
  }
}

export default Entreprises
