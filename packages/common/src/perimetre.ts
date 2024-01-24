import {z} from 'zod'
import { communeIdValidator } from './static/communes.js'
import { secteurMaritimeValidator } from './static/facades.js'
import { foretIdValidator } from './static/forets.js'
import { sdomZoneIdValidator } from './static/sdom.js'
import { titreStatutIdValidator } from './static/titresStatuts.js'
import { titreSlugValidator } from './validators/titres.js'
import { tempDocumentNameValidator } from './document.js'
import { etapeTypeIdValidator } from './static/etapesTypes.js'
import { titreTypeIdValidator } from './static/titresTypes.js'


const coordinatesValidator = z.tuple([z.number(), z.number()])
export const multiPolygonValidator = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(z.array(coordinatesValidator).min(3)).min(1)).min(1),
})
export type MultiPolygon = z.infer<typeof multiPolygonValidator>


export const featureMultiPolygonValidator = z.object({ type: z.literal('Feature'), geometry: multiPolygonValidator, properties: z.object({}) })
export type FeatureMultiPolygon = z.infer<typeof featureMultiPolygonValidator>

const pointValidator = z.object({type: z.literal('Point'), coordinates: coordinatesValidator})
export type GeojsonPoint = z.infer<typeof pointValidator>
const featurePointValidator = z.object({type: z.literal('Feature'), geometry: pointValidator, properties: z.object({nom: z.string().nullish(), description: z.string().nullish()})})

export type GeojsonFeaturePoint = z.infer<typeof featurePointValidator>

export const featureCollectionValidator = z.object({type: z.literal('FeatureCollection'),
properties: z.any().optional(),
features: z.tuple([featureMultiPolygonValidator]).rest(featurePointValidator)
})

export const featureCollectionPointsValidator = z.object({type: z.literal('FeatureCollection'),
features:z.array(featurePointValidator)
})

export type FeatureCollectionPoints = z.infer<typeof featureCollectionPointsValidator>

export type FeatureCollection = z.infer<typeof featureCollectionValidator>
const superpositionAlerteValidator = z.object({slug: titreSlugValidator, nom: z.string(), titre_statut_id: titreStatutIdValidator})

export const geojsonInformationsValidator = z.object({
    superposition_alertes: z.array(superpositionAlerteValidator),
    surface: z.number(),
    sdomZoneIds: z.array(sdomZoneIdValidator),
    foretIds: z.array(foretIdValidator),
    communes: z.array(z.object({id: communeIdValidator, nom: z.string()})),
    secteurMaritimeIds: z.array(secteurMaritimeValidator),
    geojson4326_perimetre: featureMultiPolygonValidator,
    geojson4326_points: featureCollectionPointsValidator.nullable()
  })
  
export type GeojsonInformations = z.infer<typeof geojsonInformationsValidator>
  
  

export type PerimetreAlertes = Pick<GeojsonInformations, 'superposition_alertes' | 'sdomZoneIds'>

export const geojsonImportBodyValidator = z.object({  tempDocumentName: tempDocumentNameValidator,
    etapeTypeId: etapeTypeIdValidator,
    titreTypeId: titreTypeIdValidator, })

export type GeojsonImportBody = z.infer<typeof geojsonImportBodyValidator>