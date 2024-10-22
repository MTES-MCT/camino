import { z } from 'zod'
import { CaminoRequest, CustomResponse } from './express-type'
import {
  EtapeTypeEtapeStatutWithMainStep,
  etapeIdValidator,
  EtapeId,
  GetEtapeDocumentsByEtapeId,
  ETAPE_IS_NOT_BROUILLON,
  etapeIdOrSlugValidator,
  GetEtapeAvisByEtapeId,
  getEtapeAvisByEtapeIdValidator,
  tempEtapeAvisValidator,
  tempEtapeDocumentValidator,
  EtapeBrouillon,
  etapeSlugValidator,
  etapeDocumentModificationValidator,
  EtapeSlug,
  ETAPE_IS_BROUILLON,
  getStatutId,
} from 'camino-common/src/etape'
import { DemarcheId } from 'camino-common/src/demarche'
import { HTTP_STATUS } from 'camino-common/src/http'
import { CaminoDate, getCurrent } from 'camino-common/src/date'
import { titreDemarcheGet } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'
import { titreEtapeGet, titreEtapeUpdate, titreEtapeUpsert } from '../../database/queries/titres-etapes'
import { User, isBureauDEtudes, isEntreprise } from 'camino-common/src/roles'
import { canCreateEtape, canDeposeEtape, canDeleteEtape, canEditEtape } from 'camino-common/src/permissions/titres-etapes'
import { canBeBrouillon, ETAPES_TYPES, isEtapeTypeId } from 'camino-common/src/static/etapesTypes'

import {
  DeepReadonly,
  NotNullableKeys,
  getKeys,
  isNonEmptyArray,
  isNotNullNorUndefined,
  isNotNullNorUndefinedNorEmpty,
  isNullOrUndefined,
  memoize,
  onlyUnique,
} from 'camino-common/src/typescript-tools'
import { Pool } from 'pg'
import { EntrepriseDocument, EntrepriseDocumentId, EntrepriseId, EtapeEntrepriseDocument } from 'camino-common/src/entreprise'
import {
  deleteTitreEtapeEntrepriseDocument,
  getDocumentsByEtapeId,
  getEntrepriseDocumentIdsByEtapeId,
  getEtapeAvisLargeObjectIdsByEtapeId,
  insertEtapeAvis,
  insertEtapeDocuments,
  insertTitreEtapeEntrepriseDocument,
  updateEtapeAvis,
  updateEtapeDocuments,
} from '../../database/queries/titres-etapes.queries'
import { getEtapeDataForEdition } from './etapes.queries'
import { SDOMZoneId } from 'camino-common/src/static/sdom'
import { objectClone } from '../../tools/index'
import { titreEtapeAdministrationsEmailsSend, titreEtapeUtilisateursEmailsSend } from '../graphql/resolvers/_titre-etape-email'
import { GetGeojsonInformation, convertPoints, getGeojsonInformation } from './perimetre.queries'
import { titreEtapeUpdateTask } from '../../business/titre-etape-update'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { titreDemarcheUpdatedEtatValidate, getPossiblesEtapesTypes } from '../../business/validations/titre-demarche-etat-validate'
import { FlattenEtape, GraphqlEtape, RestEtapeCreation, RestEtapeModification, restEtapeCreationValidator, restEtapeModificationValidator } from 'camino-common/src/etape-form'
import { ApiFlattenEtape, iTitreEtapeToFlattenEtape } from '../_format/titres-etapes'
import { CommuneId } from 'camino-common/src/static/communes'
import { titreEtapeUpdationValidate } from '../../business/validations/titre-etape-updation-validate'
import { CaminoApiError, IHeritageContenu, IHeritageProps, ITitre, ITitreDemarche, ITitreEtape } from '../../types'
import { checkEntreprisesExist, getEntrepriseDocuments } from './entreprises.queries'
import { ETAPE_HERITAGE_PROPS } from 'camino-common/src/heritage'
import { titreEtapeHeritageBuild } from '../graphql/resolvers/_titre-etape'
import { KM2 } from 'camino-common/src/number'
import { FeatureMultiPolygon, FeatureCollectionPoints } from 'camino-common/src/perimetre'
import { canHaveForages } from 'camino-common/src/permissions/titres'
import { SecteursMaritimes, getSecteurMaritime } from 'camino-common/src/static/facades'
import { callAndExit } from '../../tools/fp-tools'
import { RestNewGetCall } from '../../server/rest'
import { Effect, Match, pipe } from 'effect'
import { DbQueryAccessError } from '../../pg-database'
import { CaminoError } from 'camino-common/src/zod-tools'
import { machineFind } from '../../business/rules-demarches/machines'
import { TitreEtapeForMachine } from '../../business/rules-demarches/machine-common'

export const getEtapeEntrepriseDocuments =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<EtapeEntrepriseDocument[]>): Promise<void> => {
    const etapeIdParsed = etapeIdValidator.safeParse(req.params.etapeId)
    const user = req.auth

    if (!etapeIdParsed.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      try {
        const result = await getEntrepriseDocumentIdsByEtapeId({ titre_etape_id: etapeIdParsed.data }, pool, user)
        res.json(result)
      } catch (e) {
        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }

export const getEtapeDocuments =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<GetEtapeDocumentsByEtapeId>): Promise<void> => {
    const etapeIdParsed = etapeIdValidator.safeParse(req.params.etapeId)
    const user = req.auth

    if (!etapeIdParsed.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      try {
        const { etapeData, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires } = await getEtapeDataForEdition(pool, etapeIdParsed.data)

        const result = await getDocumentsByEtapeId(etapeIdParsed.data, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, etapeData.etape_type_id, {
          demarche_type_id: etapeData.demarche_type_id,
          entreprises_lecture: etapeData.demarche_entreprises_lecture,
          public_lecture: etapeData.demarche_public_lecture,
          titre_public_lecture: etapeData.titre_public_lecture,
        })

        res.json({ etapeDocuments: result })
      } catch (e) {
        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }

export const getEtapeAvis =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<GetEtapeAvisByEtapeId>): Promise<void> => {
    const etapeIdParsed = etapeIdValidator.safeParse(req.params.etapeId)
    const user = req.auth

    if (!etapeIdParsed.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      try {
        const { etapeData, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires } = await getEtapeDataForEdition(pool, etapeIdParsed.data)

        const result = await getEtapeAvisLargeObjectIdsByEtapeId(etapeIdParsed.data, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, etapeData.etape_type_id, {
          demarche_type_id: etapeData.demarche_type_id,
          entreprises_lecture: etapeData.demarche_entreprises_lecture,
          public_lecture: etapeData.demarche_public_lecture,
          titre_public_lecture: etapeData.titre_public_lecture,
        })

        const avis: GetEtapeAvisByEtapeId = result.map(a => ({ ...a, has_file: isNotNullNorUndefined(a.largeobject_id) }))
        res.json(getEtapeAvisByEtapeIdValidator.parse(avis))
      } catch (e) {
        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }

export const deleteEtape =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth

    const etapeId = etapeIdOrSlugValidator.safeParse(req.params.etapeIdOrSlug)
    if (!etapeId.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else if (isNullOrUndefined(user)) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND)
    } else {
      try {
        const titreEtape = await titreEtapeGet(
          etapeId.data,
          {
            fields: {
              demarche: { titre: { pointsEtape: { id: {} } } },
            },
          },
          user
        )

        if (isNullOrUndefined(titreEtape)) {
          res.sendStatus(HTTP_STATUS.NOT_FOUND)
        } else {
          if (!titreEtape.demarche || !titreEtape.demarche.titre || titreEtape.demarche.titre.administrationsLocales === undefined) {
            throw new Error('la démarche n’est pas chargée complètement')
          }

          if (
            !canDeleteEtape(user, titreEtape.typeId, titreEtape.isBrouillon, titreEtape.titulaireIds ?? [], titreEtape.demarche.titre.administrationsLocales ?? [], titreEtape.demarche.typeId, {
              typeId: titreEtape.demarche.titre.typeId,
              titreStatutId: titreEtape.demarche.titre.titreStatutId,
            })
          ) {
            res.sendStatus(HTTP_STATUS.FORBIDDEN)
          } else {
            const titreDemarche = await titreDemarcheGet(
              titreEtape.titreDemarcheId,
              {
                fields: {
                  titre: {
                    demarches: { etapes: { id: {} } },
                  },
                  etapes: { id: {} },
                },
              },
              userSuper
            )

            if (!titreDemarche) throw new Error("la démarche n'existe pas")

            if (!titreDemarche.titre) throw new Error("le titre n'existe pas")

            const { valid, errors: rulesErrors } = titreDemarcheUpdatedEtatValidate(titreDemarche.typeId, titreDemarche.titre, titreEtape, titreDemarche.id, titreDemarche.etapes!, true)

            if (!valid) {
              throw new Error(rulesErrors.join(', '))
            }
            await titreEtapeUpdate(titreEtape.id, { archive: true }, user, titreDemarche.titreId)

            await titreEtapeUpdateTask(pool, null, titreEtape.titreDemarcheId, user)

            res.sendStatus(HTTP_STATUS.NO_CONTENT)
          }
        }
      } catch (e) {
        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }
export const getEtape =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<DeepReadonly<FlattenEtape>>): Promise<void> => {
    const user = req.auth

    const etapeId = etapeIdOrSlugValidator.safeParse(req.params.etapeIdOrSlug)
    if (!etapeId.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else if (isNullOrUndefined(user)) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN)
    } else {
      try {
        const titreEtape = await titreEtapeGet(etapeId.data, { fields: { demarche: { titre: { pointsEtape: { id: {} } } } }, fetchHeritage: true }, user)

        if (isNullOrUndefined(titreEtape)) {
          res.sendStatus(HTTP_STATUS.NOT_FOUND)
        } else if (isNullOrUndefined(titreEtape.titulaireIds) || isNullOrUndefined(titreEtape.demarche?.titre) || titreEtape.demarche.titre.administrationsLocales === undefined) {
          console.error('la démarche n’est pas chargée complètement')
          res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        } else if (
          !canEditEtape(user, titreEtape.typeId, titreEtape.isBrouillon, titreEtape.titulaireIds ?? [], titreEtape.demarche.titre.administrationsLocales ?? [], titreEtape.demarche.typeId, {
            typeId: titreEtape.demarche.titre.typeId,
            titreStatutId: titreEtape.demarche.titre.titreStatutId,
          })
        ) {
          res.sendStatus(HTTP_STATUS.FORBIDDEN)
        } else {
          res.json(iTitreEtapeToFlattenEtape(titreEtape))
        }
      } catch (e) {
        console.error(e)

        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }
  }
const validateAndGetEntrepriseDocuments = async (
  pool: Pool,
  etape: Pick<FlattenEtape, 'titulaires' | 'amodiataires'>,
  entrepriseDocumentIds: EntrepriseDocumentId[],
  user: User
): Promise<EntrepriseDocument[]> => {
  const entrepriseDocuments: EntrepriseDocument[] = []

  const titulaires = etape.titulaires.value
  const amodiataires = etape.amodiataires.value
  if (isNotNullNorUndefinedNorEmpty(entrepriseDocumentIds)) {
    let entrepriseIds: EntrepriseId[] = []
    if (isNotNullNorUndefinedNorEmpty(titulaires)) {
      entrepriseIds.push(...titulaires)
    }
    if (isNotNullNorUndefinedNorEmpty(amodiataires)) {
      entrepriseIds.push(...amodiataires)
    }
    entrepriseIds = entrepriseIds.filter(onlyUnique)

    if (isNonEmptyArray(entrepriseIds)) {
      entrepriseDocuments.push(...(await getEntrepriseDocuments(entrepriseDocumentIds, entrepriseIds, pool, user)))
    }

    if (entrepriseDocumentIds.length !== entrepriseDocuments.length) {
      throw new Error("document d'entreprise incorrects")
    }
  }

  return entrepriseDocuments
}

export const arePointsOnPerimeter = (perimetre: FeatureMultiPolygon, points: FeatureCollectionPoints): boolean => {
  const coordinatesSet = new Set()

  perimetre.geometry.coordinates.forEach(geometry => geometry.forEach(sub => sub.forEach(coordinate => coordinatesSet.add(`${coordinate[0]}-${coordinate[1]}`))))

  return points.features.every(point => {
    return coordinatesSet.has(`${point.geometry.coordinates[0]}-${point.geometry.coordinates[1]}`)
  })
}
const getForagesProperties = async (
  titreTypeId: TitreTypeId,
  geojsonOrigineGeoSystemeId: GraphqlEtape['geojsonOrigineGeoSystemeId'],
  geojsonOrigineForages: GraphqlEtape['geojsonOrigineForages'],
  pool: Pool
): Promise<Pick<GraphqlEtape, 'geojson4326Forages' | 'geojsonOrigineForages'>> => {
  if (canHaveForages(titreTypeId) && isNotNullNorUndefined(geojsonOrigineForages) && isNotNullNorUndefined(geojsonOrigineGeoSystemeId)) {
    const value = await callAndExit(convertPoints(pool, geojsonOrigineGeoSystemeId, geojsonOrigineForages))
    return { geojson4326Forages: value, geojsonOrigineForages }
  }

  return {
    geojson4326Forages: null,
    geojsonOrigineForages: null,
  }
}
type PerimetreInfos = {
  secteursMaritime: SecteursMaritimes[]
  sdomZones: DeepReadonly<SDOMZoneId[]>
  surface: KM2 | null
} & Pick<GraphqlEtape, 'geojson4326Forages' | 'geojsonOrigineForages'> &
  Pick<GetGeojsonInformation, 'communes' | 'forets'>
const getPerimetreInfosInternal = async (
  pool: Pool,
  geojson4326Perimetre: GraphqlEtape['geojson4326Perimetre'],
  geojsonOriginePerimetre: GraphqlEtape['geojsonOriginePerimetre'],
  geojsonOriginePoints: GraphqlEtape['geojsonOriginePoints'],
  titreTypeId: TitreTypeId,
  geojsonOrigineGeoSystemeId: GraphqlEtape['geojsonOrigineGeoSystemeId'],
  geojsonOrigineForages: GraphqlEtape['geojsonOrigineForages']
): Promise<PerimetreInfos> => {
  if (isNotNullNorUndefined(geojson4326Perimetre)) {
    if (isNotNullNorUndefined(geojsonOriginePerimetre) && isNotNullNorUndefined(geojsonOriginePoints)) {
      if (!arePointsOnPerimeter(geojsonOriginePerimetre, geojsonOriginePoints)) {
        throw new Error(`les points doivent être sur le périmètre`)
      }
    }

    const { communes, sdom, surface, forets, secteurs } = await callAndExit(getGeojsonInformation(pool, geojson4326Perimetre.geometry))
    const { geojson4326Forages } = await getForagesProperties(titreTypeId, geojsonOrigineGeoSystemeId, geojsonOrigineForages, pool)

    return {
      surface,
      communes,
      forets,
      secteursMaritime: secteurs.map(s => getSecteurMaritime(s)),
      sdomZones: sdom,
      geojson4326Forages,
      geojsonOrigineForages,
    }
  } else {
    return {
      communes: [],
      forets: [],
      secteursMaritime: [],
      sdomZones: [],
      surface: null,
      geojson4326Forages: null,
      geojsonOrigineForages: null,
    }
  }
}
const getFlattenEtape = async (
  etape: RestEtapeCreation | RestEtapeModification,
  demarche: ITitreDemarche,
  titreTypeId: TitreTypeId,
  isBrouillon: EtapeBrouillon,
  etapeSlug: EtapeSlug | undefined,
  etapeOldConcurrence: TitreEtapeForMachine['concurrence'],
  etapeOldHasTitreFrom: TitreEtapeForMachine['hasTitreFrom'],
  pool: Pool
): Promise<{ flattenEtape: Partial<Pick<ApiFlattenEtape, 'id'>> & Omit<ApiFlattenEtape, 'id'>; perimetreInfos: PerimetreInfos }> => {
  const perimetreInfos = await getPerimetreInfosInternal(
    pool,
    etape.geojson4326Perimetre,
    etape.geojsonOriginePerimetre,
    etape.geojsonOriginePoints,
    titreTypeId,
    etape.geojsonOrigineGeoSystemeId,
    etape.geojsonOrigineForages
  )
  const titreEtapeHeritage = titreEtapeHeritageBuild(etape.date, etape.typeId, demarche, titreTypeId, demarche.typeId, null)

  const heritageProps = ETAPE_HERITAGE_PROPS.reduce<IHeritageProps>((acc, propId) => {
    acc[propId] = {
      actif: etape.heritageProps[propId].actif,
      etape: titreEtapeHeritage.heritageProps?.[propId].etape,
    }

    return acc
  }, {} as IHeritageProps)

  const sections = getSections(titreTypeId, demarche.typeId, etape.typeId)
  const heritageContenu = sections.reduce<IHeritageContenu>((accSections, section) => {
    accSections[section.id] = section.elements.reduce<NonNullable<IHeritageContenu[string]>>((accElements, element) => {
      accElements[element.id] = {
        actif: etape.heritageContenu?.[section.id]?.[element.id]?.actif ?? false, // eslint-disable-line @typescript-eslint/no-unnecessary-condition
        etape: titreEtapeHeritage.heritageContenu?.[section.id]?.[element.id]?.etape ?? undefined,
      }

      return accElements
    }, {})

    return accSections
  }, {})

  const fakeEtapeId = etapeIdValidator.parse('newId')
  const flattenEtape = iTitreEtapeToFlattenEtape({
    ...etape,
    demarche,
    ...perimetreInfos,
    isBrouillon,
    heritageProps,
    heritageContenu,
    // On ne voit pas comment mieux faire
    id: 'id' in etape ? etape.id : fakeEtapeId,
    slug: etapeSlug,
    concurrence: etapeOldConcurrence,
    hasTitreFrom: etapeOldHasTitreFrom,
  })

  return {
    flattenEtape: {
      ...flattenEtape,
      // On ne voit pas comment mieux faire
      id: flattenEtape.id !== fakeEtapeId ? flattenEtape.id : undefined,
    },
    perimetreInfos,
  }
}
export const createEtape =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<EtapeId>): Promise<void> => {
    try {
      const { success, data: etape, error } = restEtapeCreationValidator.safeParse(req.body)

      if (!success) {
        console.error('[etapeCreer] étape non correctement formatée', error)
        res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage: "l'étape n'est pas correctement formatée" })
      } else {
        const user = req.auth
        if (!user) {
          res.status(HTTP_STATUS.NOT_FOUND).json({ errorMessage: "la démarche n'existe pas" })
        } else {
          let titreDemarche = await titreDemarcheGet(etape.titreDemarcheId, { fields: {} }, user)

          if (!titreDemarche) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ errorMessage: "la démarche n'existe pas" })
          } else {
            titreDemarche = await titreDemarcheGet(
              etape.titreDemarcheId,
              {
                fields: {
                  titre: {
                    demarches: { etapes: { id: {} } },
                    pointsEtape: { id: {} },
                    titulairesEtape: { id: {} },
                    amodiatairesEtape: { id: {} },
                  },
                  etapes: { id: {} },
                },
              },
              userSuper
            )

            if (!titreDemarche || !titreDemarche.titre) {
              res.status(HTTP_STATUS.NOT_FOUND).json({ errorMessage: "le titre n'existe pas" })
            } else {
              const titreTypeId = titreDemarche.titre.typeId
              const isBrouillon = canBeBrouillon(etape.typeId)
              const { flattenEtape, perimetreInfos } = await getFlattenEtape(
                etape,
                titreDemarche,
                titreTypeId,
                isBrouillon,
                etapeSlugValidator.parse('unknown'),
                etape.typeId === ETAPES_TYPES.demande ? { amIFirst: true } : 'non-applicable',
                etape.typeId === ETAPES_TYPES.demande ? true : 'non-applicable',
                pool
              )
              const entrepriseDocuments: EntrepriseDocument[] = await validateAndGetEntrepriseDocuments(pool, flattenEtape, etape.entrepriseDocumentIds, user)

              const etapeDocumentsParsed = z.array(tempEtapeDocumentValidator).safeParse(etape.etapeDocuments)

              if (!etapeDocumentsParsed.success) {
                console.warn(etapeDocumentsParsed.error)

                res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage: 'Les documents envoyés ne sont pas conformes' })
              } else {
                const etapeDocuments = etapeDocumentsParsed.data

                const etapeAvisParsed = z.array(tempEtapeAvisValidator).safeParse(etape.etapeAvis)
                if (!etapeAvisParsed.success) {
                  console.warn(etapeAvisParsed.error)
                  res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage: 'Les avis envoyés ne sont pas conformes' })
                } else {
                  const etapeAvis = etapeAvisParsed.data
                  const rulesErrors = titreEtapeUpdationValidate(
                    flattenEtape,
                    titreDemarche,
                    titreDemarche.titre,
                    etapeDocuments,
                    etapeAvis,
                    entrepriseDocuments,
                    perimetreInfos.sdomZones,
                    perimetreInfos.communes.map(({ id }) => id),
                    user
                  )

                  if (rulesErrors.length) {
                    res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage: rulesErrors.join(', ') })
                  } else if (
                    !canCreateEtape(user, etape.typeId, isBrouillon, titreDemarche.titre.titulaireIds ?? [], titreDemarche.titre.administrationsLocales ?? [], titreDemarche.typeId, {
                      typeId: titreDemarche.titre.typeId,
                      titreStatutId: titreDemarche.titre.titreStatutId,
                    })
                  ) {
                    res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage: 'droits insuffisants pour créer cette étape' })
                  } else if (!(await checkEntreprisesExist(pool, [...etape.titulaireIds, ...etape.amodiataireIds]))) {
                    res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage: "certaines entreprises n'existent pas" })
                  } else {
                    etape.statutId = getStatutId(flattenEtape, getCurrent())

                    const etapeUpdated: ITitreEtape | undefined = await titreEtapeUpsert({ ...etape, ...perimetreInfos, isBrouillon }, user!, titreDemarche.titreId)
                    if (isNullOrUndefined(etapeUpdated)) {
                      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ errorMessage: "Une erreur est survenue lors de la création de l'étape" })
                    } else {
                      await insertEtapeDocuments(pool, etapeUpdated.id, etapeDocuments)
                      for (const document of entrepriseDocuments) {
                        await insertTitreEtapeEntrepriseDocument(pool, { titre_etape_id: etapeUpdated.id, entreprise_document_id: document.id })
                      }

                      await insertEtapeAvis(pool, etapeUpdated.id, etapeAvis)

                      try {
                        await titreEtapeUpdateTask(pool, etapeUpdated.id, etapeUpdated.titreDemarcheId, user)
                      } catch (e) {
                        console.error('une erreur est survenue lors des tâches annexes', e)
                      }

                      await titreEtapeAdministrationsEmailsSend(etapeUpdated, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre.typeId, user)
                      await titreEtapeUtilisateursEmailsSend(etapeUpdated, titreDemarche.titreId, pool)

                      res.json(etapeUpdated.id)
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e)

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ errorMessage: "Une erreur est survenue lors de la création de l'étape", extra: e })
    }
  }

export const updateEtape =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<EtapeId>): Promise<void> => {
    try {
      const { success, data: etape, error } = restEtapeModificationValidator.safeParse(req.body)

      if (!success) {
        console.error('[etapeModifier] étape non correctement formatée', error)
        res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage: "l'étape n'est pas correctement formatée" })
      } else {
        const user = req.auth
        if (!user) {
          res.status(HTTP_STATUS.NOT_FOUND).json({ errorMessage: "la démarche n'existe pas" })
        } else {
          const titreEtapeOld = await titreEtapeGet(
            etape.id,
            {
              fields: {
                demarche: { titre: { pointsEtape: { id: {} } } },
              },
            },
            user
          )

          if (isNullOrUndefined(titreEtapeOld)) throw new Error("l'étape n'existe pas")
          if (!titreEtapeOld.demarche || !titreEtapeOld.demarche.titre || titreEtapeOld.demarche.titre.administrationsLocales === undefined) {
            throw new Error('la démarche n’est pas chargée complètement')
          }

          if (
            !canEditEtape(
              user,
              titreEtapeOld.typeId,
              titreEtapeOld.isBrouillon,
              titreEtapeOld.titulaireIds ?? [],
              titreEtapeOld.demarche.titre.administrationsLocales ?? [],
              titreEtapeOld.demarche.typeId,
              {
                typeId: titreEtapeOld.demarche.titre.typeId,
                titreStatutId: titreEtapeOld.demarche.titre.titreStatutId,
              }
            )
          )
            throw new Error('droits insuffisants')

          if (titreEtapeOld.typeId !== etape.typeId) throw new Error("Il est interdit d'éditer le type d'étape")

          if (titreEtapeOld.titreDemarcheId !== etape.titreDemarcheId) throw new Error("la démarche n'existe pas")
          const titreDemarche = await titreDemarcheGet(
            etape.titreDemarcheId,
            {
              fields: {
                titre: {
                  demarches: { etapes: { id: {} } },
                  titulairesEtape: { id: {} },
                  amodiatairesEtape: { id: {} },
                },
                etapes: { id: {} },
              },
            },
            userSuper
          )

          if (!titreDemarche || !titreDemarche.titre) throw new Error("le titre n'existe pas")
          if (isNullOrUndefined(titreDemarche.titre.titulaireIds) || isNullOrUndefined(titreDemarche.titre.amodiataireIds)) throw new Error('la démarche n’est pas chargée complètement')
          const titreTypeId = titreDemarche.titre.typeId
          const isBrouillon = titreEtapeOld.isBrouillon
          const { flattenEtape, perimetreInfos } = await getFlattenEtape(
            etape,
            titreDemarche,
            titreTypeId,
            isBrouillon,
            titreEtapeOld.slug,
            titreEtapeOld.concurrence,
            titreEtapeOld.hasTitreFrom,
            pool
          )

          const entrepriseDocuments: EntrepriseDocument[] = await validateAndGetEntrepriseDocuments(pool, flattenEtape, etape.entrepriseDocumentIds, user)

          const etapeDocumentsParsed = z.array(etapeDocumentModificationValidator).safeParse(etape.etapeDocuments)

          if (!etapeDocumentsParsed.success) {
            console.warn(etapeDocumentsParsed.error)
            throw new Error('Les documents envoyés ne sont pas conformes')
          }

          const etapeDocuments = etapeDocumentsParsed.data

          const rulesErrors = titreEtapeUpdationValidate(
            flattenEtape,
            titreDemarche,
            titreDemarche.titre,
            etapeDocuments,
            etape.etapeAvis,
            entrepriseDocuments,
            perimetreInfos.sdomZones,
            perimetreInfos.communes.map(({ id }) => id),
            user,
            titreEtapeOld
          )

          if (rulesErrors.length) {
            throw new Error(rulesErrors.join(', '))
          }

          if (!(await checkEntreprisesExist(pool, [...etape.titulaireIds, ...etape.amodiataireIds]))) {
            throw new Error("certaines entreprises n'existent pas")
          }

          etape.statutId = getStatutId(flattenEtape, getCurrent())

          const etapeUpdated: ITitreEtape | undefined = await titreEtapeUpsert({ ...etape, ...perimetreInfos, isBrouillon: titreEtapeOld.isBrouillon }, user!, titreDemarche.titreId)
          if (isNullOrUndefined(etapeUpdated)) {
            throw new Error("Une erreur est survenue lors de la modification de l'étape")
          }
          await updateEtapeDocuments(pool, user, etapeUpdated.id, etapeUpdated.isBrouillon, etapeDocuments)
          await deleteTitreEtapeEntrepriseDocument(pool, { titre_etape_id: etapeUpdated.id })
          for (const document of entrepriseDocuments) {
            await insertTitreEtapeEntrepriseDocument(pool, { titre_etape_id: etapeUpdated.id, entreprise_document_id: document.id })
          }

          await updateEtapeAvis(
            pool,
            etapeUpdated.id,
            isBrouillon,
            etape.etapeAvis,
            etape.typeId,
            titreTypeId,
            perimetreInfos.communes.map(({ id }) => id)
          )

          await titreEtapeUpdateTask(pool, etapeUpdated.id, etapeUpdated.titreDemarcheId, user)

          await titreEtapeAdministrationsEmailsSend(flattenEtape, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre.typeId, user, titreEtapeOld)
          res.json(titreEtapeOld.id)
        }
      }
    } catch (e: any) {
      console.error(e)

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ errorMessage: e.message, extra: e })
    }
  }

export const deposeEtape =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const user = req.auth

    const etapeId = etapeIdValidator.safeParse(req.params.etapeId)
    if (!etapeId.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      try {
        const id = etapeId.data

        if (!user) {
          throw new Error("l'étape n'existe pas")
        }

        const titreEtape = await titreEtapeGet(id, { fields: { id: {} }, fetchHeritage: true }, user)

        if (isNullOrUndefined(titreEtape)) throw new Error("l'étape n'existe pas")
        const titreEtapeOld = objectClone(titreEtape)

        const titreDemarche = await titreDemarcheGet(
          titreEtape.titreDemarcheId,
          {
            fields: {
              titre: { pointsEtape: { id: {} }, titulairesEtape: { id: {} }, amodiatairesEtape: { id: {} } },
            },
          },
          userSuper
        )

        if (!titreDemarche) throw new Error("la démarche n'existe pas")

        const titre = titreDemarche.titre
        if (isNullOrUndefined(titre)) throw new Error("le titre n'est pas chargé")
        if (isNullOrUndefined(titre.administrationsLocales)) throw new Error('les administrations locales du titre ne sont pas chargées')

        if (isNullOrUndefined(titre.titulaireIds)) throw new Error('les titulaires du titre ne sont pas chargés')
        if (isNullOrUndefined(titre.amodiataireIds)) throw new Error('les amodiataires du titre ne sont pas chargés')
        if (isNullOrUndefined(titreEtape.slug)) throw new Error("le slug de l'étape est obligatoire")

        const sdomZones: SDOMZoneId[] = []
        const communes: CommuneId[] = []
        if (isNotNullNorUndefined(titreEtape.geojson4326Perimetre)) {
          const { sdom, communes: communeFromGeoJson } = await callAndExit(getGeojsonInformation(pool, titreEtape.geojson4326Perimetre.geometry))

          communes.push(...communeFromGeoJson.map(({ id }) => id))
          sdomZones.push(...sdom)
        }
        const titreTypeId = memoize(() => Promise.resolve(titre.typeId))
        const administrationsLocales = memoize(() => Promise.resolve(titre.administrationsLocales ?? []))
        const entreprisesTitulairesOuAmodiataires = memoize(() => {
          return Promise.resolve([...(titre.titulaireIds ?? []), ...(titre.amodiataireIds ?? [])])
        })
        const etapeDocuments = await getDocumentsByEtapeId(id, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, titreEtape.typeId, {
          demarche_type_id: titreDemarche.typeId,
          entreprises_lecture: titreDemarche.entreprisesLecture ?? false,
          public_lecture: titreDemarche.publicLecture ?? false,
          titre_public_lecture: titre.publicLecture ?? false,
        })

        const entrepriseDocuments = await getEntrepriseDocumentIdsByEtapeId({ titre_etape_id: titreEtape.id }, pool, userSuper)

        // On utilise le userSuper pour charger tous les avis, car celui qui dépose ne peut peut-être pas voir tous les avis
        const etapeAvis = await getEtapeAvisLargeObjectIdsByEtapeId(id, pool, userSuper, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, titreEtape.typeId, {
          demarche_type_id: titreDemarche.typeId,
          entreprises_lecture: titreDemarche.entreprisesLecture ?? false,
          public_lecture: titreDemarche.publicLecture ?? false,
          titre_public_lecture: titre.publicLecture ?? false,
        })

        // TODO 2023-06-14 TS 5.1 n’arrive pas réduire le type de titre
        const flattenEtape = iTitreEtapeToFlattenEtape(titreEtape)
        const deposable = canDeposeEtape(
          user,
          { ...titre, titulaires: titre.titulaireIds ?? [], administrationsLocales: titre.administrationsLocales ?? [] },
          titreDemarche.typeId,
          flattenEtape,
          etapeDocuments,
          entrepriseDocuments,
          sdomZones,
          communes,
          etapeAvis
        )
        if (!deposable) throw new Error('droits insuffisants')

        if (canBeBrouillon(titreEtape.typeId) === ETAPE_IS_NOT_BROUILLON) {
          throw new Error('cette étape ne peut-être déposée')
        }

        const date = isEntreprise(user) || isBureauDEtudes(user) ? getCurrent() : titreEtape.date

        await titreEtapeUpdate(
          titreEtape.id,
          {
            date,
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
          },
          user,
          titreDemarche.titreId
        )
        const etapeUpdated = await titreEtapeGet(
          titreEtape.id,
          {
            fields: { id: {} },
          },
          user
        )

        await titreEtapeUpdateTask(pool, etapeUpdated.id, etapeUpdated.titreDemarcheId, user)

        await titreEtapeAdministrationsEmailsSend(etapeUpdated, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre!.typeId, user!, titreEtapeOld)

        res.sendStatus(HTTP_STATUS.NO_CONTENT)
      } catch (e) {
        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }

export const getEtapesTypesEtapesStatusWithMainStep: RestNewGetCall<'/rest/etapesTypes/:demarcheId/:date'> = ({
  params,
  searchParams,
  user,
}): Effect.Effect<EtapeTypeEtapeStatutWithMainStep, CaminoApiError<DemarcheEtapesTypesGetErrors>> => {
  return pipe(
    demarcheEtapesTypesGet(params.demarcheId, params.date, searchParams.etapeId ?? null, user),
    Effect.mapError(caminoError =>
      Match.value(caminoError.message).pipe(
        Match.whenOr("l'étape n'existe pas", "la démarche n'existe pas", () => ({ ...caminoError, status: HTTP_STATUS.FORBIDDEN })),
        Match.whenOr(
          "la démarche n'est pas complète",
          'les étapes ne sont pas chargées',
          "Impossible d'accéder à la base de données",
          "Impossible de récupérer les types d'étapes",
          "impossible de récupérer l'étape",
          'impossible de récupérer la démarche',
          () => ({ ...caminoError, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })
        ),
        Match.exhaustive
      )
    )
  )
}

const impossibleDeRecupererLesEtapesTypes = "Impossible de récupérer les types d'étapes" as const
const etapeNonExistante = "l'étape n'existe pas" as const
const etapeNonChargees = 'les étapes ne sont pas chargées' as const
const demarcheIncomplete = "la démarche n'est pas complète" as const
const demarcheInexistante = "la démarche n'existe pas" as const
const impossibleDeRecupererLaDemarche = 'impossible de récupérer la démarche' as const
const impossibleDeRecupererLEtape = "impossible de récupérer l'étape" as const
type DemarcheEtapesTypesGetErrors =
  | DbQueryAccessError
  | typeof impossibleDeRecupererLaDemarche
  | typeof demarcheInexistante
  | typeof demarcheIncomplete
  | typeof etapeNonChargees
  | typeof impossibleDeRecupererLEtape
  | typeof etapeNonExistante
  | typeof impossibleDeRecupererLesEtapesTypes
const demarcheEtapesTypesGet = (
  titreDemarcheId: DemarcheId,
  date: CaminoDate,
  titreEtapeId: EtapeId | null,
  user: DeepReadonly<User>
): Effect.Effect<EtapeTypeEtapeStatutWithMainStep, CaminoError<DemarcheEtapesTypesGetErrors>> => {
  return Effect.Do.pipe(
    Effect.bind('titreDemarche', () =>
      Effect.tryPromise({
        try: async () =>
          titreDemarcheGet(
            titreDemarcheId,
            {
              fields: {
                titre: {
                  demarches: { etapes: { id: {} } },
                  pointsEtape: { id: {} },
                  titulairesEtape: { id: {} },
                },
                etapes: { id: {} },
              },
            },
            userSuper
          ),
        catch: e => ({ message: impossibleDeRecupererLaDemarche, extra: e }),
      })
    ),
    Effect.filterOrFail(
      (result): result is NotNullableKeys<typeof result> => isNotNullNorUndefined(result.titreDemarche),
      () => ({ message: demarcheInexistante })
    ),
    Effect.filterOrFail(
      (result): result is NotNullableKeys<typeof result> & { titreDemarche: { titre: ITitre } } => isNotNullNorUndefined(result.titreDemarche.titre?.titulaireIds),
      () => ({ message: demarcheIncomplete })
    ),
    Effect.filterOrFail(
      ({ titreDemarche }) => isNotNullNorUndefined(titreDemarche.etapes),
      () => ({ message: etapeNonChargees })
    ),
    Effect.bind('etape', () =>
      Effect.tryPromise({
        try: async () => {
          if (isNotNullNorUndefined(titreEtapeId)) {
            return titreEtapeGet(titreEtapeId, {}, user)
          } else {
            return undefined
          }
        },
        catch: e => ({ message: impossibleDeRecupererLEtape, extra: e }),
      })
    ),
    Effect.filterOrFail(
      ({ etape }) => isNullOrUndefined(titreEtapeId) || (isNotNullNorUndefined(titreEtapeId) && isNotNullNorUndefined(etape)),
      () => ({ message: etapeNonExistante })
    ),
    Effect.bind('machine', ({ titreDemarche }) => Effect.succeed(machineFind(titreDemarche.titre.typeId, titreDemarche.typeId, titreDemarche.etapes, titreDemarche.id, date))),
    Effect.bind('etapesTypes', ({ machine, titreDemarche, etape }) =>
      Effect.try({
        try: () => {
          const etapesTypes: EtapeTypeEtapeStatutWithMainStep = getPossiblesEtapesTypes(
            machine,
            titreDemarche.titre.typeId,
            titreDemarche.typeId,
            etape?.typeId,
            titreEtapeId ?? undefined,
            date,
            titreDemarche.etapes ?? []
          )
          return etapesTypes
        },
        catch: e => ({ message: impossibleDeRecupererLesEtapesTypes, extra: e }),
      })
    ),
    Effect.map(({ etapesTypes, titreDemarche }) =>
      getKeys(etapesTypes, isEtapeTypeId).reduce<EtapeTypeEtapeStatutWithMainStep>((acc, etapeTypeId) => {
        if (
          canCreateEtape(user, etapeTypeId, ETAPE_IS_BROUILLON, titreDemarche.titre.titulaireIds ?? [], titreDemarche.titre.administrationsLocales ?? [], titreDemarche.typeId, {
            typeId: titreDemarche.titre.typeId,
            titreStatutId: titreDemarche.titre.titreStatutId,
          })
        ) {
          acc[etapeTypeId] = etapesTypes[etapeTypeId]
        }

        return acc
      }, {})
    )
  )
}
