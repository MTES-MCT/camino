import '../init'
import { knex } from '../knex'
import fetch from 'node-fetch'
import Communes from '../database/models/communes'
import JSZip from 'jszip'
import Forets from '../database/models/forets'
import { SDOMZoneId } from '../types'

const communesUpdate = async () => {
  console.info('Téléchargement du fichier des communes')

  const communesFetch = await fetch(
    'http://etalab-datasets.geo.data.gouv.fr/contours-administratifs/latest/geojson/communes-5m.geojson'
  )
  const communesGeojson = await communesFetch.json()

  const communesIdsKnown = (await Communes.query()).map(({ id }) => id)

  console.info('Traitement du fichier des communes')

  for (const commune of communesGeojson.features) {
    try {
      const result = await knex.raw(
        `select ST_MakeValid(ST_MULTI(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
          commune.geometry
        )}'), 4326))) as result`
      )

      if (communesIdsKnown.includes(commune.properties.code)) {
        await knex('communes').where('id', commune.properties.code).update({
          nom: commune.properties.nom,
          departementId: commune.properties.departement,
          geometry: result.rows[0].result
        })
      } else {
        await knex('communes').insert({
          id: commune.properties.code,
          nom: commune.properties.nom,
          departementId: commune.properties.departement,
          geometry: result.rows[0].result
        })
      }
    } catch (e) {
      console.error(commune.properties.nom, e)
    }
  }
}

const geoguyaneFileGet = async (path: string) => {
  const dataUrlFetch = await fetch(path)
  const dataUrlJson = await dataUrlFetch.json()

  console.info('Téléchargement des données', dataUrlJson.data)
  const foretsZip = await fetch(dataUrlJson.data)

  const zipFile = await JSZip.loadAsync(await foretsZip.buffer())

  return JSON.parse(await zipFile.file(/.*\.json$/)[0]!.async('string'))
}

const foretsUpdate = async () => {
  console.info('Téléchargement du fichier des forêts')

  // Cette URl a été obtenue depuis https://catalogue.geoguyane.fr/geosource/panierDownloadFrontalParametrage?LAYERIDTS=91217 en sélectionnant le format GeoJson avec la projection WGS84
  const foretsUrlGenerator =
    'https://telecarto.geoguyane.fr/?email=&direct=MQ%3D%3D&mode=prodige&data_type=vector&service_idx=1&format=anNvbg%3D%3D&projection=NDMyNg%3D%3D&data=UE9TVEdJU19EQVRBJTNBZm9yZXRzX29uZl85NzM%3D&metadata_id=OTEyMTc%3D&bTerritoire=0&territoire_type=&territoire_data=&territoire_area=%25&extractionattributaire_couche=&restricted_area_field=%25&restricted_area_buffer=%25'

  const geojson = await geoguyaneFileGet(foretsUrlGenerator)

  const foretsIdsKnown = (await Forets.query()).map(({ id }) => id)

  console.info('Traitement du fichier des forets')

  for (const foret of geojson.features) {
    try {
      const result = await knex.raw(
        `select ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
          foret.geometry
        )}'), 4326)) as result`
      )

      const id = foret.properties.code_for
      if (foretsIdsKnown.includes(id)) {
        await knex('forets').where('id', id).update({
          nom: foret.properties.foret,
          geometry: result.rows[0].result
        })
      } else {
        await knex('forets').insert({
          id,
          nom: foret.properties.foret,
          geometry: result.rows[0].result
        })
      }
    } catch (e) {
      console.error(foret.properties.nom, e)
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
      id: SDOMZoneId.Zone0Potentielle,
      nom: 'ZONE 0, potentielle',
      url: 'https://telecarto.geoguyane.fr/?email=&direct=MQ%3D%3D&mode=prodige&data_type=vector&service_idx=1&format=anNvbg%3D%3D&projection=NDMyNg%3D%3D&data=UE9TVEdJU19EQVRBJTNBem9uZV8wX3BvdGVudGllbGxlX3NfOTcz&metadata_id=NjYwMzYwMjE%3D&bTerritoire=0&territoire_type=&territoire_data=&territoire_area=%25&extractionattributaire_couche=&restricted_area_field=%25&restricted_area_buffer=%25'
    },
    {
      id: SDOMZoneId.Zone0,
      nom: 'ZONE 0, activité minière interdite',
      url: 'https://telecarto.geoguyane.fr/?email=&direct=MQ%3D%3D&mode=prodige&data_type=vector&service_idx=1&format=anNvbg%3D%3D&projection=NDMyNg%3D%3D&data=UE9TVEdJU19EQVRBJTNBem9uZV8wX3NfOTcz&metadata_id=NjYwMzU4ODE%3D&bTerritoire=0&territoire_type=&territoire_data=&territoire_area=%25&extractionattributaire_couche=&restricted_area_field=%25&restricted_area_buffer=%25'
    },
    {
      id: SDOMZoneId.Zone1,
      nom: 'ZONE 1, activité minière interdite sauf exploitation souterraine et recherches aériennes',
      url: 'https://telecarto.geoguyane.fr/?email=&direct=MQ%3D%3D&mode=prodige&data_type=vector&service_idx=1&format=anNvbg%3D%3D&projection=NDMyNg%3D%3D&data=UE9TVEdJU19EQVRBJTNBem9uZV8xX3NfOTcz&metadata_id=NjYwMzU4ODI%3D&bTerritoire=0&territoire_type=&territoire_data=&territoire_area=%25&extractionattributaire_couche=&restricted_area_field=%25&restricted_area_buffer=%25'
    },
    {
      id: SDOMZoneId.Zone2,
      nom: 'ZONE 2, activité minière autorisée sous contrainte',
      url: 'https://telecarto.geoguyane.fr/?email=&direct=MQ%3D%3D&mode=prodige&data_type=vector&service_idx=1&format=anNvbg%3D%3D&projection=NDMyNg%3D%3D&data=UE9TVEdJU19EQVRBJTNBem9uZV8yX3NfOTcz&metadata_id=NjYwMzU4ODM%3D&bTerritoire=0&territoire_type=&territoire_data=&territoire_area=%25&extractionattributaire_couche=&restricted_area_field=%25&restricted_area_buffer=%25'
    }
  ]

  for (const zone of zones) {
    console.info('Téléchargement du fichier de la ' + zone.nom)

    const geojson = await geoguyaneFileGet(zone.url)

    console.info('Traitement du fichier de la ' + zone.nom)

    try {
      const zoneFeature = geojson.features[0]
      const result = await knex.raw(
        `select ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
          zoneFeature.geometry
        )}'), 4326)) as result`
      )

      await knex('sdom_zones').where('id', zone.id).update({
        nom: zone.nom,
        geometry: result.rows[0].result
      })
    } catch (e) {
      console.error(zone.nom, e)
    }
  }
}

export async function updateTerritoires() {
  console.info('Mise à jour des territoires')
  try {
    await communesUpdate()
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
}
