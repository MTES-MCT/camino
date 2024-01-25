import { Model, Pojo, QueryContext, ref } from 'objection'

import { ITitre } from '../../types.js'
import Entreprises from './entreprises.js'
import TitresDemarches from './titres-demarches.js'
import TitresEtapes from './titres-etapes.js'
import Types from './titres-types.js'
import { titreInsertFormat } from './_format/titre-insert.js'
import { idGenerate } from './_format/id-create.js'
import { slugify } from 'camino-common/src/strings.js'
import TitresActivites from './titres-activites.js'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes.js'
import { titreSlugValidator } from 'camino-common/src/validators/titres.js'

export interface DBTitre extends ITitre {
  archive: boolean
}

interface Titres extends DBTitre {}

class Titres extends Model {
  public static tableName = 'titres'

  public static jsonSchema = {
    type: 'object',
    required: ['nom', 'typeId'],
    properties: {
      id: { type: 'string' },
      slug: { type: 'string' },
      nom: { type: 'string' },
      typeId: { type: 'string', maxLength: 3 },
      titreStatutId: { type: 'string', maxLength: 3 },
      contenusTitreEtapesIds: { type: ['object', 'null'] },
      propsTitreEtapesIds: { type: 'object' },
      doublonTitreId: { type: ['string', 'null'] },
      archive: { type: 'boolean' },
      references: { type: ['array', 'null'] },
    },
  }

  static relationMappings = () => ({
    type: {
      relation: Model.BelongsToOneRelation,
      modelClass: Types,
      join: { from: 'titres.typeId', to: 'titresTypes.id' },
    },

    demarches: {
      relation: Model.HasManyRelation,
      modelClass: TitresDemarches,
      join: { from: 'titres.id', to: 'titresDemarches.titreId' },
    },

    surfaceEtape: {
      relation: Model.BelongsToOneRelation,
      modelClass: TitresEtapes,
      join: {
        from: ref('titres.propsTitreEtapesIds:surface').castText(),
        to: 'titresEtapes.id',
      },
    },

    substancesEtape: {
      relation: Model.BelongsToOneRelation,
      modelClass: TitresEtapes,
      join: {
        from: ref('titres.propsTitreEtapesIds:substances').castText(),
        to: 'titresEtapes.id',
      },
    },

    pointsEtape: {
      relation: Model.BelongsToOneRelation,
      modelClass: TitresEtapes,
      join: {
        from: ref('titres.propsTitreEtapesIds:points').castText(),
        to: 'titresEtapes.id',
      },
    },

    titulaires: {
      relation: Model.ManyToManyRelation,
      modelClass: Entreprises,
      join: {
        from: ref('titres.propsTitreEtapesIds:titulaires').castText(),
        through: {
          from: 'titresTitulaires.titreEtapeId',
          to: 'titresTitulaires.entrepriseId',
          extra: ['operateur'],
        },
        to: 'entreprises.id',
      },
    },

    amodiataires: {
      relation: Model.ManyToManyRelation,
      modelClass: Entreprises,
      join: {
        from: ref('titres.propsTitreEtapesIds:amodiataires').castText(),
        through: {
          from: 'titresAmodiataires.titreEtapeId',
          to: 'titresAmodiataires.entrepriseId',
          extra: ['operateur'],
        },
        to: 'entreprises.id',
      },
    },

    activites: {
      relation: Model.HasManyRelation,
      modelClass: TitresActivites,
      join: { from: 'titres.id', to: 'titresActivites.titreId' },
    },

    doublonTitre: {
      relation: Model.BelongsToOneRelation,
      modelClass: Titres,
      join: { from: 'titres.doublonTitreId', to: 'titres.id' },
    },
  })

  async $beforeInsert(context: QueryContext) {
    if (!this.id) {
      this.id = idGenerate()
    }

    if (!this.slug && this.typeId && this.nom) {
      this.slug = titreSlugValidator.parse(`${getDomaineId(this.typeId)}-${getTitreTypeType(this.typeId)}-${slugify(this.nom)}-${idGenerate(4)}`)
    }

    return super.$beforeInsert(context)
  }

  $afterFind() {
    if (this.substancesEtape === null) {
      this.substances = []
    } else if (this.substancesEtape === undefined) {
      this.substances = undefined
    } else {
      this.substances = this.substancesEtape.substances
    }

    // Les secteurs et les administrations locales dépendent du périmètre du titre
    if (this.pointsEtape === null) {
      this.secteursMaritime = []
      this.administrationsLocales = []
      this.sdomZones = []
      this.forets = []
      this.communes = []
    } else if (this.pointsEtape === undefined) {
      this.secteursMaritime = undefined
      this.administrationsLocales = undefined
      this.sdomZones = undefined
      this.forets = undefined
      this.communes = undefined
    } else {
      this.secteursMaritime = this.pointsEtape.secteursMaritime
      this.administrationsLocales = this.pointsEtape.administrationsLocales
      this.sdomZones = this.pointsEtape.sdomZones
      this.forets = this.pointsEtape.forets
      this.communes = this.pointsEtape.communes
    }
  }

  public $parseJson(json: Pojo) {
    json = titreInsertFormat(json)
    json = super.$parseJson(json)

    return json
  }

  public $formatDatabaseJson(json: Pojo) {

    json = titreInsertFormat(json)
    json = super.$formatDatabaseJson(json)

    return json
  }
}

export default Titres
