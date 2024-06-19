import { apiGraphQLFetch } from '@/api/_client'
import { deleteWithJson, getWithJson, postWithJson, putWithJson } from '@/api/client-rest'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { EtapeId, EtapeIdOrSlug, EtapeTypeEtapeStatutWithMainStep, GetEtapeAvisByEtapeId, GetEtapeDocumentsByEtapeId } from 'camino-common/src/etape'
import { FlattenEtape, RestEtapeCreation, RestEtapeModification, restEtapeCreationValidator, restEtapeModificationValidator } from 'camino-common/src/etape-form'
import { km2Validator } from 'camino-common/src/number'
import { featureCollectionForagesValidator, featureCollectionPointsValidator, featureMultiPolygonValidator } from 'camino-common/src/perimetre'
import { etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales'
import { GetDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { DeepReadonly, Nullable } from 'camino-common/src/typescript-tools'
import { nullToDefault } from 'camino-common/src/zod-tools'
import gql from 'graphql-tag'
import { DistributiveOmit } from 'maplibre-gl'
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
export type GetEtapeHeritagePotentiel = z.infer<typeof heritageValidator>

export type CoreEtapeCreationOrModification = Pick<Nullable<FlattenEtape>, 'id' | 'slug'> & DistributiveOmit<FlattenEtape, 'id' | 'slug'>
export interface EtapeApiClient {
  getEtapesTypesEtapesStatuts: (titreDemarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) => Promise<EtapeTypeEtapeStatutWithMainStep[]>
  deleteEtape: (titreEtapeId: EtapeId) => Promise<void>
  deposeEtape: (titreEtapeId: EtapeId) => Promise<void>
  getEtapeDocumentsByEtapeId: (etapeId: EtapeId) => Promise<GetEtapeDocumentsByEtapeId>
  getEtapeHeritagePotentiel: (etape: DeepReadonly<Pick<CoreEtapeCreationOrModification, 'id' | 'date' | 'typeId'>>, titreDemarcheId: DemarcheId) => Promise<DeepReadonly<GetEtapeHeritagePotentiel>>
  getEtapeAvisByEtapeId: (etapeId: EtapeId) => Promise<GetEtapeAvisByEtapeId>
  getEtape: (etapeIdOrSlug: EtapeIdOrSlug) => Promise<DeepReadonly<{ etape: FlattenEtape; demarche: GetDemarcheByIdOrSlugValidator }>>
  etapeCreer: (etape: DeepReadonly<RestEtapeCreation>) => Promise<EtapeId>
  etapeModifier: (etape: DeepReadonly<RestEtapeModification>) => Promise<EtapeId>
}

export const etapeApiClient: EtapeApiClient = {
  getEtapesTypesEtapesStatuts: async (demarcheId, etapeId, date) => getWithJson('/rest/etapesTypes/:demarcheId/:date', { demarcheId, date }, etapeId ? { etapeId } : {}),

  deleteEtape: async etapeIdOrSlug => {
    await deleteWithJson('/rest/etapes/:etapeIdOrSlug', { etapeIdOrSlug })
  },
  deposeEtape: async etapeId => {
    await putWithJson('/rest/etapes/:etapeId/depot', { etapeId }, undefined)
  },

  getEtapeDocumentsByEtapeId: async etapeId => getWithJson('/rest/etapes/:etapeId/etapeDocuments', { etapeId }),
  getEtapeAvisByEtapeId: async etapeId => getWithJson('/rest/etapes/:etapeId/etapeAvis', { etapeId }),

  getEtape: async etapeIdOrSlug => {
    const etape = await getWithJson('/rest/etapes/:etapeIdOrSlug', { etapeIdOrSlug })
    const demarche = await getWithJson('/rest/demarches/:demarcheIdOrSlug', { demarcheIdOrSlug: etape.titreDemarcheId })
    return { etape, demarche }
  },
  getEtapeHeritagePotentiel: async (etape, titreDemarcheId) => {
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
      date: etape.date,
      typeId: etape.typeId,
      etapeId: etape.id,
    })

    // TODO 2024-06-02 on a du code métier dans notre api, on fusionne étape avec l'héritage
    const heritageData: DeepReadonly<z.infer<typeof heritageValidator>> = heritageValidator.parse(data)
    return heritageData
  },

  etapeCreer: async etape => {
    return postWithJson('/rest/etapes', {}, restEtapeCreationValidator.parse(etape))
  },

  etapeModifier: async etape => {
    await putWithJson('/rest/etapes', {}, restEtapeModificationValidator.parse(etape))

    return etape.id
  },
}
