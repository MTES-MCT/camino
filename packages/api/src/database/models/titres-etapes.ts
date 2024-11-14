/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Model, ModelOptions, Pojo, QueryContext } from 'objection'

import { ITitreEtape } from '../../types'

import { heritagePropsFormat, heritageContenuFormat } from './_format/titre-etape-heritage'
import { idGenerate } from './_format/id-create'
import TitresDemarches from './titres-demarches'
import Journaux from './journaux'
import { EtapeId, etapeSlugValidator } from 'camino-common/src/etape'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { DemarcheId } from 'camino-common/src/demarche'

export interface DBTitresEtapes extends ITitreEtape {
  archive: boolean
  demarcheIdEnConcurrence: DemarcheId | null
  etapeFondamentaleId: EtapeId
}
interface TitresEtapes extends DBTitresEtapes {}
class TitresEtapes extends Model {
  public static override tableName = 'titresEtapes'

  public static override jsonSchema = {
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
      substances: { type: ['array', 'null'] },
      archive: { type: 'boolean' },
      isBrouillon: { type: 'boolean' },
      titulaireIds: { type: ['array', 'null'] },
      amodiataireIds: { type: ['array', 'null'] },
      communes: { type: ['array', 'null'] },
      forets: { type: ['array', 'null'] },
      secteursMaritime: { type: ['array', 'null'] },
      administrationsLocales: { type: ['array', 'null'] },
      sdomZones: { type: ['array', 'null'] },
      demarcheIdsConsentement: { type: ['array', 'null'] },
      note: { type: 'object' },
    },
  }

  static override relationMappings = () => ({
    demarche: {
      relation: Model.BelongsToOneRelation,
      modelClass: TitresDemarches,
      join: {
        from: 'titresEtapes.titreDemarcheId',
        to: 'titresDemarches.id',
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

  override async $beforeInsert(context: QueryContext) {
    if (!this.id) {
      this.id = idGenerate()
    }
    if (isNullOrUndefined(this.etapeFondamentaleId)) {
      this.etapeFondamentaleId = this.id
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.slug && this.titreDemarcheId && this.typeId) {
      this.slug = etapeSlugValidator.parse(`${this.titreDemarcheId}-${this.typeId}99`)
    }

    if (isNotNullNorUndefined(this.geojson4326Perimetre)) {
      // eslint-disable-next-line sql/no-unsafe-query
      const rawLine = await context.transaction.raw(`select ST_GeomFromGeoJSON('${JSON.stringify(this.geojson4326Perimetre.geometry)}'::text)`)
      this.geojson4326Perimetre = rawLine.rows[0].st_geomfromgeojson
    }
    await super.$beforeInsert(context)
  }

  override async $beforeUpdate(opt: ModelOptions, context: QueryContext) {
    if (isNotNullNorUndefined(this.geojson4326Perimetre)) {
      // eslint-disable-next-line sql/no-unsafe-query
      const rawLine = await context.transaction.raw(`select ST_GeomFromGeoJSON('${JSON.stringify(this.geojson4326Perimetre.geometry)}'::text)`)
      this.geojson4326Perimetre = rawLine.rows[0].st_geomfromgeojson
    }

    return super.$beforeUpdate(opt, context)
  }

  override async $afterFind(context: QueryContext) {
    if (context.fetchHeritage && this.heritageProps) {
      this.heritageProps = await heritagePropsFormat(this.heritageProps)
    }

    if (context.fetchHeritage && this.heritageContenu) {
      this.heritageContenu = await heritageContenuFormat(this.heritageContenu)
    }

    if (this.typeId !== ETAPES_TYPES.demande) {
      this.concurrence = 'non-applicable'
    } else if (isNotNullNorUndefined(this.demarcheIdEnConcurrence)) {
      const statutDemarcheIdConcurrente = await context.transaction.raw('select public_lecture from titres_demarches where id = ?', [this.demarcheIdEnConcurrence])
      this.concurrence = { amIFirst: false, demarcheConcurrenteVisibilite: statutDemarcheIdConcurrente.rows[0].public_lecture ? 'publique' : 'confidentielle' }
    } else {
      this.concurrence = { amIFirst: true }
    }

    if (this.typeId !== ETAPES_TYPES.demande) {
      this.hasTitreFrom = 'non-applicable'
    } else {
      const titreFromId = await context.transaction.raw('select tt.titre_from_id from titres_demarches td join titres__titres tt on td.titre_id = tt.titre_to_id where td.id= ?', [
        this.titreDemarcheId,
      ])
      this.hasTitreFrom = isNotNullNorUndefinedNorEmpty(titreFromId.rows)
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

  public override $formatDatabaseJson(json: Pojo) {
    delete json.entrepriseDocumentIds
    delete json.etapeDocuments
    delete json.etapeAvis
    delete json.daeDocument
    delete json.aslDocument
    delete json.modification
    delete json.suppression
    delete json.concurrence
    delete json.hasTitreFrom
    json = super.$formatDatabaseJson(json)

    return json
  }

  public override $parseJson(json: Pojo) {
    delete json.modification
    delete json.suppression
    delete json.concurrence
    delete json.hasTitreFrom
    json = super.$parseJson(json)

    return json
  }
}

export default TitresEtapes
