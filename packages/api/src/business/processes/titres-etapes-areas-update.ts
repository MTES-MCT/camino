import {
  geojsonFeatureMultiPolygon,
  geojsonIntersectsCommunes,
  geojsonIntersectsForets,
  geojsonIntersectsSDOM
} from '../../tools/geojson'
import { titresEtapesGet } from '../../database/queries/titres-etapes'
import TitresCommunes from '../../database/models/titres-communes'
import TitresForets from '../../database/models/titres-forets'
import { userSuper } from '../../database/user-super'
import TitresSDOMZones from '../../database/models/titres--sdom-zones'
import { Feature } from '@turf/helpers'

/**
 * Met à jour tous les territoires d’une liste d’étapes
 * @param titresEtapesIds - liste d’étapes
 * @returns toutes les modifications effectuées
 */
export const titresEtapesAreasUpdate = async (
  titresEtapesIds?: string[]
): Promise<void> => {
  console.info()
  console.info('communes, forêts et zones du SDOM associées aux étapes…')

  const titresEtapes = await titresEtapesGet(
    { titresEtapesIds, etapesTypesIds: null, titresDemarchesIds: null },
    {
      fields: {
        points: { id: {} },
        communes: { id: {} },
        forets: { id: {} },
        sdomZones: { id: {} }
      }
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
      if (!titreEtape.forets) {
        throw new Error('les forêts de l’étape ne sont pas chargées')
      }
      if (!titreEtape.communes) {
        throw new Error('les communes de l’étape ne sont pas chargées')
      }
      if (!titreEtape.sdomZones) {
        throw new Error('les zones du SDOM de l’étape ne sont pas chargées')
      }
      if (titreEtape.points?.length) {
        const multipolygonGeojson = geojsonFeatureMultiPolygon(
          titreEtape.points
        ) as Feature
        const foretIds = await geojsonIntersectsForets(multipolygonGeojson)

        for (const foretId of foretIds) {
          if (!titreEtape.forets.some(({ id }) => id === foretId)) {
            await TitresForets.query().insert({
              titreEtapeId: titreEtape.id,
              foretId
            })
            console.info(
              `Ajout de la forêt ${foretId} sur l'étape ${titreEtape.id}`
            )
          }
        }
        for (const foret of titreEtape.forets) {
          if (!foretIds.some(id => id === foret.id)) {
            await TitresForets.query()
              .delete()
              .where('titreEtapeId', titreEtape.id)
              .andWhere('foretId', foret.id)
            console.info(
              `Suppression de la forêt ${foret.id} sur l'étape ${titreEtape.id}`
            )
          }
        }

        const sdomZonesIds = await geojsonIntersectsSDOM(multipolygonGeojson)

        for (const sdomZoneId of sdomZonesIds) {
          if (!titreEtape.sdomZones.some(({ id }) => id === sdomZoneId)) {
            await TitresSDOMZones.query().insert({
              titreEtapeId: titreEtape.id,
              sdomZoneId
            })
            console.info(
              `Ajout de la zone du SDOM ${sdomZoneId} sur l'étape ${titreEtape.id}`
            )
          }
        }
        for (const sdomZone of titreEtape.sdomZones) {
          if (!sdomZonesIds.some(id => id === sdomZone.id)) {
            await TitresSDOMZones.query()
              .delete()
              .where('titreEtapeId', titreEtape.id)
              .andWhere('sdomZoneId', sdomZone.id)
            console.info(
              `Suppression de la zone du SDOM ${sdomZone.id} sur l'étape ${titreEtape.id}`
            )
          }
        }

        const communes = await geojsonIntersectsCommunes(multipolygonGeojson)

        for (const commune of communes) {
          const oldCommune = titreEtape.communes.find(
            ({ id }) => id === commune.id
          )
          if (!oldCommune) {
            await TitresCommunes.query().insert({
              titreEtapeId: titreEtape.id,
              communeId: commune.id,
              surface: commune.surface
            })
            console.info(
              `Ajout de la commune ${commune.id} sur l'étape ${titreEtape.id}`
            )
          } else if (oldCommune.surface !== commune.surface) {
            await TitresCommunes.query()
              .patch({
                surface: commune.surface
              })
              .where('titreEtapeId', titreEtape.id)
              .andWhere('communeId', commune.id)
            console.info(
              `Mise à jour de la surface de la commune ${commune.id} sur l'étape ${titreEtape.id} (${oldCommune.surface} -> ${commune.surface})`
            )
          }
        }
        for (const commune of titreEtape.communes) {
          if (!communes.some(({ id }) => id === commune.id)) {
            await TitresCommunes.query()
              .delete()
              .where('titreEtapeId', titreEtape.id)
              .andWhere('communeId', commune.id)
            console.info(
              `Suppression de la commune ${commune.id} sur l'étape ${titreEtape.id}`
            )
          }
        }
      }
    } catch (e) {
      console.error(
        `Une erreur est survenue lors du traitement de l'étape ${titreEtape.id}`
      )
      throw e
    }
  }
}
