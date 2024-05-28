import { apiGraphQLFetch } from '@/api/_client'
import { deleteWithJson, getWithJson, putWithJson } from '@/api/client-rest'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { EtapeId, EtapeIdOrSlug, EtapeTypeEtapeStatutWithMainStep, GetEtapeDocumentsByEtapeId } from 'camino-common/src/etape'
import {
  FlattenEtape,
  GraphqlEtapeCreation,
  GraphqlEtapeModification,
  flattenEtapeValidator,
  graphqlEtapeCreationValidator,
  graphqlEtapeModificationValidator,
  graphqlEtapeValidator,
} from 'camino-common/src/etape-form'
import { km2Validator } from 'camino-common/src/number'
import { featureCollectionForagesValidator, featureCollectionPointsValidator, featureMultiPolygonValidator } from 'camino-common/src/perimetre'
import { etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes'
import { substanceLegaleIdValidator } from 'camino-common/src/static/substancesLegales'
import { GetDemarcheByIdOrSlugValidator } from 'camino-common/src/titres'
import { DeepReadonly, Nullable, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
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

export type CoreEtapeCreationOrModification = Pick<Nullable<FlattenEtape>, 'id' | 'slug'> & DistributiveOmit<FlattenEtape, 'id' | 'slug'>
export interface EtapeApiClient {
  getEtapesTypesEtapesStatuts: (titreDemarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) => Promise<EtapeTypeEtapeStatutWithMainStep[]>
  deleteEtape: (titreEtapeId: EtapeId) => Promise<void>
  deposeEtape: (titreEtapeId: EtapeId) => Promise<void>
  getEtapeDocumentsByEtapeId: (etapeId: EtapeId) => Promise<GetEtapeDocumentsByEtapeId>
  getEtapeHeritagePotentiel: (etape: DeepReadonly<CoreEtapeCreationOrModification>, titreDemarcheId: DemarcheId) => Promise<DeepReadonly<CoreEtapeCreationOrModification>>
  getEtape: (etapeIdOrSlug: EtapeIdOrSlug) => Promise<DeepReadonly<{ etape: FlattenEtape; demarche: GetDemarcheByIdOrSlugValidator }>>
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

      const demarche: GetDemarcheByIdOrSlugValidator = {
        demarche_description: graphqlEtape.demarche.description,
        demarche_id: graphqlEtape.titreDemarcheId,
        demarche_slug: graphqlEtape.demarche.slug,
        demarche_type_id: graphqlEtape.demarche.typeId,
        titre_id: graphqlEtape.demarche.titre.id,
        titre_nom: graphqlEtape.demarche.titre.nom,
        titre_slug: graphqlEtape.demarche.titre.slug,
        titre_type_id: graphqlEtape.demarche.titre.typeId,
      }

      // On flatten ici pour enlever les champs supplémentaires qu'il y'a par exemple dans perimetre
      return { etape: flattenEtapeValidator.parse(flattenEtape), demarche }
    }
    console.warn(result.error.message)
    throw result.error
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

    const heritageData: DeepReadonly<z.infer<typeof heritageValidator>> = heritageValidator.parse(data)
    const flattenEtape: DeepReadonly<CoreEtapeCreationOrModification> = {
      ...etape,
      heritageContenu: heritageData.heritageContenu,
      duree: {
        value: heritageData.heritageProps.duree.actif ? heritageData.heritageProps.duree.etape?.duree ?? null : etape.duree.value,
        heritee: heritageData.heritageProps.duree.actif,
        etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.duree.etape)
          ? {
              etapeTypeId: heritageData.heritageProps.duree.etape.typeId,
              date: heritageData.heritageProps.duree.etape.date,
              value: heritageData.heritageProps.duree.etape.duree,
            }
          : null,
      },
      perimetre: {
        value: heritageData.heritageProps.perimetre.actif
          ? isNotNullNorUndefined(heritageData.heritageProps.perimetre.etape)
            ? { ...heritageData.heritageProps.perimetre.etape }
            : null
          : etape.perimetre.value,

        heritee: heritageData.heritageProps.perimetre.actif,
        etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.perimetre.etape)
          ? {
              etapeTypeId: heritageData.heritageProps.perimetre.etape.typeId,
              date: heritageData.heritageProps.perimetre.etape.date,
              value: { ...heritageData.heritageProps.perimetre.etape },
            }
          : null,
      },
      dateDebut: {
        value: heritageData.heritageProps.dateDebut.actif ? heritageData.heritageProps.dateDebut.etape?.dateDebut ?? null : etape.dateDebut.value,
        heritee: heritageData.heritageProps.dateDebut.actif,
        etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.dateDebut.etape)
          ? {
              etapeTypeId: heritageData.heritageProps.dateDebut.etape.typeId,
              date: heritageData.heritageProps.dateDebut.etape.date,
              value: heritageData.heritageProps.dateDebut.etape.dateDebut,
            }
          : null,
      },
      dateFin: {
        value: heritageData.heritageProps.dateFin.actif ? heritageData.heritageProps.dateFin.etape?.dateFin ?? null : etape.dateFin.value,
        heritee: heritageData.heritageProps.dateFin.actif,
        etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.dateFin.etape)
          ? {
              etapeTypeId: heritageData.heritageProps.dateFin.etape.typeId,
              date: heritageData.heritageProps.dateFin.etape.date,
              value: heritageData.heritageProps.dateFin.etape.dateFin,
            }
          : null,
      },
      substances: {
        value: heritageData.heritageProps.substances.actif
          ? isNotNullNorUndefined(heritageData.heritageProps.substances.etape)
            ? heritageData.heritageProps.substances.etape.substances
            : []
          : etape.substances.value,

        heritee: heritageData.heritageProps.substances.actif,
        etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.substances.etape)
          ? {
              etapeTypeId: heritageData.heritageProps.substances.etape.typeId,
              date: heritageData.heritageProps.substances.etape.date,
              value: heritageData.heritageProps.substances.etape.substances,
            }
          : null,
      },
      amodiataires: {
        value: heritageData.heritageProps.amodiataires.actif
          ? isNotNullNorUndefined(heritageData.heritageProps.amodiataires.etape)
            ? heritageData.heritageProps.amodiataires.etape.amodiataireIds
            : []
          : etape.amodiataires.value,

        heritee: heritageData.heritageProps.amodiataires.actif,
        etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.amodiataires.etape)
          ? {
              etapeTypeId: heritageData.heritageProps.amodiataires.etape.typeId,
              date: heritageData.heritageProps.amodiataires.etape.date,
              value: heritageData.heritageProps.amodiataires.etape.amodiataireIds,
            }
          : null,
      },
      titulaires: {
        value: heritageData.heritageProps.titulaires.actif
          ? isNotNullNorUndefined(heritageData.heritageProps.titulaires.etape)
            ? heritageData.heritageProps.titulaires.etape.titulaireIds
            : []
          : etape.titulaires.value,

        heritee: heritageData.heritageProps.titulaires.actif,
        etapeHeritee: isNotNullNorUndefined(heritageData.heritageProps.titulaires.etape)
          ? {
              etapeTypeId: heritageData.heritageProps.titulaires.etape.typeId,
              date: heritageData.heritageProps.titulaires.etape.date,
              value: heritageData.heritageProps.titulaires.etape.titulaireIds,
            }
          : null,
      },
    }
    return flattenEtape
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
