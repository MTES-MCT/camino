import { apiGraphQLFetch } from '@/api/_client'
import { deleteWithJson, getWithJson, putWithJson } from '@/api/client-rest'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date'
import { DemarcheId, demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { entrepriseDocumentIdValidator, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { EtapeId, EtapeIdOrSlug, EtapeTypeEtapeStatutWithMainStep, EtapeWithHeritage, GetEtapeDocumentsByEtapeId, documentComplementaireAslEtapeDocumentModificationValidator, documentComplementaireDaeEtapeDocumentModificationValidator, etapeDocumentIdValidator, etapeDocumentModificationValidator, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { km2Validator } from 'camino-common/src/number'
import {
  featureCollectionForagesValidator,
  featureCollectionPointsValidator,
  featureMultiPolygonValidator,
} from 'camino-common/src/perimetre'
import { demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes'
import { documentTypeIdValidator } from 'camino-common/src/static/documentsTypes'
import { etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId, etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales'
import { titreTypeIdValidator } from 'camino-common/src/static/titresTypes'
import { DeepReadonly } from 'camino-common/src/typescript-tools'
import { titreIdValidator, titreSlugValidator } from 'camino-common/src/validators/titres'
import { nullToDefault } from 'camino-common/src/zod-tools'
import gql from 'graphql-tag'
import { z } from 'zod'

const contenuValidator = z.record(z.string(), z.record(z.string(), z.union([caminoDateValidator, z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable())).nullable().transform(nullToDefault({}))
const dureeValidator = z.number().nullable()
const entrepriseValidator = z.array(
  z.object({
    id: entrepriseIdValidator,
    operateur: z.boolean().nullable(),
  })
)

const defaultHeritageProps = {
  dateDebut: {actif: false},
dateFin: {actif: false},
duree: {actif: false},
perimetre: {actif: false},
substances: {actif: false},
titulaires: {actif: false},
amodiataires: {actif: false}
}

const heritagePropsValidator = z.object({
  duree: z.object({ actif: z.boolean(), etape: z.object({typeId: etapeTypeIdValidator, date: caminoDateValidator, duree: dureeValidator}).nullable()}),
  dateDebut: z.object({ actif: z.boolean(), etape: z.object({typeId: etapeTypeIdValidator, date: caminoDateValidator, dateDebut: caminoDateValidator.nullable()}).nullable()}),
  dateFin: z.object({ actif: z.boolean(), etape: z.object({typeId: etapeTypeIdValidator, date: caminoDateValidator, dateFin: caminoDateValidator.nullable()}).nullable()}),
  substances: z.object({ actif: z.boolean(), etape: z.object({typeId: etapeTypeIdValidator, date: caminoDateValidator, substances: z.array(substanceLegaleIdValidator)}).nullable()}),
  titulaires: z.object({ actif: z.boolean(), etape: z.object({typeId: etapeTypeIdValidator, date: caminoDateValidator, titulaires: entrepriseValidator}).nullable()}),
  amodiataires: z.object({ actif: z.boolean(), etape: z.object({typeId: etapeTypeIdValidator, date: caminoDateValidator, amodiataires: entrepriseValidator}).nullable()}),
  perimetre: z.object({ actif: z.boolean(), etape: z.object({
    typeId: etapeTypeIdValidator, date: caminoDateValidator,
    geojson4326Perimetre: featureMultiPolygonValidator.nullable(),
    geojson4326Points: featureCollectionPointsValidator.nullable(),
    geojsonOriginePoints: featureCollectionPointsValidator.nullable(),
    geojsonOriginePerimetre: featureMultiPolygonValidator.nullable(),
    geojsonOrigineGeoSystemeId: geoSystemeIdValidator.nullable(),
    geojson4326Forages: featureCollectionForagesValidator.nullable(),
    geojsonOrigineForages: featureCollectionForagesValidator.nullable(),
    surface: km2Validator.nullable(),
  }).nullable()})
}).nullable().transform(nullToDefault(defaultHeritageProps))


const heritageContenuValidator = z.record(z.string(), z.record(z.string(), z.object({actif: z.boolean(), etape: z.object({typeId: etapeTypeIdValidator, date: caminoDateValidator, contenu: contenuValidator}).nullable().optional()}))).nullable().transform(nullToDefault({}))
const heritageValidator = z.object({
  heritageProps: heritagePropsValidator,
  heritageContenu: heritageContenuValidator
})
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
  titulaires: entrepriseValidator,
  amodiataires: entrepriseValidator,
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
  heritageContenu: heritageContenuValidator
})

export type GraphqlEtape = z.infer<typeof graphqlEtapeValidator>

const graphqlInputHeritagePropValidator = z.object({
  actif: z.boolean()
})

const graphqlInputHeritagePropsValidator = z.object({
  dateDebut: graphqlInputHeritagePropValidator,
  dateFin: graphqlInputHeritagePropValidator,
  duree: graphqlInputHeritagePropValidator,
  perimetre: graphqlInputHeritagePropValidator,
  substances: graphqlInputHeritagePropValidator,
  titulaires: graphqlInputHeritagePropValidator,
  amodiataires: graphqlInputHeritagePropValidator
})

const graphqlEtapeCreationValidator = graphqlEtapeValidator.pick({
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
  titulaires: true,
  amodiataires: true,
  notes: true,
  contenu: true
}).extend({
  titreDemarcheId: demarcheIdValidator,
  heritageProps: graphqlInputHeritagePropsValidator,
  heritageContenu: z.record(z.string(), z.record(z.string(), z.object({actif: z.boolean()}))),
  etapeDocuments: z.array(etapeDocumentModificationValidator),
  entrepriseDocumentIds: z.array(entrepriseDocumentIdValidator)
}
)

export type GraphqlEtapeCreation = z.infer<typeof graphqlEtapeCreationValidator>

const graphqlEtapeModificationValidator = graphqlEtapeCreationValidator.extend({
  id: etapeIdValidator,
  daeDocument: documentComplementaireDaeEtapeDocumentModificationValidator.nullable(),
  aslDocument: documentComplementaireAslEtapeDocumentModificationValidator.nullable(),
})
export type GraphqlEtapeModification = z.infer<typeof graphqlEtapeModificationValidator>
export interface EtapeApiClient {
  getEtapesTypesEtapesStatuts: (titreDemarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) => Promise<EtapeTypeEtapeStatutWithMainStep[]>
  deleteEtape: (titreEtapeId: EtapeId) => Promise<void>
  deposeEtape: (titreEtapeId: EtapeId) => Promise<void>
  getEtapeDocumentsByEtapeId: (etapeId: EtapeId) => Promise<GetEtapeDocumentsByEtapeId>
  getEtapeHeritagePotentiel: (titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId, etapeId: EtapeId | null) => Promise<DeepReadonly<Pick<EtapeWithHeritage, 'heritageProps' | 'heritageContenu'>>>
  getEtape: (etapeIdOrSlug: EtapeIdOrSlug) => Promise<DeepReadonly<GraphqlEtape>>
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
    `)({ id: etapeIdOrSlug })
    const result = graphqlEtapeValidator.safeParse(data)
    if( result.success){
      return result.data
    }
    console.log(result.error.message)
    return graphqlEtapeValidator.parse(data)
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
      etapeId
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
