import { z } from 'zod'
import { caminoDateValidator } from './date'
import { demarcheIdValidator, demarcheSlugValidator } from './demarche'
import { entrepriseDocumentIdValidator, entrepriseIdValidator } from './entreprise'
import {
  documentComplementaireAslEtapeDocumentModificationValidator,
  documentComplementaireDaeEtapeDocumentModificationValidator,
  etapeBrouillonValidator,
  etapeDocumentModificationValidator,
  etapeIdValidator,
  etapeSlugValidator,
} from './etape'
import { km2Validator } from './number'
import { featureCollectionForagesValidator, featureCollectionPointsValidator, featureMultiPolygonValidator } from './perimetre'
import { demarcheTypeIdValidator } from './static/demarchesTypes'
import { etapeStatutIdValidator } from './static/etapesStatuts'
import { etapeTypeIdValidator } from './static/etapesTypes'
import { geoSystemeIdValidator } from './static/geoSystemes'
import { substanceLegaleIdValidator } from './static/substancesLegales'
import { titreTypeIdValidator } from './static/titresTypes'
import { titreIdValidator, titreSlugValidator } from './validators/titres'
import { makeFlattenValidator, nullToDefault } from './zod-tools'
import { simpleContenuToFlattenedContenu } from './sections'
import { GetDemarcheByIdOrSlugValidator } from './titres'
import { DeepReadonly, isNotNullNorUndefined } from './typescript-tools'

const contenuValidator = z
  .record(z.string(), z.record(z.string(), z.union([caminoDateValidator, z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable()))
  .nullable()
  .transform(nullToDefault({}))
export type EtapeContenu = z.infer<typeof contenuValidator>
const dureeValidator = z.number().nullable()

const defaultHeritageProps = {
  dateDebut: { actif: false, etape: null },
  dateFin: { actif: false, etape: null },
  duree: { actif: false, etape: null },
  perimetre: { actif: false, etape: null },
  substances: { actif: false, etape: null },
  titulaires: { actif: false, etape: null },
  amodiataires: { actif: false, etape: null },
}

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

const heritageContenuValidator = z
  .record(
    z.string(),
    z.record(z.string(), z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, contenu: contenuValidator }).nullable().optional() }))
  )
  .nullable()
  .transform(nullToDefault({}))

export type HeritageContenu = z.infer<typeof heritageContenuValidator>
export const heritageValidator = z.object({
  heritageProps: heritagePropsValidator,
  heritageContenu: heritageContenuValidator,
})

export const graphqlEtapeValidator = z.object({
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

export const flattenedContenuValidator = z.record(
  z.string(),
  z.record(z.string(), makeFlattenValidator(z.union([caminoDateValidator, z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable()))
)
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
  })

export type GraphqlEtapeCreation = z.infer<typeof graphqlEtapeCreationValidator>

export const graphqlEtapeModificationValidator = graphqlEtapeCreationValidator.extend({
  id: etapeIdValidator,
  daeDocument: documentComplementaireDaeEtapeDocumentModificationValidator.nullable(),
  aslDocument: documentComplementaireAslEtapeDocumentModificationValidator.nullable(),
})
export type GraphqlEtapeModification = z.infer<typeof graphqlEtapeModificationValidator>

export const graphqlEtapeToFlattenEtape = (graphqlEtape: GraphqlEtape): DeepReadonly<FlattenEtape> => {
  const contenu = simpleContenuToFlattenedContenu(graphqlEtape.demarche.titre.typeId, graphqlEtape.demarche.typeId, graphqlEtape.typeId, graphqlEtape.contenu, graphqlEtape.heritageContenu)
  const flattenEtape: FlattenEtape = {
    ...graphqlEtape,
    duree: {
      value: graphqlEtape.heritageProps.duree.actif ? graphqlEtape.heritageProps.duree.etape?.duree ?? null : graphqlEtape.duree,
      heritee: graphqlEtape.heritageProps.duree.actif,
      etapeHeritee: isNotNullNorUndefined(graphqlEtape.heritageProps.duree.etape)
        ? {
            etapeTypeId: graphqlEtape.heritageProps.duree.etape.typeId,
            date: graphqlEtape.heritageProps.duree.etape.date,
            value: graphqlEtape.heritageProps.duree.etape.duree,
          }
        : null,
    },
    perimetre: {
      value: graphqlEtape.heritageProps.perimetre.actif
        ? isNotNullNorUndefined(graphqlEtape.heritageProps.perimetre.etape)
          ? { ...graphqlEtape.heritageProps.perimetre.etape }
          : null
        : { ...graphqlEtape },

      heritee: graphqlEtape.heritageProps.perimetre.actif,
      etapeHeritee: isNotNullNorUndefined(graphqlEtape.heritageProps.perimetre.etape)
        ? {
            etapeTypeId: graphqlEtape.heritageProps.perimetre.etape.typeId,
            date: graphqlEtape.heritageProps.perimetre.etape.date,
            value: { ...graphqlEtape.heritageProps.perimetre.etape },
          }
        : null,
    },
    dateDebut: {
      value: graphqlEtape.heritageProps.dateDebut.actif ? graphqlEtape.heritageProps.dateDebut.etape?.dateDebut ?? null : graphqlEtape.dateDebut,
      heritee: graphqlEtape.heritageProps.dateDebut.actif,
      etapeHeritee: isNotNullNorUndefined(graphqlEtape.heritageProps.dateDebut.etape)
        ? {
            etapeTypeId: graphqlEtape.heritageProps.dateDebut.etape.typeId,
            date: graphqlEtape.heritageProps.dateDebut.etape.date,
            value: graphqlEtape.heritageProps.dateDebut.etape.dateDebut,
          }
        : null,
    },
    dateFin: {
      value: graphqlEtape.heritageProps.dateFin.actif ? graphqlEtape.heritageProps.dateFin.etape?.dateFin ?? null : graphqlEtape.dateFin,
      heritee: graphqlEtape.heritageProps.dateFin.actif,
      etapeHeritee: isNotNullNorUndefined(graphqlEtape.heritageProps.dateFin.etape)
        ? {
            etapeTypeId: graphqlEtape.heritageProps.dateFin.etape.typeId,
            date: graphqlEtape.heritageProps.dateFin.etape.date,
            value: graphqlEtape.heritageProps.dateFin.etape.dateFin,
          }
        : null,
    },
    substances: {
      value: graphqlEtape.heritageProps.substances.actif
        ? isNotNullNorUndefined(graphqlEtape.heritageProps.substances.etape)
          ? graphqlEtape.heritageProps.substances.etape.substances
          : []
        : graphqlEtape.substances,

      heritee: graphqlEtape.heritageProps.substances.actif,
      etapeHeritee: isNotNullNorUndefined(graphqlEtape.heritageProps.substances.etape)
        ? {
            etapeTypeId: graphqlEtape.heritageProps.substances.etape.typeId,
            date: graphqlEtape.heritageProps.substances.etape.date,
            value: graphqlEtape.heritageProps.substances.etape.substances,
          }
        : null,
    },
    amodiataires: {
      value: graphqlEtape.heritageProps.amodiataires.actif
        ? isNotNullNorUndefined(graphqlEtape.heritageProps.amodiataires.etape)
          ? graphqlEtape.heritageProps.amodiataires.etape.amodiataireIds
          : []
        : graphqlEtape.amodiataireIds,

      heritee: graphqlEtape.heritageProps.amodiataires.actif,
      etapeHeritee: isNotNullNorUndefined(graphqlEtape.heritageProps.amodiataires.etape)
        ? {
            etapeTypeId: graphqlEtape.heritageProps.amodiataires.etape.typeId,
            date: graphqlEtape.heritageProps.amodiataires.etape.date,
            value: graphqlEtape.heritageProps.amodiataires.etape.amodiataireIds,
          }
        : null,
    },
    titulaires: {
      value: graphqlEtape.heritageProps.titulaires.actif
        ? isNotNullNorUndefined(graphqlEtape.heritageProps.titulaires.etape)
          ? graphqlEtape.heritageProps.titulaires.etape.titulaireIds
          : []
        : graphqlEtape.titulaireIds,

      heritee: graphqlEtape.heritageProps.titulaires.actif,
      etapeHeritee: isNotNullNorUndefined(graphqlEtape.heritageProps.titulaires.etape)
        ? {
            etapeTypeId: graphqlEtape.heritageProps.titulaires.etape.typeId,
            date: graphqlEtape.heritageProps.titulaires.etape.date,
            value: graphqlEtape.heritageProps.titulaires.etape.titulaireIds,
          }
        : null,
    },
    contenu,
  }

  // On flatten ici pour enlever les champs supplémentaires qu'il y'a par exemple dans perimetre
  return flattenEtapeValidator.parse(flattenEtape)
}
