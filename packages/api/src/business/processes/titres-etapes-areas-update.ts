/* eslint-disable sql/no-unsafe-query */
import { titresEtapesGet } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { ITitreEtape } from '../../types.js'
import { SecteursMaritimes, SecteursMaritimesIds, getSecteurMaritime } from 'camino-common/src/static/facades.js'
import { knex } from '../../knex.js'
import { ForetId } from 'camino-common/src/static/forets.js'
import { CommuneId, toCommuneId } from 'camino-common/src/static/communes.js'
import { isNotNullNorUndefined, onlyUnique } from 'camino-common/src/typescript-tools.js'
import { getGeojsonInformation } from '../../api/rest/perimetre.queries.js'
import type { Pool } from 'pg'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { M2 } from 'camino-common/src/number.js'

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
        id: {},
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
        const { forets, sdom, secteurs, communes } = await getGeojsonInformation(pool, titreEtape.geojson4326Perimetre.geometry)

        await intersectForets(titreEtape, forets)
        await intersectSdom(titreEtape, sdom)
        await intersectCommunes(titreEtape, communes)
        await intersectSecteursMaritime(titreEtape, secteurs)
      }
    } catch (e) {
      console.error(`Une erreur est survenue lors du traitement de l'étape ${titreEtape.id}`)
    }
  }
}
async function intersectSdom(titreEtape: Pick<ITitreEtape, 'sdomZones' | 'id'>, sdomZonesIds: SDOMZoneId[]) {
  if (sdomZonesIds.length > 0) {
    const sortedSdomZonesIds = [...sdomZonesIds.sort()]

    if (sortedSdomZonesIds.length !== titreEtape.sdomZones?.length || titreEtape.sdomZones?.some((elem, index) => elem !== sortedSdomZonesIds[index])) {
      console.info(`nouvelles zones du sdom pour l'étape ${titreEtape.id}. Anciennes: ${JSON.stringify(titreEtape.sdomZones)}, nouvelles: ${JSON.stringify(sortedSdomZonesIds)}`)
      await knex.raw(`update titres_etapes set sdom_zones = '["${sortedSdomZonesIds.join('","')}"]' where id ='${titreEtape.id}'`)
    }
  }
}

async function intersectForets(titreEtape: Pick<ITitreEtape, 'forets' | 'id'>, foretsNew: ForetId[]) {
  if (!titreEtape.forets) {
    throw new Error('les forêts de l’étape ne sont pas chargées')
  }

  const sortedForets = [...foretsNew.sort()]

  if (titreEtape.forets?.length !== sortedForets.length || titreEtape.forets.some((value, index) => value !== sortedForets[index])) {
    console.info(`Mise à jour des forêts sur l'étape ${titreEtape.id}, ancien: '${JSON.stringify(titreEtape.forets)}', nouveaux: '${JSON.stringify(sortedForets)}'`)
    await knex('titres_etapes')
      .update({ forets: JSON.stringify(sortedForets) })
      .where('id', titreEtape.id)
  }
}

async function intersectCommunes(titreEtape: Pick<ITitreEtape, 'communes' | 'id' | 'geojson4326Perimetre'>, communes: { id: CommuneId; surface: M2 }[]) {
  const communesNew: { id: CommuneId; surface: M2 }[] = communes.map(({ id, surface }) => ({ id: toCommuneId(id), surface })).sort((a, b) => a.id.localeCompare(b.id))
  if (titreEtape.communes?.length !== communesNew.length || titreEtape.communes.some((value, index) => value.id !== communesNew[index].id || value.surface !== communesNew[index].surface)) {
    console.info(`Mise à jour des communes sur l'étape ${titreEtape.id}, ancien: '${JSON.stringify(titreEtape.communes)}', nouveaux: '${JSON.stringify(communesNew)}'`)
    await knex('titres_etapes')
      .update({ communes: JSON.stringify(communesNew) })
      .where('id', titreEtape.id)
  }
}

async function intersectSecteursMaritime(titreEtape: Pick<ITitreEtape, 'secteursMaritime' | 'id'>, secteursMaritime: SecteursMaritimesIds[]) {
  const secteurMaritimeNew: SecteursMaritimes[] = [...secteursMaritime.map(id => getSecteurMaritime(id))].filter(onlyUnique).sort()
  if (titreEtape.secteursMaritime?.length !== secteurMaritimeNew.length || titreEtape.secteursMaritime.some((value, index) => value !== secteurMaritimeNew[index])) {
    console.info(`Mise à jour des secteurs maritimes sur l'étape ${titreEtape.id}, ancien: '${titreEtape.secteursMaritime}', nouveaux: '${secteurMaritimeNew}'`)
    await knex('titres_etapes')
      .update({ secteursMaritime: JSON.stringify(secteurMaritimeNew) })
      .where('id', titreEtape.id)
  }
}
