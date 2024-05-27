import { apiGraphQLFetch } from '@/api/_client'
import { deleteWithJson, getWithJson, putWithJson } from '@/api/client-rest'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date'
import { DemarcheId, demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { entrepriseDocumentIdValidator, entrepriseIdValidator } from 'camino-common/src/entreprise'
import {
  EtapeId,
  EtapeIdOrSlug,
  EtapeTypeEtapeStatutWithMainStep,
  EtapeWithHeritage,
  GetEtapeDocumentsByEtapeId,
  documentComplementaireAslEtapeDocumentModificationValidator,
  documentComplementaireDaeEtapeDocumentModificationValidator,
  etapeDocumentModificationValidator,
  etapeIdValidator,
  etapeSlugValidator,
} from 'camino-common/src/etape'
import { km2Validator } from 'camino-common/src/number'
import { featureCollectionForagesValidator, featureCollectionPointsValidator, featureMultiPolygonValidator } from 'camino-common/src/perimetre'
import { demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales'
import { titreTypeIdValidator } from 'camino-common/src/static/titresTypes'
import { DeepReadonly, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { titreIdValidator, titreSlugValidator } from 'camino-common/src/validators/titres'
import { nullToDefault } from 'camino-common/src/zod-tools'
import gql from 'graphql-tag'
import { z } from 'zod'

const contenuValidator = z
  .record(z.string(), z.record(z.string(), z.union([caminoDateValidator, z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable()))
  .nullable()
  .transform(nullToDefault({}))
const dureeValidator = z.number().nullable()

const defaultHeritageProps = {
  duree: { actif: false, etape: null },
  perimetre: { actif: false, etape: null },
  dateDebut: { actif: false, etape: null },
  dateFin: { actif: false, etape: null },
  substances: { actif: false, etape: null },
  titulaires: { actif: false, etape: null },
  amodiataires: { actif: false, etape: null },
} as const

const substancesValidator = z.array(substanceLegaleIdValidator)
const entreprisesValidator = z.array(entrepriseIdValidator)
const heritagePropsValidator = z
  .object({
    duree: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, duree: dureeValidator }).nullable() }),
    dateDebut: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, dateDebut: caminoDateValidator.nullable() }).nullable() }),
    dateFin: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, dateFin: caminoDateValidator.nullable() }).nullable() }),
    substances: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, substances: substancesValidator }).nullable() }),
    titulaires: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, titulaireIds: entreprisesValidator }).nullable() }),
    amodiataires: z.object({ actif: z.boolean(), etape: z.object({ typeId: etapeTypeIdValidator, date: caminoDateValidator, amodiataireIds: entreprisesValidator }).nullable() }),
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
const heritageValidator = z.object({
  heritageProps: heritagePropsValidator,
  heritageContenu: heritageContenuValidator,
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

export const makeFlattenValidator = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    value: schema,
    heritee: z.boolean(),
    etapeHeritee: z
      .object({
        etapeTypeId: etapeTypeIdValidator,
        date: caminoDateValidator,
        value: schema,
      })
      .nullable(),
  })

// TODO 2024-05-23 : C'est étrange ce que nous retourne zod ici, du coup on ne peut pas mettre le deepreadonly sur prop et consort
export type GenericHeritageValue<T extends z.ZodTypeAny> = z.infer<ReturnType<typeof makeFlattenValidator<T>>>
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
  isBrouillon: z.boolean(),
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
})

// type GraphqlEtape = z.infer<typeof graphqlEtapeValidator>

const flattenEtapeValidator = graphqlEtapeValidator
  .omit({
    heritageProps: true,
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
  })
  .extend({
    duree: makeFlattenValidator(dureeValidator),
    perimetre: makeFlattenValidator(perimetreObjectValidator.nullable()),
    dateDebut: makeFlattenValidator(caminoDateValidator.nullable()),
    dateFin: makeFlattenValidator(caminoDateValidator.nullable()),
    substances: makeFlattenValidator(substancesValidator),
    titulaires: makeFlattenValidator(entreprisesValidator),
    amodiataires: makeFlattenValidator(entreprisesValidator),
  })

export type FlattenEtape = z.infer<typeof flattenEtapeValidator>

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

const graphqlEtapeCreationValidator = graphqlEtapeValidator
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

type GraphqlEtapeCreation = z.infer<typeof graphqlEtapeCreationValidator>

const graphqlEtapeModificationValidator = graphqlEtapeCreationValidator.extend({
  id: etapeIdValidator,
  daeDocument: documentComplementaireDaeEtapeDocumentModificationValidator.nullable(),
  aslDocument: documentComplementaireAslEtapeDocumentModificationValidator.nullable(),
})
type GraphqlEtapeModification = z.infer<typeof graphqlEtapeModificationValidator>
export interface EtapeApiClient {
  getEtapesTypesEtapesStatuts: (titreDemarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) => Promise<EtapeTypeEtapeStatutWithMainStep[]>
  deleteEtape: (titreEtapeId: EtapeId) => Promise<void>
  deposeEtape: (titreEtapeId: EtapeId) => Promise<void>
  getEtapeDocumentsByEtapeId: (etapeId: EtapeId) => Promise<GetEtapeDocumentsByEtapeId>
  getEtapeHeritagePotentiel: (
    titreDemarcheId: DemarcheId,
    date: CaminoDate,
    typeId: EtapeTypeId,
    etapeId: EtapeId | null
  ) => Promise<DeepReadonly<Pick<EtapeWithHeritage, 'heritageProps' | 'heritageContenu'>>>
  getEtape: (etapeIdOrSlug: EtapeIdOrSlug) => Promise<DeepReadonly<{etape: FlattenEtape, demarche: FIXME}>>
  etapeCreer: (etape: DeepReadonly<GraphqlEtapeCreation>) => Promise<EtapeId>
  etapeModifier: (etape: DeepReadonly<GraphqlEtapeModification>) => Promise<EtapeId>
}

export const etapeApiClient: EtapeApiClient = {
  getEtapesTypesEtapesStatuts: async (demarcheId, etapeId, date) => getWithJson('/rest/etapesTypes/:demarcheId/:date', { demarcheId, date }, etapeId ? { etapeId } : {}),

  deleteEtape: async etapeId => {
    await deleteWithJson('/rest/etapes/:etapeId', { etapeId })
  },
  deposeEtape: async etapeId => {
    await putWithJson('/rest/etapes/:etapeId/depot', { etapeId }, undefined)
  },

  getEtapeDocumentsByEtapeId: async etapeId => getWithJson('/rest/etapes/:etapeId/etapeDocuments', { etapeId }),

  getEtape: async etapeIdOrSlug => {
    const data = await apiGraphQLFetch(gql`
      query Etape($id: ID!) {
        etape(id: $id) {
          id
          slug
          titreDemarcheId
          demarche {
            description
            slug
            typeId
            titre {
              id
              slug
              nom
              typeId
            }
          }
          date
          dateDebut
          dateFin
          duree
          surface
          typeId
          statutId
          isBrouillon
          titulaireIds
          amodiataireIds
          geojson4326Perimetre
          geojson4326Points
          geojsonOriginePoints
          geojsonOriginePerimetre
          geojsonOrigineGeoSystemeId
          geojson4326Forages
          geojsonOrigineForages
          substances
          contenu
          notes

          heritageProps {
            dateDebut {
              etape {
                date
                typeId
                dateDebut
              }
              actif
            }
            dateFin {
              etape {
                date
                typeId
                dateFin
              }
              actif
            }
            duree {
              etape {
                date
                typeId
                duree
              }
              actif
            }
            perimetre {
              etape {
                date
                typeId
                geojson4326Perimetre
                geojson4326Points
                geojsonOriginePoints
                geojsonOriginePerimetre
                geojsonOrigineGeoSystemeId
                geojson4326Forages
                geojsonOrigineForages
                surface
              }
              actif
            }
            substances {
              etape {
                date
                typeId
                substances
              }
              actif
            }
            titulaires {
              etape {
                date
                typeId
                titulaireIds
              }
              actif
            }
            amodiataires {
              etape {
                date
                typeId
                amodiataireIds
              }
              actif
            }
          }

          heritageContenu
        }
      }
    `)({ id: etapeIdOrSlug })
    const result = graphqlEtapeValidator.safeParse(data)
    if (result.success) {
      const graphqlEtape = result.data

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
      }
      return flattenEtapeValidator.parse(flattenEtape)
    }
    console.warn(result.error.message)
    throw result.error
  },
  getEtapeHeritagePotentiel: async (titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId, etapeId: EtapeId | null) => {
    const data = await apiGraphQLFetch(gql`
      query EtapeHeritage($titreDemarcheId: ID!, $date: String!, $typeId: ID!, $etapeId: ID) {
        etapeHeritage(titreDemarcheId: $titreDemarcheId, date: $date, typeId: $typeId, etapeId: $etapeId) {
          heritageProps {
            dateDebut {
              etape {
                date
                typeId
                dateDebut
              }
              actif
            }
            dateFin {
              etape {
                date
                typeId
                dateFin
              }
              actif
            }
            duree {
              etape {
                date
                typeId
                duree
              }
              actif
            }
            perimetre {
              etape {
                date
                typeId
                geojson4326Perimetre
                geojson4326Points
                geojsonOriginePoints
                geojsonOriginePerimetre
                geojsonOrigineGeoSystemeId
                geojson4326Forages
                geojsonOrigineForages
                surface
              }
              actif
            }
            substances {
              etape {
                date
                typeId
                substances
              }
              actif
            }
            titulaires {
              etape {
                date
                typeId
                titulaireIds
              }
              actif
            }
            amodiataires {
              etape {
                date
                typeId
                amodiataireIds
              }
              actif
            }
          }

          heritageContenu
        }
      }
    `)({
      titreDemarcheId,
      date,
      typeId,
      etapeId,
    })

    return heritageValidator.parse(data)
  },

  etapeCreer: async etape => {
    const result = await apiGraphQLFetch(gql`
      mutation EtapeCreer($etape: InputEtapeCreation!) {
        etapeCreer(etape: $etape) {
          id
        }
      }
    `)({ etape: graphqlEtapeCreationValidator.parse(etape) })

    return result.id
  },

  etapeModifier: async etape => {
    const result = await apiGraphQLFetch(gql`
      mutation EtapeModifier($etape: InputEtapeModification!) {
        etapeModifier(etape: $etape) {
          id
        }
      }
    `)({ etape: graphqlEtapeModificationValidator.parse(etape) })

    return result.id
  },
}
