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
import { GeoSystemeId, geoSystemeIdValidator } from './static/geoSystemes.js'

// [longitude, latitude]
const tupleCoordinateValidator = z.tuple([z.number(), z.number()])

const polygonCoordinatesValidator = z.array(z.array(tupleCoordinateValidator).min(3)).min(1)
export const multiPolygonValidator = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(polygonCoordinatesValidator).min(1),
})
export type MultiPolygon = z.infer<typeof multiPolygonValidator>

export const multiPointsValidator = z.object({
  type: z.literal('MultiPoint'),
  coordinates: z.array(tupleCoordinateValidator).min(1),
})
export type MultiPoint = z.infer<typeof multiPointsValidator>

const nullToEmptyObject = (val: null | NonNullable<unknown>): NonNullable<unknown> => {
  if (isNullOrUndefined(val)) {
    return {}
  }

  return val
}

const featureValidator = z.object({ type: z.literal('Feature'), properties: z.object({}).nullable().transform(nullToEmptyObject) })

export const featureMultiPolygonValidator = featureValidator.extend({ geometry: multiPolygonValidator })
export type FeatureMultiPolygon = z.infer<typeof featureMultiPolygonValidator>

const pointValidator = z.object({ type: z.literal('Point'), coordinates: tupleCoordinateValidator })
export type GeojsonPoint = z.infer<typeof pointValidator>
const featurePointValidator = z.object({ type: z.literal('Feature'), geometry: pointValidator, properties: z.object({ nom: z.string().nullish(), description: z.string().nullish() }) })

export type GeojsonFeaturePoint = z.infer<typeof featurePointValidator>

// d'après la spec --> https://www.ogc.org/about-ogc/policies/ogc-urn-policy/ : “urn:ogc:def” “:” objectType “:” authority “:” [ version ] “:” code
// donc nous `objectType` est tout le temps 'crs', `authority` est tout le temps 'EPSG'
// un exemple de ce que génère QGis
// "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::2972" } },
/** @public (knip) visibleForTesting */
export const crsUrnValidator = z.custom<`urn:ogc:def:crs:EPSG:${string}:${GeoSystemeId}` | `urn:ogc:def:crs:OGC:${string}:CRS84`>(val => {
  if (typeof val !== 'string') {
    return false
  }
  if (val.startsWith('urn:ogc:def:crs:OGC:') && val.endsWith(':CRS84')) {
    return true
  }
  if (!val.startsWith('urn:ogc:def:crs:EPSG:')) {
    return false
  }

  return geoSystemeIdValidator.safeParse(val.substring(val.length - 4)).success
})

const featureCollectionValidator = z.object({
  type: z.literal('FeatureCollection'),
  crs: z.object({ type: z.literal('name'), properties: z.object({ name: crsUrnValidator }) }).optional(),
  properties: z.any().optional(),
})

export const featureCollectionMultipolygonValidator = featureCollectionValidator.extend({
  features: z.tuple([featureMultiPolygonValidator]).rest(featurePointValidator),
})

export const polygonValidator = z.object({ type: z.literal('Polygon'), coordinates: polygonCoordinatesValidator })
const featurePolygonValidator = featureValidator.extend({ geometry: polygonValidator })

export const featureCollectionPolygonValidator = featureCollectionValidator.extend({
  features: z.tuple([featurePolygonValidator]).rest(featurePointValidator),
})

export type FeatureCollectionPolygon = z.infer<typeof featureCollectionPolygonValidator>

// Permet d’obtenir un type générique sur FeatureCollection<T>, utile pour esquiver la « distributivity »
const makeFeatureCollectionValidator = <T extends z.ZodTypeAny>(schema: T) => featureCollectionValidator.extend({ features: z.array(schema) })
export type GenericFeatureCollection<T extends z.ZodTypeAny> = z.infer<ReturnType<typeof makeFeatureCollectionValidator<T>>>

export const featureCollectionPointsValidator = makeFeatureCollectionValidator(featurePointValidator)
export type FeatureCollectionPoints = z.infer<typeof featureCollectionPointsValidator>

export const featureForagePropertiesValidator = z.object({ nom: z.string().trim().min(1), description: z.string().nullish(), type: z.enum(['captage', 'rejet']), profondeur: z.number() })
const featureForageValidator = z.object({ type: z.literal('Feature'), geometry: pointValidator, properties: featureForagePropertiesValidator })

export const featureCollectionForagesValidator = makeFeatureCollectionValidator(featureForageValidator)
export type FeatureCollectionForages = z.infer<typeof featureCollectionForagesValidator>

export type FeatureCollection = z.infer<typeof featureCollectionMultipolygonValidator>
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
  geojson_origine_perimetre: featureMultiPolygonValidator,
  geojson_origine_points: featureCollectionPointsValidator.nullable(),
  geojson_origine_geo_systeme_id: geoSystemeIdValidator,
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

export const geojsonImportPointBodyValidator = geojsonImportBodyValidator.pick({ tempDocumentName: true })
export type GeojsonImportPointsBody = z.infer<typeof geojsonImportPointBodyValidator>
export const geojsonImportPointResponseValidator = z.object({ geojson4326: featureCollectionPointsValidator, origin: featureCollectionPointsValidator })
export type GeojsonImportPointsResponse = z.infer<typeof geojsonImportPointResponseValidator>

export const geojsonImportForagesBodyValidator = geojsonImportBodyValidator.pick({ tempDocumentName: true, fileType: true })
export type GeojsonImportForagesBody = z.infer<typeof geojsonImportForagesBodyValidator>
export const geojsonImportForagesResponseValidator = z.object({ geojson4326: featureCollectionForagesValidator, origin: featureCollectionForagesValidator })
export type GeojsonImportForagesResponse = z.infer<typeof geojsonImportForagesResponseValidator>

const internalEqualGeojson = (geo1: MultiPolygon, geo2: MultiPolygon): boolean => {
  for (let indexLevel1 = 0; indexLevel1 < geo1.coordinates.length; indexLevel1++) {
    for (let indexLevel2 = 0; indexLevel2 < geo1.coordinates[indexLevel1].length; indexLevel2++) {
      for (let indexLevel3 = 0; indexLevel3 < geo1.coordinates[indexLevel1][indexLevel2].length; indexLevel3++) {
        if (
          geo1.coordinates[indexLevel1][indexLevel2][indexLevel3][0] !== geo2.coordinates[indexLevel1]?.[indexLevel2]?.[indexLevel3]?.[0] ||
          geo1.coordinates[indexLevel1][indexLevel2][indexLevel3][1] !== geo2.coordinates[indexLevel1]?.[indexLevel2]?.[indexLevel3]?.[1]
        ) {
          return false
        }
      }
    }
  }

  return true
}

export const equalGeojson = (geo1: MultiPolygon, geo2: MultiPolygon | null | undefined): boolean => {
  if (isNullOrUndefined(geo2)) {
    return false
  }

  return internalEqualGeojson(geo1, geo2) && internalEqualGeojson(geo2, geo1)
}
