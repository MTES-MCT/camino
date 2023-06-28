/* eslint-disable sql/no-unsafe-query */
import '../init.js'
import { knex } from '../knex.js'
import Communes from '../database/models/communes.js'
import JSZip from 'jszip'
import { Readable } from 'node:stream'
import { SDOMZoneId, SDOMZoneIds } from 'camino-common/src/static/sdom.js'
import { assertsFacade, assertsSecteur, secteurAJour } from 'camino-common/src/static/facades.js'
import { createRequire } from 'node:module'
import { ForetId, ForetIds, Forets } from 'camino-common/src/static/forets.js'
import { Pool } from 'pg'
import { insertCommune } from '../database/queries/communes.queries.js'
import { toCommuneId } from 'camino-common/src/static/communes.js'

const require = createRequire(import.meta.url)
const { streamArray } = require('stream-json/streamers/StreamArray')
const { withParser } = require('stream-json/filters/Pick')
const { chain } = require('stream-chain')

const communesUpdate = async (pool: Pool) => {
  const communesIdsKnown: string[] = (await Communes.query()).map(({ id }) => id)
  const communesPostgisIdsKnown: string[] = (await knex.select('id').from('communes_postgis')).map(({ id }: { id: string }) => id)
  console.info('Téléchargement du fichier des communes')

  const communesFetch = await fetch('http://etalab-datasets.geo.data.gouv.fr/contours-administratifs/latest/geojson/communes-5m.geojson')

  console.info('Traitement du fichier des communes')
  if (communesFetch.body === null) {
    throw new Error('Les communes sont vides')
  }
  const pipeline = chain([
    // @ts-expect-error
    Readable.fromWeb(communesFetch.body),
    withParser({ filter: 'features' }),
    streamArray(),
    async ({ key, value }: { key: number; value: any }) => {
      if (key % 1000 === 0) {
        console.info(`${key} communes gérées`)
      }
      const commune = value
      try {
        const result = await knex.raw(`select ST_MakeValid(ST_MULTI(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(commune.geometry)}'), 4326))) as result`)

        if (communesPostgisIdsKnown.includes(commune.properties.code)) {
          await knex('communes_postgis').where('id', commune.properties.code).update({
            geometry: result.rows[0].result,
          })
        } else {
          await knex('communes_postgis').insert({
            id: commune.properties.code,
            geometry: result.rows[0].result,
          })
        }
        if (communesIdsKnown.includes(commune.properties.code)) {
          await knex('communes').where('id', commune.properties.code).update({
            nom: commune.properties.nom,
          })
        } else {
          await insertCommune(pool, {
            id: toCommuneId(commune.properties.code),
            nom: commune.properties.nom,
          })
        }
      } catch (e) {
        console.error(commune.properties.nom, e)
      }
    },
  ])
  const promise = new Promise<void>((resolve, reject) => {
    pipeline.on('error', (error: any) => {
      console.error('Erreur lors de la gestion des communes', error)
      reject(error)
    })
    pipeline.on('finish', () => {
      console.info('Fin de gestion des communes')
      resolve()
    })
  })

  await promise
}

const geoguyaneFileGet = async (path: string) => {
  const dataUrlFetch = await fetch(path)
  const dataUrlJson = await dataUrlFetch.json().then((value: any) => value as { data: any })

  console.info('Téléchargement des données', dataUrlJson.data)
  const foretsZip = await fetch(dataUrlJson.data)

  const zipFile = await JSZip.loadAsync(await foretsZip.arrayBuffer())

  return JSON.parse(await zipFile.file(/.*\.json$/)[0]!.async('string'))
}

const foretsUpdate = async () => {
  console.info('Téléchargement du fichier des forêts')

  // Cette URl a été obtenue depuis https://catalogue.geoguyane.fr/geosource/panierDownloadFrontalParametrage?LAYERIDTS=91217 en sélectionnant le format GeoJson avec la projection WGS84
  const foretsUrlGenerator =
    'https://telecarto.geoguyane.fr/?email=&direct=MQ%3D%3D&mode=prodige&data_type=vector&service_idx=1&format=anNvbg%3D%3D&projection=NDMyNg%3D%3D&data=UE9TVEdJU19EQVRBJTNBZm9yZXRzX29uZl85NzM%3D&metadata_id=OTEyMTc%3D&bTerritoire=0&territoire_type=&territoire_data=&territoire_area=%25&extractionattributaire_couche=&restricted_area_field=%25&restricted_area_buffer=%25'

  const geojson = await geoguyaneFileGet(foretsUrlGenerator)

  const foretsPostgisIdsKnown: string[] = (await knex.select('id').from('forets_postgis')).map(({ id }: { id: string }) => id)

  console.info('Traitement du fichier des forets')

  const ids: ForetId[] = []
  for (const foret of geojson.features) {
    try {
      const result = await knex.raw(`select ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(foret.geometry)}'), 4326)) as result`)

      const id: ForetId = foret.properties.code_for
      ids.push(id)
      if (foretsPostgisIdsKnown.includes(id)) {
        await knex('forets_postgis').where('id', id).update({
          geometry: result.rows[0].result,
        })
      } else {
        await knex('forets_postgis').insert({
          id,
          geometry: result.rows[0].result,
        })
      }
      if (Forets[id] && Forets[id].nom !== foret.properties.foret) {
        console.error(`Le nom de la forêt ${id} a changé '${Forets[id].nom}' --> ${foret.properties.foret}`)
      }
    } catch (e) {
      console.error(foret.properties.nom, e)
    }
  }

  if (ids.some(id => !ForetIds.includes(id)) || ForetIds.some(fId => !ids.includes(fId))) {
    console.error(`les forêts ne sont pas à jour dans le common: ${ForetIds} --> ${ids}`)
  }
}

const secteursMaritimeUpdates = async () => {
  console.info('Téléchargement du fichier des secteurs maritimes')

  // Cette URl a été obtenue depuis https://gisdata.cerema.fr/arcgis/rest/services/Carte_vocation_dsf_2020/MapServer/0/query avec where 1=1 et outfields 'secteur,facade,OBJECTID,id'
  const secteursUrl =
    'https://gisdata.cerema.fr/arcgis/rest/services/Carte_vocation_dsf_2020/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=secteur%2Cfacade%2COBJECTID%2Cid&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&f=geojson'

  const secteurs = await (await fetch(secteursUrl)).json().then((value: any) => value as { features: any[] })

  const secteurIdsKnown: number[] = (await knex.select('id').from('secteurs_maritime_postgis')).map(({ id }: any) => id)
  for (const secteur of secteurs.features) {
    try {
      const id: number = secteur.id
      const nomFacade: string = secteur.properties.facade
      const nomSecteur: string = secteur.properties.secteur
      const secteurId = secteur.properties.id

      assertsFacade(nomFacade)
      assertsSecteur(nomFacade, nomSecteur)

      if (!secteurAJour(nomFacade, nomSecteur, id, secteurId)) {
        throw new Error(`L'id ou le secteur id a changé '${nomFacade}', '${nomSecteur}', '${secteurId}', '${id}'`)
      }

      const result = await knex.raw(`select ST_MakeValid(ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(secteur.geometry)}'), 4326))) as result`)

      if (secteurIdsKnown.includes(id)) {
        await knex('secteurs_maritime_postgis').where('id', id).update({
          geometry: result.rows[0].result,
        })
      } else {
        await knex('secteurs_maritime_postgis').insert({
          id,
          geometry: result.rows[0].result,
        })
      }
    } catch (e) {
      console.error(secteur.properties.secteur, e)
    }
  }
}

const sdomZonesUpdate = async () => {
  // https://catalogue.geoguyane.fr/geosource/panierDownloadFrontalParametrage/b6bc9b5d-fe7f-4fde-9d75-f512e5a33374
  // https://catalogue.geoguyane.fr/geosource/panierDownloadFrontalParametrage/cacbd740-dbb1-421e-af2d-96c9f0bd9a6d
  // https://catalogue.geoguyane.fr/geosource/panierDownloadFrontalParametrage/c224cfbe-e24e-418b-ad3f-44c07ee19862
  // https://catalogue.geoguyane.fr/geosource/panierDownloadFrontalParametrage/125ffae0-53a5-431e-9568-5213b6643608
  const zones: { id: SDOMZoneId; nom: string; url: string }[] = [
    {
      id: SDOMZoneIds.Zone0Potentielle,
      nom: 'ZONE 0, potentielle',
      url: 'https://telecarto.geoguyane.fr/?email=&direct=MQ%3D%3D&mode=prodige&data_type=vector&service_idx=1&format=anNvbg%3D%3D&projection=NDMyNg%3D%3D&data=UE9TVEdJU19EQVRBJTNBem9uZV8wX3BvdGVudGllbGxlX3NfOTcz&metadata_id=NjYwMzYwMjE%3D&bTerritoire=0&territoire_type=&territoire_data=&territoire_area=%25&extractionattributaire_couche=&restricted_area_field=%25&restricted_area_buffer=%25',
    },
    {
      id: SDOMZoneIds.Zone0,
      nom: 'ZONE 0, activité minière interdite',
      url: 'https://telecarto.geoguyane.fr/?email=&direct=MQ%3D%3D&mode=prodige&data_type=vector&service_idx=1&format=anNvbg%3D%3D&projection=NDMyNg%3D%3D&data=UE9TVEdJU19EQVRBJTNBem9uZV8wX3NfOTcz&metadata_id=NjYwMzU4ODE%3D&bTerritoire=0&territoire_type=&territoire_data=&territoire_area=%25&extractionattributaire_couche=&restricted_area_field=%25&restricted_area_buffer=%25',
    },
    {
      id: SDOMZoneIds.Zone1,
      nom: 'ZONE 1, activité minière interdite sauf exploitation souterraine et recherches aériennes',
      url: 'https://telecarto.geoguyane.fr/?email=&direct=MQ%3D%3D&mode=prodige&data_type=vector&service_idx=1&format=anNvbg%3D%3D&projection=NDMyNg%3D%3D&data=UE9TVEdJU19EQVRBJTNBem9uZV8xX3NfOTcz&metadata_id=NjYwMzU4ODI%3D&bTerritoire=0&territoire_type=&territoire_data=&territoire_area=%25&extractionattributaire_couche=&restricted_area_field=%25&restricted_area_buffer=%25',
    },
    {
      id: SDOMZoneIds.Zone2,
      nom: 'ZONE 2, activité minière autorisée sous contrainte',
      url: 'https://telecarto.geoguyane.fr/?email=&direct=MQ%3D%3D&mode=prodige&data_type=vector&service_idx=1&format=anNvbg%3D%3D&projection=NDMyNg%3D%3D&data=UE9TVEdJU19EQVRBJTNBem9uZV8yX3NfOTcz&metadata_id=NjYwMzU4ODM%3D&bTerritoire=0&territoire_type=&territoire_data=&territoire_area=%25&extractionattributaire_couche=&restricted_area_field=%25&restricted_area_buffer=%25',
    },
  ]

  for (const zone of zones) {
    console.info('Téléchargement du fichier de la ' + zone.nom)

    const geojson = await geoguyaneFileGet(zone.url)

    console.info('Traitement du fichier de la ' + zone.nom)

    const sdomZonesPostgisIdsKnown: string[] = (await knex.select('id').from('sdom_zones_postgis')).map(({ id }: { id: string }) => id)

    try {
      const zoneFeature = geojson.features[0]
      const result = await knex.raw(`select ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(zoneFeature.geometry)}'), 4326)) as result`)

      if (sdomZonesPostgisIdsKnown.includes(zone.id)) {
        await knex('sdom_zones_postgis').where('id', zone.id).update({
          geometry: result.rows[0].result,
        })
      } else {
        await knex('sdom_zones_postgis').insert({
          id: zone.id,
          geometry: result.rows[0].result,
        })
      }
    } catch (e) {
      console.error(zone.nom, e)
    }
  }
}

export async function updateTerritoires(pool: Pool) {
  console.info('Mise à jour des territoires')
  try {
    await communesUpdate(pool)
  } catch (e) {
    console.error(`impossible de mettre à jour les communes`, e)
  }
  try {
    await foretsUpdate()
  } catch (e) {
    console.error(`impossible de mettre à jour les forêts`, e)
  }
  try {
    await sdomZonesUpdate()
  } catch (e) {
    console.error(`impossible de mettre à jour les zones du SDOM`, e)
  }
  try {
    await secteursMaritimeUpdates()
  } catch (e) {
    console.error(`impossible de mettre à jour les secteurs maritimes`, e)
  }
}
