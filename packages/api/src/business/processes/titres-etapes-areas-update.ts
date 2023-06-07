/* eslint-disable sql/no-unsafe-query */
import { geojsonFeatureMultiPolygon, geojsonIntersectsCommunes, geojsonIntersectsSecteursMaritime, geojsonIntersectsForets, geojsonIntersectsSDOM } from '../../tools/geojson.js'
import { titresEtapesGet } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { Feature } from 'geojson'
import { ITitreEtape } from '../../types.js'
import { getSecteurMaritime, SecteursMaritimes } from 'camino-common/src/static/facades.js'
import { knex } from '../../knex.js'
import { ForetId, isForetId } from 'camino-common/src/static/forets.js'
import { CommuneId, toCommuneId } from 'camino-common/src/static/communes.js'

/**
 * Met à jour tous les territoires d’une liste d’étapes
 * @param titresEtapesIds - liste d’étapes
 * @returns toutes les modifications effectuées
 */
export const titresEtapesAreasUpdate = async (titresEtapesIds?: string[]): Promise<void> => {
  console.info()
  console.info('communes, forêts et zones du SDOM associées aux étapes…')

  const titresEtapes = await titresEtapesGet(
    { titresEtapesIds, etapesTypesIds: null, titresDemarchesIds: null },
    {
      fields: {
        points: { id: {} },
      },
    },
    userSuper
  )

  console.info('étapes chargées')

  for (let i = 0; i < titresEtapes.length; i++) {
    const titreEtape = titresEtapes[i]
    if (i % 1000 === 0) {
      console.info(`${i} étapes traitées`)
    }
    try {
      if (titreEtape.points?.length) {
        const multipolygonGeojson = geojsonFeatureMultiPolygon(titreEtape.points) as Feature
        await intersectForets(multipolygonGeojson, titreEtape)
        await intersectSdom(multipolygonGeojson, titreEtape)
        await intersectCommunes(multipolygonGeojson, titreEtape)
        await intersectSecteursMaritime(multipolygonGeojson, titreEtape)
      }
    } catch (e) {
      console.error(`Une erreur est survenue lors du traitement de l'étape ${titreEtape.id}`)
      throw e
    }
  }
}
async function intersectSdom(multipolygonGeojson: Feature, titreEtape: Pick<ITitreEtape, 'sdomZones' | 'id'>) {
  const sdomZonesIds = await geojsonIntersectsSDOM(multipolygonGeojson)

  if (sdomZonesIds.fallback) {
    if (sdomZonesIds.fallback) {
      console.warn(`utilisation du fallback pour l'étape ${titreEtape.id}`)
    }
  }
  if (sdomZonesIds.data.length > 0) {
    if (sdomZonesIds.data.length !== titreEtape.sdomZones?.length || titreEtape.sdomZones?.some((elem, index) => elem !== sdomZonesIds.data[index])) {
      console.info(`nouvelles zones du sdom pour l'étape ${titreEtape.id}. Anciennes: ${JSON.stringify(titreEtape.sdomZones)}, nouvelles: ${JSON.stringify(sdomZonesIds.data)}`)
      await knex.raw(`update titres_etapes set sdom_zones = '["${sdomZonesIds.data.join('","')}"]' where id ='${titreEtape.id}'`)
    }
  }
}

async function intersectForets(multipolygonGeojson: Feature, titreEtape: Pick<ITitreEtape, 'forets' | 'id'>) {
  if (!titreEtape.forets) {
    throw new Error('les forêts de l’étape ne sont pas chargées')
  }

  const foretIds = await geojsonIntersectsForets(multipolygonGeojson)

  if (foretIds.fallback) {
    console.warn(`utilisation du fallback pour l'étape ${titreEtape.id}`)
  }

  const foretsNew: ForetId[] = foretIds.data.filter(isForetId).sort()
  if (titreEtape.forets?.length !== foretsNew.length || titreEtape.forets.some((value, index) => value !== foretsNew[index])) {
    console.info(`Mise à jour des forêts sur l'étape ${titreEtape.id}, ancien: '${JSON.stringify(titreEtape.forets)}', nouveaux: '${JSON.stringify(foretsNew)}'`)
    await knex('titres_etapes')
      .update({ forets: JSON.stringify(foretsNew) })
      .where('id', titreEtape.id)
  }
}

async function intersectCommunes(multipolygonGeojson: Feature, titreEtape: Pick<ITitreEtape, 'communes' | 'id'>) {
  if (!titreEtape.communes) {
    throw new Error('les communes de l’étape ne sont pas chargées')
  }

  const communes = await geojsonIntersectsCommunes(multipolygonGeojson)

  if (communes.fallback) {
    console.warn(`utilisation du fallback pour l'étape ${titreEtape.id}`)
  }

  const communesNew: { id: CommuneId; surface: number }[] = communes.data.map(({ id, surface }) => ({ id: toCommuneId(id), surface })).sort((a, b) => a.id.localeCompare(b.id))
  if (titreEtape.communes?.length !== communesNew.length || titreEtape.communes.some((value, index) => value.id !== communesNew[index].id || value.surface !== communesNew[index].surface)) {
    console.info(`Mise à jour des communes sur l'étape ${titreEtape.id}, ancien: '${JSON.stringify(titreEtape.communes)}', nouveaux: '${JSON.stringify(communesNew)}'`)
    await knex('titres_etapes')
      .update({ communes: JSON.stringify(communesNew) })
      .where('id', titreEtape.id)
  }
}

async function intersectSecteursMaritime(multipolygonGeojson: Feature, titreEtape: Pick<ITitreEtape, 'secteursMaritime' | 'id'>) {
  const secteurMaritimeIds = await geojsonIntersectsSecteursMaritime(multipolygonGeojson)

  if (secteurMaritimeIds.fallback) {
    console.warn(`utilisation du fallback pour l'étape ${titreEtape.id}`)
  }

  const secteurMaritimeNew: SecteursMaritimes[] = secteurMaritimeIds.data.map(getSecteurMaritime).sort()
  if (titreEtape.secteursMaritime?.length !== secteurMaritimeNew.length || titreEtape.secteursMaritime.some((value, index) => value !== secteurMaritimeNew[index])) {
    console.info(`Mise à jour des secteurs maritimes sur l'étape ${titreEtape.id}, ancien: '${titreEtape.secteursMaritime}', nouveaux: '${secteurMaritimeNew}'`)
    await knex('titres_etapes')
      .update({ secteursMaritime: JSON.stringify(secteurMaritimeNew) })
      .where('id', titreEtape.id)
  }
}
