/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import { Model, ModelOptions, Pojo, QueryContext } from 'objection'

import { ITitreEtape } from '../../types.js'

import { heritagePropsFormat, heritageContenuFormat } from './_format/titre-etape-heritage.js'
import { idGenerate } from './_format/id-create.js'
import TitresDemarches from './titres-demarches.js'
import Entreprises from './entreprises.js'
import Journaux from './journaux.js'
import { etapeSlugValidator } from 'camino-common/src/etape.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'

export interface DBTitresEtapes extends ITitreEtape {
  archive: boolean
}
interface TitresEtapes extends DBTitresEtapes {}
class TitresEtapes extends Model {
  public static tableName = 'titresEtapes'

  public static jsonSchema = {
    type: 'object',
    // l’id est généré tout seul
    required: ['titreDemarcheId', 'date'],

    properties: {
      id: { type: 'string', maxLength: 128 },
      slug: { type: 'string' },
      parentId: { type: ['string', 'null'] },
      titreDemarcheId: { type: 'string', maxLength: 128 },
      date: { type: ['string', 'null'] },
      typeId: { type: 'string', maxLength: 3 },
      statutId: { type: 'string', maxLength: 3 },
      ordre: { type: 'integer' },
      dateDebut: { type: ['string', 'null'] },
      dateFin: { type: ['string', 'null'] },
      duree: { type: ['integer', 'null'] },
      surface: { type: ['number', 'null'] },
      contenu: { type: ['object', 'null'] },
      heritageContenu: { type: ['object', 'null'] },
      heritageProps: { type: ['object', 'null'] },
      decisionsAnnexesSections: {},
      decisionsAnnexesContenu: { type: ['object', 'null'] },
      archive: { type: 'boolean' },
      substances: { type: ['array', 'null'] },
      communes: { type: ['array', 'null'] },
      forets: { type: ['array', 'null'] },
      secteursMaritime: { type: ['array', 'null'] },
      administrationsLocales: { type: ['array', 'null'] },
      sdomZones: { type: ['array', 'null'] },
      notes: { type: ['string', 'null'] },
      geojson4326Perimetre: { type: ['object', 'null'] },
    },
  }

  static relationMappings = () => ({
    demarche: {
      relation: Model.BelongsToOneRelation,
      modelClass: TitresDemarches,
      join: {
        from: 'titresEtapes.titreDemarcheId',
        to: 'titresDemarches.id',
      },
    },

    titulaires: {
      relation: Model.ManyToManyRelation,
      modelClass: Entreprises,
      join: {
        from: 'titresEtapes.id',
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
        from: 'titresEtapes.id',
        through: {
          from: 'titresAmodiataires.titreEtapeId',
          to: 'titresAmodiataires.entrepriseId',
          extra: ['operateur'],
        },
        to: 'entreprises.id',
      },
    },
    journaux: {
      relation: Model.HasManyRelation,
      modelClass: Journaux,
      join: {
        from: 'titresEtapes.id',
        to: 'journaux.elementId',
      },
    },
  })

  async $beforeInsert(context: QueryContext) {
    if (!this.id) {
      this.id = idGenerate()
    }

    if (!this.slug && this.titreDemarcheId && this.typeId) {
      this.slug = etapeSlugValidator.parse(`${this.titreDemarcheId}-${this.typeId}99`)
    }

    if (isNotNullNorUndefined(this.notes) && this.notes.trim() === '') {
      this.notes = null
    }

    if (isNotNullNorUndefined(this.geojson4326Perimetre)) {
      // eslint-disable-next-line sql/no-unsafe-query
      const rawLine = await context.transaction.raw(`select ST_GeomFromGeoJSON('${JSON.stringify(this.geojson4326Perimetre.geometry)}'::text)`)
      this.geojson4326Perimetre = rawLine.rows[0].st_geomfromgeojson
    }

    return super.$beforeInsert(context)
  }

  async $beforeUpdate(opt: ModelOptions, context: QueryContext) {
    if (isNotNullNorUndefined(this.geojson4326Perimetre)) {
      // eslint-disable-next-line sql/no-unsafe-query
      const rawLine = await context.transaction.raw(`select ST_GeomFromGeoJSON('${JSON.stringify(this.geojson4326Perimetre.geometry)}'::text)`)
      this.geojson4326Perimetre = rawLine.rows[0].st_geomfromgeojson
    }

    return super.$beforeUpdate(opt, context)
  }

  async $afterFind(context: QueryContext) {
    if (context.fetchHeritage && this.heritageProps) {
      this.heritageProps = await heritagePropsFormat(this.heritageProps)
    }

    if (context.fetchHeritage && this.heritageContenu) {
      this.heritageContenu = await heritageContenuFormat(this.heritageContenu)
    }

    // BUG Objection
    // Obligé de vérifier qu’on a pas déjà un geojson correct, des fois dans le $afterFind on a déjà ce qu’on souhaite
    // il y a un bug dans objection sur lequel on est déjà tombé dans upsertJournalCreate
    if (isNotNullNorUndefined(this.geojson4326Perimetre) && typeof this.geojson4326Perimetre === 'string') {
      // eslint-disable-next-line sql/no-unsafe-query
      const rawLine = await context.transaction.raw(`select ST_AsGeoJSON('${this.geojson4326Perimetre}'::text, 40)::json`)
      this.geojson4326Perimetre = { type: 'Feature', properties: {}, geometry: rawLine.rows[0].st_asgeojson }
    }

    return this
  }

  public $formatDatabaseJson(json: Pojo) {
    delete json.modification
    delete json.suppression
    json = super.$formatDatabaseJson(json)

    return json
  }

  public $parseJson(json: Pojo) {
    if (json.amodiatairesIds) {
      json.amodiataires = json.amodiatairesIds.map((id: string) => ({ id }))
      delete json.amodiatairesIds
    }

    if (json.titulairesIds) {
      json.titulaires = json.titulairesIds.map((id: string) => ({ id }))
      delete json.titulairesIds
    }

    if (json.substancesIds) {
      json.substances = json.substancesIds.map((id: string) => ({ id }))

      delete json.substancesIds
    }

    delete json.modification
    delete json.suppression
    json = super.$parseJson(json)

    return json
  }
}

export default TitresEtapes
