import { GraphQLResolveInfo } from 'graphql'

import { Context, IHeritageContenu, IHeritageProps, ITitreDemarche, ITitreEtape } from '../../../types.js'

import { titreEtapeGet, titreEtapeUpsert } from '../../../database/queries/titres-etapes.js'
import { titreDemarcheGet } from '../../../database/queries/titres-demarches.js'

import { titreEtapeUpdateTask } from '../../../business/titre-etape-update.js'
import { titreEtapeHeritageBuild } from './_titre-etape.js'
import { titreEtapeUpdationValidate } from '../../../business/validations/titre-etape-updation-validate.js'

import { fieldsBuild } from './_fields-build.js'
import { iTitreEtapeToFlattenEtape, titreEtapeFormat } from '../../_format/titres-etapes.js'
import { userSuper } from '../../../database/user-super.js'
import { titreEtapeAdministrationsEmailsSend, titreEtapeUtilisateursEmailsSend } from './_titre-etape-email.js'
import { EtapeTypeId, canBeBrouillon } from 'camino-common/src/static/etapesTypes.js'
import { isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools.js'
import { User } from 'camino-common/src/roles.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { titreEtapeFormatFields } from '../../_format/_fields.js'
import { canCreateEtape, canEditDates, canEditDuree, canEditEtape } from 'camino-common/src/permissions/titres-etapes.js'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import {
  ETAPE_IS_NOT_BROUILLON,
  EtapeAvis,
  EtapeBrouillon,
  EtapeId,
  documentComplementaireAslEtapeDocumentModificationValidator,
  documentComplementaireDaeEtapeDocumentModificationValidator,
  etapeDocumentModificationValidator,
  etapeIdValidator,
  etapeSlugValidator,
  needAslAndDae,
  tempEtapeAvisValidator,
  tempEtapeDocumentValidator,
} from 'camino-common/src/etape.js'
import { checkEntreprisesExist, getEntrepriseDocuments } from '../../rest/entreprises.queries.js'
import { deleteTitreEtapeEntrepriseDocument, insertEtapeAvis, insertEtapeDocuments, insertTitreEtapeEntrepriseDocument, updateEtapeDocuments } from '../../../database/queries/titres-etapes.queries.js'
import { EntrepriseDocument, EntrepriseDocumentId, EntrepriseId } from 'camino-common/src/entreprise.js'
import { Pool } from 'pg'
import { GetGeojsonInformation, convertPoints, getGeojsonInformation } from '../../rest/perimetre.queries.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { SecteursMaritimes, getSecteurMaritime } from 'camino-common/src/static/facades.js'
import { FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre.js'
import { FieldsEtape } from '../../../database/queries/_options'
import { canHaveForages } from 'camino-common/src/permissions/titres.js'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getEtapeByDemarcheIdAndEtapeTypeId } from '../../rest/etapes.queries.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { z } from 'zod'
import { FlattenEtape, GraphqlEtape, GraphqlEtapeCreation, graphqlEtapeCreationValidator, graphqlEtapeModificationValidator } from 'camino-common/src/etape-form.js'
import { KM2 } from 'camino-common/src/number.js'
import { getSections } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { ETAPE_HERITAGE_PROPS } from 'camino-common/src/heritage.js'

// FIXME à supprimer, n'est plus utilisé ?
export const etape = async ({ id }: { id: EtapeId }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    const fields: FieldsEtape = fieldsBuild(info)

    if (isNullOrUndefined(fields.demarche)) {
      fields.demarche = { titre: { pointsEtape: { id: {} } } }
    }
    if (isNullOrUndefined(fields.demarche.titre)) {
      fields.demarche.titre = { pointsEtape: { id: {} } }
    }
    if (isNullOrUndefined(fields.demarche.titre.pointsEtape)) {
      fields.demarche.titre.pointsEtape = { id: {} }
    }

    const titreEtape = await titreEtapeGet(id, { fields, fetchHeritage: true }, user)

    if (isNullOrUndefined(titreEtape)) {
      throw new Error("l'étape n'existe pas")
    }
    if (
      isNullOrUndefined(titreEtape.titulaireIds) ||
      !titreEtape.demarche ||
      !titreEtape.demarche.titre ||
      titreEtape.demarche.titre.administrationsLocales === undefined ||
      !titreEtape.demarche.titre.titreStatutId
    ) {
      throw new Error('la démarche n’est pas chargée complètement')
    }

    // Cette route est utilisée que par l’ancienne interface qui permet d’éditer une étape. Graphql permet de récupérer trop de champs si on ne fait pas ça.
    if (
      !canEditEtape(user, titreEtape.typeId, titreEtape.isBrouillon, titreEtape.titulaireIds ?? [], titreEtape.demarche.titre.administrationsLocales ?? [], titreEtape.demarche.typeId, {
        typeId: titreEtape.demarche.titre.typeId,
        titreStatutId: titreEtape.demarche.titre.titreStatutId,
      })
    )
      throw new Error('droits insuffisants')

    const titreDemarche = await titreDemarcheGet(
      titreEtape.titreDemarcheId,
      {
        fields: {
          id: {},
        },
      },
      user
    )

    if (!titreDemarche) throw new Error("la démarche n'existe pas")

    return titreEtapeFormat(titreEtape)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export const etapeHeritage = async ({ date, titreDemarcheId, typeId, etapeId }: { date: CaminoDate; titreDemarcheId: DemarcheId; typeId: EtapeTypeId; etapeId: EtapeId | null }, { user }: Context) => {
  try {
    let titreDemarche = await titreDemarcheGet(titreDemarcheId, { fields: {} }, user)

    if (!titreDemarche) throw new Error("la démarche n'existe pas")

    titreDemarche = await titreDemarcheGet(
      titreDemarcheId,
      {
        fields: {
          titre: { id: {} },
          etapes: { id: {} },
        },
      },
      userSuper
    )

    const titreEtape = titreEtapeHeritageBuild(date, typeId, titreDemarche!, titreDemarche!.titre!.typeId, titreDemarche!.typeId, etapeId)
    const titreTypeId = titreDemarche?.titre?.typeId
    if (!titreTypeId) {
      throw new Error(`le type du titre de l'étape ${titreEtape.id} n'est pas chargé`)
    }

    return titreEtapeFormat(titreEtape, titreEtapeFormatFields)
  } catch (e) {
    console.error(e)

    throw e
  }
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
    return {
      geojson4326Forages: await convertPoints(pool, geojsonOrigineGeoSystemeId, GEO_SYSTEME_IDS.WGS84, geojsonOrigineForages),
      geojsonOrigineForages,
    }
  }

  return {
    geojson4326Forages: null,
    geojsonOrigineForages: null,
  }
}
type PerimetreInfos = {
  secteursMaritime: SecteursMaritimes[]
  sdomZones: SDOMZoneId[]
  surface: KM2 | null
} & Pick<GraphqlEtape, 'geojson4326Forages' | 'geojsonOrigineForages'> &
  Pick<GetGeojsonInformation, 'communes' | 'forets'>
const getPerimetreInfos = async (
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
    const { communes, sdom, surface, forets, secteurs } = await getGeojsonInformation(pool, geojson4326Perimetre.geometry)
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
  etape: GraphqlEtapeCreation,
  demarche: ITitreDemarche,
  titreTypeId: TitreTypeId,
  pool: Pool
): Promise<{ flattenEtape: FlattenEtape; isBrouillon: EtapeBrouillon; perimetreInfos: PerimetreInfos }> => {
  const isBrouillon = canBeBrouillon(etape.typeId)
  const perimetreInfos = await getPerimetreInfos(
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

  // FIXME on peut mieux faire pour l'id et le slug ?
  return {
    flattenEtape: iTitreEtapeToFlattenEtape({
      ...etape,
      demarche,
      ...perimetreInfos,
      isBrouillon,
      heritageProps,
      heritageContenu,
      id: etapeIdValidator.parse('newId'),
      slug: etapeSlugValidator.parse('unknown'),
    }),
    isBrouillon,
    perimetreInfos,
  }
}

export const etapeCreer = async ({ etape: etapeNotParsed }: { etape: unknown }, context: Context, info: GraphQLResolveInfo) => {
  try {
    const { success, data: etape, error } = graphqlEtapeCreationValidator.safeParse(etapeNotParsed)

    if (!success) {
      console.error('[etapeCreer] étape non correctement formatée', error)
      throw new Error("l'étape n'est pas correctement formatée")
    }
    const user = context.user
    if (!user) {
      throw new Error("la démarche n'existe pas")
    }
    let titreDemarche = await titreDemarcheGet(etape.titreDemarcheId, { fields: {} }, user)

    if (!titreDemarche) throw new Error("la démarche n'existe pas")

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

    if (!titreDemarche || !titreDemarche.titre) throw new Error("le titre n'existe pas")

    const titreTypeId = titreDemarche?.titre?.typeId
    if (!titreTypeId) {
      throw new Error(`le type du titre de la ${titreDemarche.id} n'est pas chargé`)
    }

    const { flattenEtape, isBrouillon, perimetreInfos } = await getFlattenEtape(etape, titreDemarche, titreTypeId, context.pool)
    const entrepriseDocuments: EntrepriseDocument[] = await validateAndGetEntrepriseDocuments(context.pool, flattenEtape, etape.entrepriseDocumentIds, user)

    const etapeDocumentsParsed = z.array(tempEtapeDocumentValidator).safeParse(etape.etapeDocuments)

    if (!etapeDocumentsParsed.success) {
      console.warn(etapeDocumentsParsed.error)
      throw new Error('Les documents envoyés ne sont pas conformes')
    }

    const etapeDocuments = etapeDocumentsParsed.data

    const etapeAvisParsed = z.array(tempEtapeAvisValidator).safeParse(etape.etapeAvis)
    if (!etapeAvisParsed.success) {
      console.warn(etapeAvisParsed.error)
      throw new Error('Les avis envoyés ne sont pas conformes')
    }

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
      throw new Error(rulesErrors.join(', '))
    }
    if (
      !canCreateEtape(user, etape.typeId, isBrouillon, titreDemarche.titre.titulaireIds ?? [], titreDemarche.titre.administrationsLocales ?? [], titreDemarche.typeId, {
        typeId: titreDemarche.titre.typeId,
        titreStatutId: titreDemarche.titre.titreStatutId ?? TitresStatutIds.Indetermine,
      })
    ) {
      throw new Error('droits insuffisants pour créer cette étape')
    }

    if (!(await checkEntreprisesExist(context.pool, [...(etape.titulaireIds ?? []), ...(etape.amodiataireIds ?? [])]))) {
      throw new Error("certaines entreprises n'existent pas")
    }

    if (!canEditDuree(titreTypeId, titreDemarche.typeId)) {
      etape.duree = null
    }

    if (!canEditDates(titreTypeId, titreDemarche.typeId, etape.typeId, user) && (isNotNullNorUndefined(etape.dateDebut) || isNotNullNorUndefined(etape.dateFin))) {
      etape.dateDebut = null
      etape.dateFin = null
    }

    let etapeUpdated: ITitreEtape | undefined = await titreEtapeUpsert({ ...etape, ...perimetreInfos, isBrouillon }, user!, titreDemarche.titreId)
    if (isNullOrUndefined(etapeUpdated)) {
      throw new Error("Une erreur est survenue lors de la création de l'étape")
    }

    await insertEtapeDocuments(context.pool, etapeUpdated.id, etapeDocuments)
    for (const document of entrepriseDocuments) {
      await insertTitreEtapeEntrepriseDocument(context.pool, { titre_etape_id: etapeUpdated.id, entreprise_document_id: document.id })
    }

    await insertEtapeAvis(context.pool, etapeUpdated.id, etapeAvis)

    try {
      await titreEtapeUpdateTask(context.pool, etapeUpdated.id, etapeUpdated.titreDemarcheId, user)
    } catch (e) {
      console.error('une erreur est survenue lors des tâches annexes', e)
    }

    await titreEtapeAdministrationsEmailsSend(etapeUpdated, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre.typeId, user)
    await titreEtapeUtilisateursEmailsSend(etapeUpdated, titreDemarche.titreId)
    const fields = fieldsBuild(info)

    etapeUpdated = await titreEtapeGet(etapeUpdated.id, { fields }, user)

    return titreEtapeFormat(etapeUpdated!)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const validateAndGetEntrepriseDocuments = async (pool: Pool, etape: FlattenEtape, entrepriseDocumentIds: EntrepriseDocumentId[], user: User): Promise<EntrepriseDocument[]> => {
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

export const etapeModifier = async ({ etape: etapeNotParsed }: { etape: unknown }, context: Context, info: GraphQLResolveInfo) => {
  try {
    const { success, data: etape, error } = graphqlEtapeModificationValidator.safeParse(etapeNotParsed)

    if (!success) {
      console.error('[etapeModifier] étape non correctement formatée', error)
      throw new Error("l'étape n'est pas correctement formatée")
    }

    const user = context.user
    if (!user) {
      throw new Error("l'étape n'existe pas")
    }
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
      !canEditEtape(user, titreEtapeOld.typeId, titreEtapeOld.isBrouillon, titreEtapeOld.titulaireIds ?? [], titreEtapeOld.demarche.titre.administrationsLocales ?? [], titreEtapeOld.demarche.typeId, {
        typeId: titreEtapeOld.demarche.titre.typeId,
        titreStatutId: titreEtapeOld.demarche.titre.titreStatutId,
      })
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
    const { flattenEtape, perimetreInfos } = await getFlattenEtape(etape, titreDemarche, titreTypeId, context.pool)
    const entrepriseDocuments: EntrepriseDocument[] = await validateAndGetEntrepriseDocuments(context.pool, flattenEtape, etape.entrepriseDocumentIds, user)
    // delete etape.entrepriseDocumentIds

    const etapeDocumentsParsed = z.array(etapeDocumentModificationValidator).safeParse(etape.etapeDocuments)

    if (!etapeDocumentsParsed.success) {
      console.warn(etapeDocumentsParsed.error)
      throw new Error('Les documents envoyés ne sont pas conformes')
    }

    const etapeDocuments = etapeDocumentsParsed.data
    // delete etape.etapeDocuments

    // FIXME
    const etapeAvis: EtapeAvis[] = []

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
      etapeAvis,
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

    if (!(await checkEntreprisesExist(context.pool, [...(etape.titulaireIds ?? []), ...(etape.amodiataireIds ?? [])]))) {
      throw new Error("certaines entreprises n'existent pas")
    }

    let etapeUpdated: ITitreEtape | undefined = await titreEtapeUpsert({ ...etape, ...perimetreInfos, isBrouillon: titreEtapeOld.isBrouillon }, user!, titreDemarche.titreId)
    if (isNullOrUndefined(etapeUpdated)) {
      throw new Error("Une erreur est survenue lors de la modification de l'étape")
    }
    await updateEtapeDocuments(context.pool, user, etapeUpdated.id, etapeUpdated.isBrouillon, etapeDocuments)
    await deleteTitreEtapeEntrepriseDocument(context.pool, { titre_etape_id: etapeUpdated.id })
    for (const document of entrepriseDocuments) {
      await insertTitreEtapeEntrepriseDocument(context.pool, { titre_etape_id: etapeUpdated.id, entreprise_document_id: document.id })
    }

    if (needToCreateAslAndDae) {
      if (daeDocument !== null) {
        const daeEtapeInDb = await getEtapeByDemarcheIdAndEtapeTypeId(context.pool, 'dae', titreDemarche.id)

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

        await updateEtapeDocuments(context.pool, user, daeEtape.id, titreEtapeOld.isBrouillon, [daeDocument])
      }

      if (aslDocument !== null) {
        const aslEtapeInDb = await getEtapeByDemarcheIdAndEtapeTypeId(context.pool, 'asl', titreDemarche.id)

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
        await updateEtapeDocuments(context.pool, user, aslEtape.id, titreEtapeOld.isBrouillon, [aslDocument])
      }
    }

    await titreEtapeUpdateTask(context.pool, etapeUpdated.id, etapeUpdated.titreDemarcheId, user)

    await titreEtapeAdministrationsEmailsSend(etape, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre.typeId, user, titreEtapeOld)

    const fields = fieldsBuild(info)
    etapeUpdated = await titreEtapeGet(etapeUpdated.id, { fields }, user)

    return titreEtapeFormat(etapeUpdated!)
  } catch (e) {
    console.error(e)

    throw e
  }
}
