import { z } from 'zod'
import { caminoDateValidator } from './date.js'
import { demarcheIdValidator, demarcheSlugValidator } from './demarche.js'
import { entrepriseDocumentIdValidator, entrepriseIdValidator } from './entreprise.js'
import {
  documentComplementaireAslEtapeDocumentModificationValidator,
  documentComplementaireDaeEtapeDocumentModificationValidator,
  etapeAvisModificationValidator,
  etapeBrouillonValidator,
  etapeDocumentModificationValidator,
  etapeIdValidator,
  etapeSlugValidator,
} from './etape.js'
import { km2Validator } from './number.js'
import { featureCollectionForagesValidator, featureCollectionPointsValidator, featureMultiPolygonValidator } from './perimetre.js'
import { demarcheTypeIdValidator } from './static/demarchesTypes.js'
import { etapeStatutIdValidator } from './static/etapesStatuts.js'
import { etapeTypeIdValidator } from './static/etapesTypes.js'
import { geoSystemeIdValidator } from './static/geoSystemes.js'
import { substanceLegaleIdValidator } from './static/substancesLegales.js'
import { titreTypeIdValidator } from './static/titresTypes.js'
import { titreIdValidator, titreSlugValidator } from './validators/titres.js'
import { makeFlattenValidator, nullToDefault } from './zod-tools.js'
import { numberElementValueValidator } from './sections.js'

const contenuValidator = z
  .record(z.string(), z.record(z.string(), z.union([caminoDateValidator, z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable()))
  .nullable()
  .transform(nullToDefault({}))
export type EtapeContenu = z.infer<typeof contenuValidator>
const dureeValidator = z.number().nonnegative().nullable()

export const defaultHeritageProps = {
  dateDebut: { actif: false, etape: null },
  dateFin: { actif: false, etape: null },
  duree: { actif: false, etape: null },
  perimetre: { actif: false, etape: null },
  substances: { actif: false, etape: null },
  titulaires: { actif: false, etape: null },
  amodiataires: { actif: false, etape: null },
} as const

const heritagePropsValidator = z
  .object({
    duree: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, duree: dureeValidator }).nullable() }),
    dateDebut: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, dateDebut: caminoDateValidator.nullable() }).nullable() }),
    dateFin: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, dateFin: caminoDateValidator.nullable() }).nullable() }),
    substances: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, substances: z.array(substanceLegaleIdValidator) }).nullable() }),
    titulaires: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, titulaireIds: z.array(entrepriseIdValidator) }).nullable() }),
    amodiataires: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, amodiataireIds: z.array(entrepriseIdValidator) }).nullable() }),
    perimetre: z.object({
      actif: z.boolean(),
      etape: z
        .object({
          typeId: etapeTypeIdValidator,
          date: caminoDateValidator,
          geojson4326Perimetre: featureMultiPolygonValidator.nullable(),
          geojson4326Points: featureCollectionPointsValidator.nullable(),
          geojsonOriginePoints: featureCollectionPointsValidator.nullable(),
          geojsonOriginePerimetre: featureMultiPolygonValidator.nullable(),
          geojsonOrigineGeoSystemeId: geoSystemeIdValidator.nullable(),
          geojson4326Forages: featureCollectionForagesValidator.nullable(),
          geojsonOrigineForages: featureCollectionForagesValidator.nullable(),
          surface: km2Validator.nullable(),
        })
        .nullable(),
    }),
  })
  .nullable()
  .transform(nullToDefault(defaultHeritageProps))

export const heritageContenuValidator = z
  .record(
    z.string(),
    z.record(z.string(), z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, contenu: contenuValidator }).nullable().optional() }))
  )
  .nullable()
  .transform(nullToDefault({}))

export type HeritageContenu = z.infer<typeof heritageContenuValidator>

const graphqlEtapeValidator = z.object({
  id: etapeIdValidator,
  slug: etapeSlugValidator,
  titreDemarcheId: demarcheIdValidator,
  demarche: z.object({
    slug: demarcheSlugValidator,
    typeId: demarcheTypeIdValidator,
    description: z.string().nullable(),
    titre: z.object({
      id: titreIdValidator,
      slug: titreSlugValidator,
      nom: z.string(),
      typeId: titreTypeIdValidator,
    }),
  }),
  date: caminoDateValidator,
  dateDebut: caminoDateValidator.nullable(),
  dateFin: caminoDateValidator.nullable(),
  duree: dureeValidator,
  substances: z.array(substanceLegaleIdValidator),
  typeId: etapeTypeIdValidator,
  statutId: etapeStatutIdValidator,
  titulaireIds: z.array(entrepriseIdValidator),
  amodiataireIds: z.array(entrepriseIdValidator),
  geojson4326Perimetre: featureMultiPolygonValidator.nullable(),
  geojson4326Points: featureCollectionPointsValidator.nullable(),
  geojsonOriginePoints: featureCollectionPointsValidator.nullable(),
  geojsonOriginePerimetre: featureMultiPolygonValidator.nullable(),
  geojsonOrigineGeoSystemeId: geoSystemeIdValidator.nullable(),
  geojson4326Forages: featureCollectionForagesValidator.nullable(),
  geojsonOrigineForages: featureCollectionForagesValidator.nullable(),
  surface: km2Validator.nullable(),
  // Record<string, Record<string, ElementWithValue['value']>>
  contenu: contenuValidator,
  notes: z.string().nullable(),
  heritageProps: heritagePropsValidator,
  heritageContenu: heritageContenuValidator,
  isBrouillon: etapeBrouillonValidator,
})

const perimetreObjectValidator = z.object({
  geojson4326Perimetre: featureMultiPolygonValidator.nullable(),
  geojson4326Points: featureCollectionPointsValidator.nullable(),
  geojsonOriginePoints: featureCollectionPointsValidator.nullable(),
  geojsonOriginePerimetre: featureMultiPolygonValidator.nullable(),
  geojsonOrigineGeoSystemeId: geoSystemeIdValidator.nullable(),
  geojson4326Forages: featureCollectionForagesValidator.nullable(),
  geojsonOrigineForages: featureCollectionForagesValidator.nullable(),
  surface: km2Validator.nullable(),
})

const flattenedContenuElementValidator = makeFlattenValidator(z.union([caminoDateValidator, z.string(), numberElementValueValidator, z.boolean(), z.array(z.string())]).nullable())
export type FlattenedContenuElement = z.infer<typeof flattenedContenuElementValidator>
const flattenedContenuValidator = z.record(z.string(), z.record(z.string(), flattenedContenuElementValidator))
export type FlattenedContenu = z.infer<typeof flattenedContenuValidator>

export const flattenEtapeValidator = graphqlEtapeValidator
  .omit({
    heritageProps: true,
    heritageContenu: true,
    contenu: true,
    duree: true,
    surface: true,
    geojson4326Perimetre: true,
    geojson4326Points: true,
    geojsonOriginePoints: true,
    geojsonOriginePerimetre: true,
    geojsonOrigineGeoSystemeId: true,
    geojson4326Forages: true,
    geojsonOrigineForages: true,
    dateDebut: true,
    dateFin: true,
    substances: true,
    titulaireIds: true,
    amodiataireIds: true,
    demarche: true,
  })
  .extend({
    duree: makeFlattenValidator(dureeValidator),
    perimetre: makeFlattenValidator(perimetreObjectValidator.nullable()),
    dateDebut: makeFlattenValidator(caminoDateValidator.nullable()),
    dateFin: makeFlattenValidator(caminoDateValidator.nullable()),
    substances: makeFlattenValidator(z.array(substanceLegaleIdValidator)),
    titulaires: makeFlattenValidator(z.array(entrepriseIdValidator)),
    amodiataires: makeFlattenValidator(z.array(entrepriseIdValidator)),
    contenu: flattenedContenuValidator,
  })

export type FlattenEtape = z.infer<typeof flattenEtapeValidator>

export type GraphqlEtape = z.infer<typeof graphqlEtapeValidator>

const graphqlInputHeritagePropValidator = z.object({
  actif: z.boolean(),
})

const graphqlInputHeritagePropsValidator = z.object({
  dateDebut: graphqlInputHeritagePropValidator,
  dateFin: graphqlInputHeritagePropValidator,
  duree: graphqlInputHeritagePropValidator,
  perimetre: graphqlInputHeritagePropValidator,
  substances: graphqlInputHeritagePropValidator,
  titulaires: graphqlInputHeritagePropValidator,
  amodiataires: graphqlInputHeritagePropValidator,
})

export const graphqlEtapeCreationValidator = graphqlEtapeValidator
  .pick({
    typeId: true,
    statutId: true,
    date: true,
    duree: true,
    dateDebut: true,
    dateFin: true,
    substances: true,
    geojson4326Perimetre: true,
    geojson4326Points: true,
    geojsonOriginePoints: true,
    geojsonOriginePerimetre: true,
    geojsonOrigineForages: true,
    geojsonOrigineGeoSystemeId: true,
    titulaireIds: true,
    amodiataireIds: true,
    notes: true,
    contenu: true,
  })
  .extend({
    titreDemarcheId: demarcheIdValidator,
    heritageProps: graphqlInputHeritagePropsValidator,
    heritageContenu: z.record(z.string(), z.record(z.string(), z.object({ actif: z.boolean() }))),
    etapeDocuments: z.array(etapeDocumentModificationValidator),
    entrepriseDocumentIds: z.array(entrepriseDocumentIdValidator),
    etapeAvis: z.array(etapeAvisModificationValidator),
  })

export type GraphqlEtapeCreation = z.infer<typeof graphqlEtapeCreationValidator>

export const graphqlEtapeModificationValidator = graphqlEtapeCreationValidator.extend({
  id: etapeIdValidator,
  daeDocument: documentComplementaireDaeEtapeDocumentModificationValidator.nullable(),
  aslDocument: documentComplementaireAslEtapeDocumentModificationValidator.nullable(),
})
export type GraphqlEtapeModification = z.infer<typeof graphqlEtapeModificationValidator>
