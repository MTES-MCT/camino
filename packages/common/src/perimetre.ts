import { z } from 'zod'
import { communeIdValidator } from './static/communes.js'
import { secteurDbIdValidator } from './static/facades.js'
import { foretIdValidator } from './static/forets.js'
import { sdomZoneIdValidator } from './static/sdom.js'
import { titreStatutIdValidator } from './static/titresStatuts.js'
import { titreSlugValidator } from './validators/titres.js'
import { tempDocumentNameValidator } from './document.js'
import { titreTypeIdValidator } from './static/titresTypes.js'
import { perimetreFileUploadTypeValidator } from './static/documentsTypes.js'
import { isNullOrUndefined } from './typescript-tools.js'
import { km2Validator } from './number.js'

export const tupleCoordinateValidator = z.tuple([z.number(), z.number()])

export const polygonCoordinatesValidator  = z.array(z.array(tupleCoordinateValidator).min(3)).min(1)
export const multiPolygonValidator = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(polygonCoordinatesValidator).min(1),
})
export type MultiPolygon = z.infer<typeof multiPolygonValidator>

const nullToEmptyObject = (val: null | NonNullable<unknown>): NonNullable<unknown> => {
  if (isNullOrUndefined(val)) {
    return {}
  }

  return val
}

export const featureMultiPolygonValidator = z.object({ type: z.literal('Feature'), geometry: multiPolygonValidator, properties: z.object({}).nullable().transform(nullToEmptyObject) })
export type FeatureMultiPolygon = z.infer<typeof featureMultiPolygonValidator>

const pointValidator = z.object({ type: z.literal('Point'), coordinates: tupleCoordinateValidator })
export type GeojsonPoint = z.infer<typeof pointValidator>
const featurePointValidator = z.object({ type: z.literal('Feature'), geometry: pointValidator, properties: z.object({ nom: z.string().nullish(), description: z.string().nullish() }) })

export type GeojsonFeaturePoint = z.infer<typeof featurePointValidator>

export const featureCollectionValidator = z.object({
  type: z.literal('FeatureCollection'),
  properties: z.any().optional(),
  features: z.tuple([featureMultiPolygonValidator]).rest(featurePointValidator),
})

export const featureCollectionPointsValidator = z.object({ type: z.literal('FeatureCollection'), features: z.array(featurePointValidator) })

export type FeatureCollectionPoints = z.infer<typeof featureCollectionPointsValidator>

export type FeatureCollection = z.infer<typeof featureCollectionValidator>
const superpositionAlerteValidator = z.object({ slug: titreSlugValidator, nom: z.string(), titre_statut_id: titreStatutIdValidator })

export const geojsonInformationsValidator = z.object({
  superposition_alertes: z.array(superpositionAlerteValidator),
  surface: km2Validator,
  sdomZoneIds: z.array(sdomZoneIdValidator),
  foretIds: z.array(foretIdValidator),
  communes: z.array(z.object({ id: communeIdValidator, nom: z.string() })),
  secteurMaritimeIds: z.array(secteurDbIdValidator),
  geojson4326_perimetre: featureMultiPolygonValidator,
  geojson4326_points: featureCollectionPointsValidator.nullable(),
})

export type GeojsonInformations = z.infer<typeof geojsonInformationsValidator>

export const perimetreInformationsValidator = geojsonInformationsValidator.pick({ superposition_alertes: true, sdomZoneIds: true })
export type PerimetreInformations = z.infer<typeof perimetreInformationsValidator>

export const geojsonImportBodyValidator = z.object({
  tempDocumentName: tempDocumentNameValidator,
  fileType: perimetreFileUploadTypeValidator,
  titreTypeId: titreTypeIdValidator,
  titreSlug: titreSlugValidator,
})

export type GeojsonImportBody = z.infer<typeof geojsonImportBodyValidator>

const internalEqualGeojson = (geo1: MultiPolygon, geo2: MultiPolygon): boolean => {
  for (let indexLevel1 = 0; indexLevel1 < geo1.coordinates.length; indexLevel1++) {
    for (let indexLevel2 = 0; indexLevel2 < geo1.coordinates[indexLevel1].length; indexLevel2++) {
      for (let indexLevel3 = 0; indexLevel3 < geo1.coordinates[indexLevel1][indexLevel2].length; indexLevel3++) {
        if (
          geo1.coordinates[indexLevel1][indexLevel2][indexLevel3][0] !== geo2.coordinates[indexLevel1][indexLevel2][indexLevel3][0] ||
          geo1.coordinates[indexLevel1][indexLevel2][indexLevel3][1] !== geo2.coordinates[indexLevel1][indexLevel2][indexLevel3][1]
        ) {
          return false
        }
      }
    }
  }

  return true
}

// FIXME tests bugs potentiels
export const equalGeojson = (geo1: MultiPolygon, geo2: MultiPolygon | null | undefined): boolean => {
  if (isNullOrUndefined(geo2)) {
    return false
  }
 return internalEqualGeojson(geo1, geo2) && internalEqualGeojson(geo2, geo1)
}