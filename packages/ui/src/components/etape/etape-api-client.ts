import { apiGraphQLFetch } from '@/api/_client'
import { deleteWithJson, getWithJson, putWithJson } from '@/api/client-rest'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date'
import { DemarcheId, demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { Etape, EtapeDocument, EtapeId, EtapeIdOrSlug, EtapeTypeEtapeStatutWithMainStep, FullEtapeHeritage, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { km2Validator } from 'camino-common/src/number'
import { featureCollectionForagesValidator, featureCollectionMultipolygonValidator, featureCollectionPointsValidator, featureMultiPolygonValidator } from 'camino-common/src/perimetre'
import { elementWithValueValidator } from 'camino-common/src/sections'
import { demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales'
import { titreTypeIdValidator } from 'camino-common/src/static/titresTypes'
import { titreIdValidator, titreSlugValidator } from 'camino-common/src/validators/titres'
import gql from 'graphql-tag'
import { DeepReadonly } from 'vue'
import { z } from 'zod'

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
  duree: z.number().nullable(),
  substances: z.array(substanceLegaleIdValidator),
  typeId: etapeTypeIdValidator,
  statutId: etapeStatutIdValidator,
  titulaires: z.array(
    z.object({
      id: entrepriseIdValidator,
      operateur: z.boolean(),
    })
  ),
  amodiataires: z.array(
    z.object({
      id: entrepriseIdValidator,
      operateur: z.boolean(),
    })
  ),
  geojson4326Perimetre: featureMultiPolygonValidator.nullable(),
  geojson4326Points: featureCollectionPointsValidator.nullable(),
  geojsonOriginePoints: featureCollectionPointsValidator.nullable(),
  geojsonOriginePerimetre: featureMultiPolygonValidator.nullable(),
  geojsonOrigineGeoSystemeId: geoSystemeIdValidator.nullable(),
  geojson4326Forages: featureCollectionForagesValidator.nullable(),
  geojsonOrigineForages: featureCollectionForagesValidator.nullable(),
  surface: km2Validator.nullable(),
  // Record<string, Record<string, ElementWithValue['value']>>
  contenu: z.record(z.string(), z.record(z.string(), z.union([caminoDateValidator, z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable())),
  notes: z.string().nullable(),
})

export type GraphqlEtape = z.infer<typeof graphqlEtapeValidator>
export interface EtapeApiClient {
  getEtapesTypesEtapesStatuts: (titreDemarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) => Promise<EtapeTypeEtapeStatutWithMainStep[]>
  deleteEtape: (titreEtapeId: EtapeId) => Promise<void>
  deposeEtape: (titreEtapeId: EtapeId) => Promise<void>
  getEtapeDocumentsByEtapeId: (etapeId: EtapeId) => Promise<EtapeDocument[]>
  getEtapeHeritage: (titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId) => Promise<DeepReadonly<Pick<FullEtapeHeritage, 'heritageProps' | 'heritageContenu'>>>
  getEtape: (etapeIdOrSlug: EtapeIdOrSlug) => Promise<DeepReadonly<GraphqlEtape>>
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
          titulaires {
            id
            operateur
          }
          amodiataires {
            id
            operateur
          }
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
        }
      }
    `)({ id: etapeIdOrSlug })
    return graphqlEtapeValidator.parse(data)
  },
  getEtapeHeritage: async (titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId) => {
    const data = await apiGraphQLFetch(gql`
      query EtapeHeritage($titreDemarcheId: ID!, $date: String!, $typeId: ID!) {
        etapeHeritage(titreDemarcheId: $titreDemarcheId, date: $date, typeId: $typeId) {
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
                titulaires {
                  id
                  operateur
                }
              }
              actif
            }
            amodiataires {
              etape {
                date
                typeId
                amodiataires {
                  id
                  operateur
                }
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
    })
    return data
  },
}
