/* eslint-disable sql/no-unsafe-query */
import { geojsonIntersectsCommunes } from '../../tools/geojson.js'
import { titresEtapesGet } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { ITitreEtape } from '../../types.js'
import { SecteursMaritimes } from 'camino-common/src/static/facades.js'
import { knex } from '../../knex.js'
import { ForetId } from 'camino-common/src/static/forets.js'
import { CommuneId, toCommuneId } from 'camino-common/src/static/communes.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { getGeojsonInformation } from '../../api/rest/perimetre.queries.js'
import type { Pool } from 'pg'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'

/**
 * Met à jour tous les territoires d’une liste d’étapes
 * @param titresEtapesIds - liste d’étapes
 * @returns toutes les modifications effectuées
 */
export const titresEtapesAreasUpdate = async (pool: Pool, titresEtapesIds?: string[]): Promise<void> => {
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
      if (isNotNullNorUndefined(titreEtape.geojson4326Perimetre)) {

        const {forets, sdom, secteurs} = await getGeojsonInformation(pool, titreEtape.geojson4326Perimetre.geometry)
        
        await intersectForets(titreEtape, forets)
        await intersectSdom(titreEtape, sdom)
        await intersectCommunes(titreEtape)
        await intersectSecteursMaritime(titreEtape, secteurs)
      }
    } catch (e) {
      console.error(`Une erreur est survenue lors du traitement de l'étape ${titreEtape.id}`)
      throw e
    }
  }
}
async function intersectSdom(titreEtape: Pick<ITitreEtape, 'sdomZones' | 'id'>, sdomZonesIds: SDOMZoneId[]) {

  if (sdomZonesIds.length > 0) {
    if (sdomZonesIds.length !== titreEtape.sdomZones?.length || titreEtape.sdomZones?.some((elem, index) => elem !== sdomZonesIds[index])) {
      console.info(`nouvelles zones du sdom pour l'étape ${titreEtape.id}. Anciennes: ${JSON.stringify(titreEtape.sdomZones)}, nouvelles: ${JSON.stringify(sdomZonesIds)}`)
      await knex.raw(`update titres_etapes set sdom_zones = '["${sdomZonesIds.join('","')}"]' where id ='${titreEtape.id}'`)
    }
  }
}

async function intersectForets(titreEtape: Pick<ITitreEtape, 'forets' | 'id'>, foretsNew: ForetId[]) {
  if (!titreEtape.forets) {
    throw new Error('les forêts de l’étape ne sont pas chargées')
  }

  if (titreEtape.forets?.length !== foretsNew.length || titreEtape.forets.some((value, index) => value !== foretsNew[index])) {
    console.info(`Mise à jour des forêts sur l'étape ${titreEtape.id}, ancien: '${JSON.stringify(titreEtape.forets)}', nouveaux: '${JSON.stringify(foretsNew)}'`)
    await knex('titres_etapes')
      .update({ forets: JSON.stringify(foretsNew) })
      .where('id', titreEtape.id)
  }
}

async function intersectCommunes(titreEtape: Pick<ITitreEtape, 'communes' | 'id' | 'geojson4326Perimetre'>) {
  if (!titreEtape.communes) {
    throw new Error('les communes de l’étape ne sont pas chargées')
  }

  const communes = isNotNullNorUndefined(titreEtape.geojson4326Perimetre) ? await geojsonIntersectsCommunes(titreEtape.geojson4326Perimetre) : {fallback: false, data: []}

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

async function intersectSecteursMaritime(titreEtape: Pick<ITitreEtape, 'secteursMaritime' | 'id'>, secteursMaritime: SecteursMaritimes[]) {
  const secteurMaritimeNew: SecteursMaritimes[] = [...secteursMaritime].sort()
  if (titreEtape.secteursMaritime?.length !== secteurMaritimeNew.length || titreEtape.secteursMaritime.some((value, index) => value !== secteurMaritimeNew[index])) {
    console.info(`Mise à jour des secteurs maritimes sur l'étape ${titreEtape.id}, ancien: '${titreEtape.secteursMaritime}', nouveaux: '${secteurMaritimeNew}'`)
    await knex('titres_etapes')
      .update({ secteursMaritime: JSON.stringify(secteurMaritimeNew) })
      .where('id', titreEtape.id)
  }
}
