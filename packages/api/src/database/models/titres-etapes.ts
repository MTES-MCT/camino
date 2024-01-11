import { Model, Pojo, QueryContext } from 'objection'

import { ITitreEtape, ITitrePoint } from '../../types.js'

import { heritagePropsFormat, heritageContenuFormat } from './_format/titre-etape-heritage.js'
import { idGenerate } from './_format/id-create.js'
import EtapesTypes from './etapes-types.js'
import TitresDemarches from './titres-demarches.js'
import TitresPoints from './titres-points.js'
import Entreprises from './entreprises.js'
import Document from './documents.js'
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
    },
  }

  static relationMappings = () => ({
    type: {
      relation: Model.BelongsToOneRelation,
      modelClass: EtapesTypes,
      join: {
        from: 'titresEtapes.typeId',
        to: 'etapesTypes.id',
      },
    },

    demarche: {
      relation: Model.BelongsToOneRelation,
      modelClass: TitresDemarches,
      join: {
        from: 'titresEtapes.titreDemarcheId',
        to: 'titresDemarches.id',
      },
    },

    points: {
      relation: Model.HasManyRelation,
      modelClass: TitresPoints,
      join: {
        from: 'titresEtapes.id',
        to: 'titresPoints.titreEtapeId',
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

    documents: {
      relation: Model.HasManyRelation,
      modelClass: Document,
      join: {
        from: 'titresEtapes.id',
        to: 'documents.titreEtapeId',
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

    return super.$beforeInsert(context)
  }

  async $afterFind(context: any) {
    if (context.fetchHeritage && this.heritageProps) {
      this.heritageProps = await heritagePropsFormat(this.heritageProps)
    }

    if (context.fetchHeritage && this.heritageContenu) {
      this.heritageContenu = await heritageContenuFormat(this.heritageContenu)
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
    if (json.points) {
      json.points.forEach((point: ITitrePoint) => {
        point.titreEtapeId = json.id
      })
    }

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

    delete json.geojsonMultiPolygon
    delete json.geojsonPoints
    delete json.modification
    delete json.suppression
    json = super.$parseJson(json)

    return json
  }
}

export default TitresEtapes
