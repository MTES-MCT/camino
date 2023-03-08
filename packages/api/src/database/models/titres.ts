import { Model, Pojo, QueryContext, ref } from 'objection'

import { ITitre } from '../../types.js'
import Communes from './communes.js'
import Entreprises from './entreprises.js'
import TitresDemarches from './titres-demarches.js'
import TitresEtapes from './titres-etapes.js'
import TitresPoints from './titres-points.js'
import Types from './titres-types.js'
import Forets from './forets.js'
import { titreInsertFormat } from './_format/titre-insert.js'
import { idGenerate } from './_format/id-create.js'
import slugify from '@sindresorhus/slugify'
import cryptoRandomString from 'crypto-random-string'
import TitresActivites from './titres-activites.js'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes.js'

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
      dateDebut: { type: ['string', 'null'] },
      dateFin: { type: ['string', 'null'] },
      dateDemande: { type: ['string', 'null'] },
      contenusTitreEtapesIds: { type: ['object', 'null'] },
      propsTitreEtapesIds: { type: 'object' },
      coordonnees: {
        type: ['object', 'null'],
        properties: { x: { type: 'number' }, y: { type: 'number' } },
      },
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

    points: {
      relation: Model.HasManyRelation,
      modelClass: TitresPoints,
      join: {
        from: ref('titres.propsTitreEtapesIds:points').castText(),
        to: 'titresPoints.titreEtapeId',
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

    communes: {
      relation: Model.ManyToManyRelation,
      modelClass: Communes,
      join: {
        // les communes sont générées sur les étapes qui ont des points
        from: ref('titres.propsTitreEtapesIds:points').castText(),
        through: {
          from: 'titresCommunes.titreEtapeId',
          to: 'titresCommunes.communeId',
          extra: ['surface'],
        },
        to: 'communes.id',
      },
    },

    forets: {
      relation: Model.ManyToManyRelation,
      modelClass: Forets,
      join: {
        // les forêts sont générées sur les étapes qui ont des points
        from: ref('titres.propsTitreEtapesIds:points').castText(),
        through: {
          from: 'titresForets.titreEtapeId',
          to: 'titresForets.foretId',
        },
        to: 'forets.id',
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
      this.slug = `${getDomaineId(this.typeId)}-${getTitreTypeType(this.typeId)}-${slugify(this.nom)}-${cryptoRandomString({ length: 4 })}`
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
    } else if (this.pointsEtape === undefined) {
      this.secteursMaritime = undefined
      this.administrationsLocales = undefined
      this.sdomZones = undefined
    } else {
      this.secteursMaritime = this.pointsEtape.secteursMaritime
      this.administrationsLocales = this.pointsEtape.administrationsLocales
      this.sdomZones = this.pointsEtape.sdomZones
    }
  }

  public $parseJson(json: Pojo) {
    json = titreInsertFormat(json)
    json = super.$parseJson(json)

    return json
  }

  public $formatDatabaseJson(json: Pojo) {
    if (json.coordonnees) {
      json.coordonnees = `${json.coordonnees.x},${json.coordonnees.y}`
    }

    json = titreInsertFormat(json)
    json = super.$formatDatabaseJson(json)

    return json
  }
}

export default Titres
