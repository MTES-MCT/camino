import { z } from 'zod'
import { demarcheTypeIdValidator } from './static/demarchesTypes.js'
import { titreSlugValidator } from './titres.js'
import { titreTypeIdValidator } from './static/titresTypes.js'
import { caminoDateValidator } from './date.js'
import { demarcheStatutIdValidator } from './static/demarchesStatuts.js'
import { communeIdValidator } from './static/communes.js'
import { secteurMaritimeValidator } from './static/facades.js'
import { substanceLegaleIdValidator } from './static/substancesLegales.js'
import { entrepriseIdValidator, etapeEntrepriseDocumentValidator } from './entreprise.js'
import { etapeTypeIdFondamentaleValidator, etapeTypeIdNonFondamentaleValidator } from './static/etapesTypes.js'
import { etapeStatutIdValidator } from './static/etapesStatuts.js'
import { sectionWithValueValidator } from './sections.js'
import { etapeDocumentValidator } from './etape.js'

export const demarcheIdValidator = z.string().brand<'DemarcheId'>()
export type DemarcheId = z.infer<typeof demarcheIdValidator>

export const demarcheSlugValidator = z.string().brand<'DemarcheSlug'>()
export type DemarcheSlug = z.infer<typeof demarcheSlugValidator>

export const demarcheIdOrSlugValidator = z.union([demarcheIdValidator, demarcheSlugValidator])
export type DemarcheIdOrSlug = z.infer<typeof demarcheIdOrSlugValidator>

const demarchePhaseValidator = z.object({
  slug: demarcheSlugValidator,
  demarche_type_id: demarcheTypeIdValidator,
  demarche_date_debut: caminoDateValidator.nullable(),
  demarche_date_fin: caminoDateValidator.nullable(),
})

export const entreprisesByEtapeIdValidator = z.object({
  id: entrepriseIdValidator,
  nom: z.string(),
  operateur: z.coerce.boolean(),
})

export type EntreprisesByEtapeId = z.infer<typeof entreprisesByEtapeIdValidator>

const multipolygonPositionValidator = z.tuple([z.number(), z.number()])
const multiPolygonValidator = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(z.array(multipolygonPositionValidator))),
})

export const featureMultiPolygonValidator = z.object({ type: z.literal('Feature'), geometry: multiPolygonValidator, properties: z.null() })
export type FeatureMultiPolygon = z.infer<typeof featureMultiPolygonValidator>

const demarcheEtapeFondamentaleValidator = z.object({
  etape_type_id: etapeTypeIdFondamentaleValidator,
  fondamentale: z.object({
    date_debut: caminoDateValidator.nullable(),
    date_fin: caminoDateValidator.nullable(),
    duree: z.number().nullable(),
    substances: z.array(substanceLegaleIdValidator).nullable(),
    titulaires: z.array(entreprisesByEtapeIdValidator).nullable(),
    amodiataires: z.array(entreprisesByEtapeIdValidator).nullable(),
    geojsonMultiPolygon: featureMultiPolygonValidator.nullable(),
    surface: z.number().nullable(),
  }),
})

export type DemarcheEtapeFondamentale = z.infer<typeof demarcheEtapeFondamentaleValidator>

const demarcheEtapeNonFondamentaleValidator = z.object({
  etape_type_id: etapeTypeIdNonFondamentaleValidator,
})
export type DemarcheEtapeNonFondamentale = z.infer<typeof demarcheEtapeNonFondamentaleValidator>

const demarcheEtapeCommonValidator = z.object({
  etape_statut_id: etapeStatutIdValidator,
  date: caminoDateValidator,
  sections_with_values: z.array(sectionWithValueValidator),
  entreprises_documents: z.array(etapeEntrepriseDocumentValidator),
  documents: z.array(etapeDocumentValidator),
})

export type DemarcheEtapeCommon = z.infer<typeof demarcheEtapeCommonValidator>

const demarcheEtapeValidator = z.intersection(z.union([demarcheEtapeFondamentaleValidator, demarcheEtapeNonFondamentaleValidator]), demarcheEtapeCommonValidator)

export type DemarcheEtape = z.infer<typeof demarcheEtapeValidator>

export const demarcheGetValidator = z.object({
  id: demarcheIdValidator,
  slug: demarcheSlugValidator,
  titre: z.object({ slug: titreSlugValidator, nom: z.string(), titre_type_id: titreTypeIdValidator, phases: z.array(demarchePhaseValidator) }),
  etapes: z.array(demarcheEtapeValidator),
  demarche_type_id: demarcheTypeIdValidator,
  demarche_statut_id: demarcheStatutIdValidator,
  contenu: z.record(z.string(), z.string()),
  communes: z.array(z.object({ id: communeIdValidator, nom: z.string() })),
  secteurs_maritimes: z.array(secteurMaritimeValidator),
  substances: z.array(substanceLegaleIdValidator),
  titulaires: z.array(entreprisesByEtapeIdValidator),
  amodiataires: z.array(entreprisesByEtapeIdValidator),
  geojsonMultiPolygon: featureMultiPolygonValidator.nullable(),
})
export type DemarcheGet = z.infer<typeof demarcheGetValidator>
