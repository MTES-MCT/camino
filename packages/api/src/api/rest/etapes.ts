import { z } from 'zod'
import { CaminoRequest, CustomResponse } from './express-type.js'
import {
  EtapeTypeEtapeStatutWithMainStep,
  etapeIdValidator,
  EtapeId,
  GetEtapeDocumentsByEtapeId,
  needAslAndDae,
  documentTypeIdComplementaireObligatoireDAE,
  ETAPE_IS_NOT_BROUILLON,
  etapeIdOrSlugValidator,
  GetEtapeAvisByEtapeId,
  getEtapeAvisByEtapeIdValidator,
  tempEtapeAvisValidator,
  tempEtapeDocumentValidator,
  EtapeBrouillon,
  etapeSlugValidator,
  etapeDocumentModificationValidator,
  documentComplementaireDaeEtapeDocumentModificationValidator,
  documentComplementaireAslEtapeDocumentModificationValidator,
  EtapeSlug,
  ETAPE_IS_BROUILLON,
  getStatutId,
} from 'camino-common/src/etape.js'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { CaminoDate, caminoDateValidator, getCurrent } from 'camino-common/src/date.js'
import { titreDemarcheGet } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { titreEtapeGet, titreEtapeUpdate, titreEtapeUpsert } from '../../database/queries/titres-etapes.js'
import { demarcheDefinitionFind } from '../../business/rules-demarches/definitions.js'
import { User, isBureauDEtudes, isEntreprise } from 'camino-common/src/roles.js'
import { canCreateEtape, canDeposeEtape, canDeleteEtape, canEditEtape, canEditDates, canEditDuree } from 'camino-common/src/permissions/titres-etapes.js'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import { canBeBrouillon } from 'camino-common/src/static/etapesTypes.js'
import { DeepReadonly, SimplePromiseFn, isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, memoize, onlyUnique } from 'camino-common/src/typescript-tools.js'
import { Pool } from 'pg'
import { EntrepriseDocument, EntrepriseDocumentId, EntrepriseId, EtapeEntrepriseDocument } from 'camino-common/src/entreprise.js'
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
} from '../../database/queries/titres-etapes.queries.js'
import { GetEtapeDataForEdition, getEtapeByDemarcheIdAndEtapeTypeId, getEtapeDataForEdition } from './etapes.queries.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { objectClone } from '../../tools/index.js'
import { titreEtapeAdministrationsEmailsSend, titreEtapeUtilisateursEmailsSend } from '../graphql/resolvers/_titre-etape-email.js'
import { GetGeojsonInformation, convertPoints, getGeojsonInformation } from './perimetre.queries.js'
import { titreEtapeUpdateTask } from '../../business/titre-etape-update.js'
import { valeurFind } from 'camino-common/src/sections.js'
import { getElementWithValue, getSections, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { titreDemarcheUpdatedEtatValidate, getPossiblesEtapesTypes } from '../../business/validations/titre-demarche-etat-validate.js'
import { FlattenEtape, GraphqlEtape, RestEtapeCreation, RestEtapeModification, restEtapeCreationValidator, restEtapeModificationValidator } from 'camino-common/src/etape-form.js'
import { iTitreEtapeToFlattenEtape } from '../_format/titres-etapes.js'
import { CommuneId } from 'camino-common/src/static/communes.js'
import { titreEtapeUpdationValidate } from '../../business/validations/titre-etape-updation-validate.js'
import { IHeritageContenu, IHeritageProps, ITitreDemarche, ITitreEtape } from '../../types.js'
import { checkEntreprisesExist, getEntrepriseDocuments } from './entreprises.queries.js'
import { ETAPE_HERITAGE_PROPS } from 'camino-common/src/heritage.js'
import { titreEtapeHeritageBuild } from '../graphql/resolvers/_titre-etape.js'
import { KM2 } from 'camino-common/src/number.js'
import { FeatureMultiPolygon, FeatureCollectionPoints } from 'camino-common/src/perimetre.js'
import { canHaveForages } from 'camino-common/src/permissions/titres.js'
import { SecteursMaritimes, getSecteurMaritime } from 'camino-common/src/static/facades.js'
import { callAndExit } from '../../tools/fp-tools.js'

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

const getDaeDocument = async (
  pool: Pool,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>,
  etapeData: GetEtapeDataForEdition
) => {
  const daeEtape = await getEtapeByDemarcheIdAndEtapeTypeId(pool, 'dae', etapeData.demarche_id)
  if (isNotNullNorUndefined(daeEtape)) {
    const daeEtapeDocuments = await getDocumentsByEtapeId(daeEtape.etape_id, pool, user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, etapeData.etape_type_id, {
      demarche_type_id: etapeData.demarche_type_id,
      entreprises_lecture: etapeData.demarche_entreprises_lecture,
      public_lecture: etapeData.demarche_public_lecture,
      titre_public_lecture: etapeData.titre_public_lecture,
    })

    const daeArreteDocument = daeEtapeDocuments.find(({ etape_document_type_id }) => etape_document_type_id === documentTypeIdComplementaireObligatoireDAE)
    if (isNotNullNorUndefined(daeArreteDocument)) {
      const sectionsWithValue = getSectionsWithValue(getSections(etapeData.titre_type_id, etapeData.demarche_type_id, 'dae'), daeEtape.contenu)
      const elementWithValue = getElementWithValue(sectionsWithValue, 'mea', 'arrete')
      const arrete_prefectoral = isNotNullNorUndefined(elementWithValue) ? valeurFind(elementWithValue) : null

      return {
        id: daeArreteDocument.id,
        date: daeEtape.date,
        etape_statut_id: daeEtape.etape_statut_id,
        arrete_prefectoral,
        description: daeArreteDocument.description,
        entreprises_lecture: daeArreteDocument.entreprises_lecture,
        public_lecture: daeArreteDocument.public_lecture,
        etape_document_type_id: documentTypeIdComplementaireObligatoireDAE,
      }
    }
  }

  return null
}

const getAslDocument = async (
  pool: Pool,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>,
  etapeData: GetEtapeDataForEdition
): Promise<GetEtapeDocumentsByEtapeId['asl'] | null> => {
  const aslEtape = await getEtapeByDemarcheIdAndEtapeTypeId(pool, 'asl', etapeData.demarche_id)
  if (isNotNullNorUndefined(aslEtape)) {
    const aslEtapeDocuments = await getDocumentsByEtapeId(aslEtape.etape_id, pool, user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, etapeData.etape_type_id, {
      demarche_type_id: etapeData.demarche_type_id,
      entreprises_lecture: etapeData.demarche_entreprises_lecture,
      public_lecture: etapeData.demarche_public_lecture,
      titre_public_lecture: etapeData.titre_public_lecture,
    })

    const aslEtapeDocumentTypeId = 'let'

    const aslLettreDocument = aslEtapeDocuments.find(({ etape_document_type_id }) => etape_document_type_id === aslEtapeDocumentTypeId)
    if (isNotNullNorUndefined(aslLettreDocument)) {
      return {
        id: aslLettreDocument.id,
        date: aslEtape.date,
        etape_statut_id: aslEtape.etape_statut_id,
        description: aslLettreDocument.description,
        entreprises_lecture: aslLettreDocument.entreprises_lecture,
        public_lecture: aslLettreDocument.public_lecture,
        etape_document_type_id: aslEtapeDocumentTypeId,
      }
    }
  }

  return null
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

        let dae: null | GetEtapeDocumentsByEtapeId['dae'] = null
        let asl: null | GetEtapeDocumentsByEtapeId['asl'] = null
        if (needAslAndDae({ etapeTypeId: etapeData.etape_type_id, demarcheTypeId: etapeData.demarche_type_id, titreTypeId: etapeData.titre_type_id }, etapeData.etape_is_brouillon, user)) {
          dae = await getDaeDocument(pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, etapeData)
          asl = await getAslDocument(pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, etapeData)
        }

        res.json({ etapeDocuments: result, asl, dae })
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

export const deleteEtape = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<void>) => {
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
        if (!titreEtape.demarche || !titreEtape.demarche.titre || titreEtape.demarche.titre.administrationsLocales === undefined || !titreEtape.demarche.titre.titreStatutId) {
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

          const rulesErrors = titreDemarcheUpdatedEtatValidate(titreDemarche.typeId, titreDemarche.titre, titreEtape, titreDemarche.id, titreDemarche.etapes!, true)

          if (rulesErrors.length) {
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
export const getEtape = (_pool: Pool) => async (req: CaminoRequest, res: CustomResponse<DeepReadonly<FlattenEtape>>) => {
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
    return callAndExit(convertPoints(pool, geojsonOrigineGeoSystemeId, geojsonOrigineForages), async value => {
      return { geojson4326Forages: value, geojsonOrigineForages }
    })
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

    return callAndExit(getGeojsonInformation(pool, geojson4326Perimetre.geometry), async ({ communes, sdom, surface, forets, secteurs }) => {
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
    })
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
  pool: Pool
): Promise<{ flattenEtape: Partial<Pick<FlattenEtape, 'id'>> & Omit<FlattenEtape, 'id'>; perimetreInfos: PerimetreInfos }> => {
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
    accSections[section.id] = section.elements.reduce<IHeritageContenu[string]>((accElements, element) => {
      accElements[element.id] = {
        actif: etape.heritageContenu[section.id]?.[element.id]?.actif ?? false,
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
export const createEtape = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<EtapeId>) => {
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
            const titreTypeId = titreDemarche?.titre?.typeId
            if (!titreTypeId) {
              res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ errorMessage: `le type du titre de la ${titreDemarche.id} n'est pas chargé` })
            } else {
              const isBrouillon = canBeBrouillon(etape.typeId)
              const { flattenEtape, perimetreInfos } = await getFlattenEtape(etape, titreDemarche, titreTypeId, isBrouillon, etapeSlugValidator.parse('unknown'), pool)
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
                    user,
                    null,
                    null
                  )

                  if (rulesErrors.length) {
                    res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage: rulesErrors.join(', ') })
                  } else if (
                    !canCreateEtape(user, etape.typeId, isBrouillon, titreDemarche.titre.titulaireIds ?? [], titreDemarche.titre.administrationsLocales ?? [], titreDemarche.typeId, {
                      typeId: titreDemarche.titre.typeId,
                      titreStatutId: titreDemarche.titre.titreStatutId ?? TitresStatutIds.Indetermine,
                    })
                  ) {
                    res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage: 'droits insuffisants pour créer cette étape' })
                  } else if (!(await checkEntreprisesExist(pool, [...(etape.titulaireIds ?? []), ...(etape.amodiataireIds ?? [])]))) {
                    res.status(HTTP_STATUS.BAD_REQUEST).json({ errorMessage: "certaines entreprises n'existent pas" })
                  } else {
                    if (!canEditDuree(titreTypeId, titreDemarche.typeId)) {
                      etape.duree = null
                    }

                    if (!canEditDates(titreTypeId, titreDemarche.typeId, etape.typeId, user) && (isNotNullNorUndefined(etape.dateDebut) || isNotNullNorUndefined(etape.dateFin))) {
                      etape.dateDebut = null
                      etape.dateFin = null
                    }

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
                      await titreEtapeUtilisateursEmailsSend(etapeUpdated, titreDemarche.titreId)

                      res.json(etapeUpdated.id)
                    }
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

export const updateEtape = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<EtapeId>) => {
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
        if (!titreEtapeOld.demarche || !titreEtapeOld.demarche.titre || titreEtapeOld.demarche.titre.administrationsLocales === undefined || !titreEtapeOld.demarche.titre.titreStatutId) {
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
        const titreTypeId = titreDemarche?.titre?.typeId
        if (!titreTypeId) {
          throw new Error(`le type du titre de la ${titreDemarche.id} n'est pas chargé`)
        }
        const isBrouillon = titreEtapeOld.isBrouillon
        const { flattenEtape, perimetreInfos } = await getFlattenEtape(etape, titreDemarche, titreTypeId, isBrouillon, titreEtapeOld.slug, pool)
        const entrepriseDocuments: EntrepriseDocument[] = await validateAndGetEntrepriseDocuments(pool, flattenEtape, etape.entrepriseDocumentIds, user)

        const etapeDocumentsParsed = z.array(etapeDocumentModificationValidator).safeParse(etape.etapeDocuments)

        if (!etapeDocumentsParsed.success) {
          console.warn(etapeDocumentsParsed.error)
          throw new Error('Les documents envoyés ne sont pas conformes')
        }

        const etapeDocuments = etapeDocumentsParsed.data

        const needToCreateAslAndDae = needAslAndDae({ etapeTypeId: etape.typeId, demarcheTypeId: titreDemarche.typeId, titreTypeId: titreDemarche.titre.typeId }, titreEtapeOld.isBrouillon, user)
        let daeDocument = null
        let aslDocument = null
        if (needToCreateAslAndDae) {
          const daeDocumentParsed = documentComplementaireDaeEtapeDocumentModificationValidator.nullable().safeParse(etape.daeDocument)
          if (!daeDocumentParsed.success) {
            console.warn(daeDocumentParsed.error)
            throw new Error('L’arrêté préfectoral n’est pas conforme')
          }

          daeDocument = daeDocumentParsed.data

          const aslDocumentParsed = documentComplementaireAslEtapeDocumentModificationValidator.nullable().safeParse(etape.aslDocument)
          if (!aslDocumentParsed.success) {
            console.warn(aslDocumentParsed.error)
            throw new Error('La lettre du propriétaire du sol n’est pas conforme')
          }

          aslDocument = aslDocumentParsed.data
        }

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
          daeDocument,
          aslDocument,
          titreEtapeOld
        )

        if (rulesErrors.length) {
          throw new Error(rulesErrors.join(', '))
        }

        if (!canEditDuree(titreTypeId, titreDemarche.typeId)) {
          etape.duree = titreEtapeOld.duree ?? null
        }

        if (!canEditDates(titreTypeId, titreDemarche.typeId, etape.typeId, user)) {
          etape.dateDebut = titreEtapeOld.dateDebut ?? null
          etape.dateFin = titreEtapeOld.dateFin ?? null
        }

        if (!(await checkEntreprisesExist(pool, [...(etape.titulaireIds ?? []), ...(etape.amodiataireIds ?? [])]))) {
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

        if (needToCreateAslAndDae) {
          if (daeDocument !== null) {
            const daeEtapeInDb = await getEtapeByDemarcheIdAndEtapeTypeId(pool, 'dae', titreDemarche.id)

            const daeEtape = await titreEtapeUpsert(
              {
                id: daeEtapeInDb?.etape_id ?? undefined,
                typeId: 'dae',
                statutId: daeDocument.etape_statut_id,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                titreDemarcheId: titreDemarche.id,
                date: daeDocument.date,
                contenu: {
                  mea: { arrete: daeDocument.arrete_prefectoral },
                },
              },
              user!,
              titreDemarche.titreId
            )
            if (isNullOrUndefined(daeEtape)) {
              throw new Error("impossible d'intégrer le document lié à la DAE")
            }

            await updateEtapeDocuments(pool, user, daeEtape.id, titreEtapeOld.isBrouillon, [daeDocument])
          }

          if (aslDocument !== null) {
            const aslEtapeInDb = await getEtapeByDemarcheIdAndEtapeTypeId(pool, 'asl', titreDemarche.id)

            const aslEtape = await titreEtapeUpsert(
              {
                id: aslEtapeInDb?.etape_id ?? undefined,
                typeId: 'asl',
                statutId: aslDocument.etape_statut_id,
                isBrouillon: ETAPE_IS_NOT_BROUILLON,
                titreDemarcheId: titreDemarche.id,
                date: aslDocument.date,
              },
              user!,
              titreDemarche.titreId
            )

            if (isNullOrUndefined(aslEtape)) {
              throw new Error("impossible d'intégrer le document lié à la ASL")
            }
            await updateEtapeDocuments(pool, user, aslEtape.id, titreEtapeOld.isBrouillon, [aslDocument])
          }
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

export const deposeEtape = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<void>) => {
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

      const titreEtape = await titreEtapeGet(id, { fields: { id: {} } }, user)

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
        await callAndExit(getGeojsonInformation(pool, titreEtape.geojson4326Perimetre.geometry), async ({ sdom, communes: communeFromGeoJson }) => {
          communes.push(...communeFromGeoJson.map(({ id }) => id))
          sdomZones.push(...sdom)
        })
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

      const daeDocument = await getDaeDocument(pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, {
        demarche_entreprises_lecture: titreDemarche.entreprisesLecture ?? false,
        demarche_public_lecture: titreDemarche.publicLecture ?? false,
        demarche_id: titreDemarche.id,
        demarche_type_id: titreDemarche.typeId,
        etape_statut_id: titreEtape.statutId,
        etape_type_id: titreEtape.typeId,
        titre_public_lecture: titre.publicLecture ?? false,
        titre_type_id: titre.typeId,
        etape_slug: titreEtape.slug,
        etape_is_brouillon: titreEtape.isBrouillon,
      })

      const aslDocument = await getAslDocument(pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, {
        demarche_entreprises_lecture: titreDemarche.entreprisesLecture ?? false,
        demarche_public_lecture: titreDemarche.publicLecture ?? false,
        demarche_id: titreDemarche.id,
        demarche_type_id: titreDemarche.typeId,
        etape_statut_id: titreEtape.statutId,
        etape_type_id: titreEtape.typeId,
        titre_public_lecture: titre.publicLecture ?? false,
        titre_type_id: titre.typeId,
        etape_slug: titreEtape.slug,
        etape_is_brouillon: titreEtape.isBrouillon,
      })

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
        daeDocument,
        aslDocument,
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

export const getEtapesTypesEtapesStatusWithMainStep =
  (_pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<EtapeTypeEtapeStatutWithMainStep[]>): Promise<void> => {
    const demarcheIdParsed = demarcheIdValidator.safeParse(req.params.demarcheId)
    const dateParsed = caminoDateValidator.safeParse(req.params.date)
    const etapeIdParsed = z.optional(etapeIdValidator).safeParse(req.query.etapeId)
    const user = req.auth

    if (!demarcheIdParsed.success || !dateParsed.success || !etapeIdParsed.success) {
      res.sendStatus(HTTP_STATUS.BAD_REQUEST)
    } else {
      try {
        const result = await demarcheEtapesTypesGet(demarcheIdParsed.data, dateParsed.data, etapeIdParsed.data ?? null, user)
        res.json(result)
      } catch (e) {
        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }

const demarcheEtapesTypesGet = async (titreDemarcheId: DemarcheId, date: CaminoDate, titreEtapeId: EtapeId | null, user: User) => {
  const titreDemarche = await titreDemarcheGet(
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
  )

  if (!titreDemarche) throw new Error("la démarche n'existe pas")
  if (isNullOrUndefined(titreDemarche.titre?.titulaireIds)) {
    throw new Error("la démarche n'est pas complète")
  }
  if (!titreDemarche.etapes) throw new Error('les étapes ne sont pas chargées')

  const titre = titreDemarche.titre!

  const titreEtape = titreEtapeId ? await titreEtapeGet(titreEtapeId, {}, user) : undefined

  if (titreEtapeId && !titreEtape) throw new Error("l'étape n'existe pas")

  const demarcheDefinition = demarcheDefinitionFind(titre.typeId, titreDemarche.typeId, titreDemarche.etapes, titreDemarche.id)

  const etapesTypes: EtapeTypeEtapeStatutWithMainStep[] = getPossiblesEtapesTypes(
    demarcheDefinition,
    titre.typeId,
    titreDemarche.typeId,
    titreEtape?.typeId,
    titreEtapeId ?? undefined,
    date,
    titreDemarche.etapes
  )

  return etapesTypes.filter(({ etapeTypeId }) =>
    canCreateEtape(user, etapeTypeId, ETAPE_IS_BROUILLON, titre.titulaireIds ?? [], titre.administrationsLocales ?? [], titreDemarche.typeId, {
      typeId: titre.typeId,
      titreStatutId: titre.titreStatutId ?? TitresStatutIds.Indetermine,
    })
  )
}
