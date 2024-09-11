/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Model, Pojo, QueryContext, ref } from 'objection'

import { ITitre } from '../../types'
import TitresDemarches from './titres-demarches'
import TitresEtapes from './titres-etapes'
import { idGenerate, newTitreSlug } from './_format/id-create'
import TitresActivites from './titres-activites'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'

export interface DBTitre extends ITitre {
  archive: boolean
}

interface Titres extends DBTitre {}

class Titres extends Model {
  public static override tableName = 'titres'

  public static override jsonSchema = {
    type: 'object',
    required: ['nom', 'typeId'],
    properties: {
      id: { type: 'string' },
      slug: { type: 'string' },
      nom: { type: 'string' },
      typeId: { type: 'string', maxLength: 3 },
      titreStatutId: { type: 'string', maxLength: 3 },
      propsTitreEtapesIds: { type: 'object' },
      doublonTitreId: { type: ['string', 'null'] },
      archive: { type: 'boolean' },
      references: { type: ['array', 'null'] },
    },
  }

  static override relationMappings = () => ({
    demarches: {
      relation: Model.HasManyRelation,
      modelClass: TitresDemarches,
      join: { from: 'titres.id', to: 'titresDemarches.titreId' },
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

    titulairesEtape: {
      relation: Model.BelongsToOneRelation,
      modelClass: TitresEtapes,
      join: {
        from: ref('titres.propsTitreEtapesIds:titulaires').castText(),
        to: 'titresEtapes.id',
      },
    },

    amodiatairesEtape: {
      relation: Model.BelongsToOneRelation,
      modelClass: TitresEtapes,
      join: {
        from: ref('titres.propsTitreEtapesIds:amodiataires').castText(),
        to: 'titresEtapes.id',
      },
    },

    activites: {
      relation: Model.HasManyRelation,
      modelClass: TitresActivites,
      join: { from: 'titres.id', to: 'titresActivites.titreId' },
    },
  })

  override async $beforeInsert(context: QueryContext) {
    if (isNullOrUndefined(this.id)) {
      this.id = idGenerate()
    }

    if (isNullOrUndefined(this.slug) && isNotNullNorUndefined(this.typeId) && isNotNullNorUndefined(this.nom)) {
      this.slug = newTitreSlug(this.typeId, this.nom)
    }

    return super.$beforeInsert(context)
  }

  override $afterFind() {
    if (this.substancesEtape === null) {
      this.substances = []
    } else if (this.substancesEtape === undefined) {
      this.substances = undefined
    } else {
      this.substances = this.substancesEtape.substances
    }

    if (this.titulairesEtape === null) {
      this.titulaireIds = []
    } else if (this.titulairesEtape === undefined) {
      this.titulaireIds = undefined
    } else {
      this.titulaireIds = this.titulairesEtape.titulaireIds
    }

    if (this.amodiatairesEtape === null) {
      this.amodiataireIds = []
    } else if (this.amodiatairesEtape === undefined) {
      this.amodiataireIds = undefined
    } else {
      this.amodiataireIds = this.amodiatairesEtape.amodiataireIds
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

  public override $parseJson(json: Pojo) {
    json = titreInsertFormat(json)
    json = super.$parseJson(json)

    return json
  }

  public override $formatDatabaseJson(json: Pojo) {
    json = titreInsertFormat(json)
    json = super.$formatDatabaseJson(json)

    return json
  }
}

const titreInsertFormat = (json: Pojo) => {
  delete json.communes
  delete json.surface
  delete json.contenu
  delete json.activitesAbsentes
  delete json.activitesEnConstruction
  delete json.abonnement
  delete json.geojson4326Centre
  delete json.geojson4326Perimetre

  return json
}

export default Titres
