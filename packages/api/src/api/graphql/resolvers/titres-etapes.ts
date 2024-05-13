import { GraphQLResolveInfo } from 'graphql'

import { Context, ITitre, ITitreEtape } from '../../../types.js'

import { titreEtapeGet, titreEtapeUpsert } from '../../../database/queries/titres-etapes.js'
import { titreDemarcheGet } from '../../../database/queries/titres-demarches.js'

import { titreEtapeUpdateTask } from '../../../business/titre-etape-update.js'
import { titreEtapeHeritageBuild } from './_titre-etape.js'
import { titreEtapeUpdationValidate } from '../../../business/validations/titre-etape-updation-validate.js'

import { fieldsBuild } from './_fields-build.js'
import { titreEtapeFormat } from '../../_format/titres-etapes.js'
import { userSuper } from '../../../database/user-super.js'
import { titreEtapeAdministrationsEmailsSend, titreEtapeUtilisateursEmailsSend } from './_titre-etape-email.js'
import { EtapeTypeId, canBeBrouillon } from 'camino-common/src/static/etapesTypes.js'
import { isNonEmptyArray, isNotNullNorUndefined, isNullOrUndefined, onlyUnique } from 'camino-common/src/typescript-tools.js'
import { User } from 'camino-common/src/roles.js'
import { CaminoDate } from 'camino-common/src/date.js'
import { titreEtapeFormatFields } from '../../_format/_fields.js'
import { canCreateEtape, canEditDates, canEditDuree, canEditEtape } from 'camino-common/src/permissions/titres-etapes.js'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import {
    EtapeAvis,
    EtapeId,
    documentComplementaireAslEtapeDocumentModificationValidator,
    documentComplementaireDaeEtapeDocumentModificationValidator,
    etapeDocumentModificationValidator,
    needAslAndDae,
    tempEtapeDocumentValidator,
} from 'camino-common/src/etape.js'
import { checkEntreprisesExist, getEntrepriseDocuments } from '../../rest/entreprises.queries.js'
import { deleteTitreEtapeEntrepriseDocument, insertEtapeDocuments, insertTitreEtapeEntrepriseDocument, updateEtapeDocuments } from '../../../database/queries/titres-etapes.queries.js'
import { EntrepriseDocument, EntrepriseId } from 'camino-common/src/entreprise.js'
import { Pool } from 'pg'
import { GetGeojsonInformation, convertPoints, getGeojsonInformation } from '../../rest/perimetre.queries.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { SecteursMaritimesIds, getSecteurMaritime } from 'camino-common/src/static/facades.js'
import { FeatureCollectionPoints, FeatureMultiPolygon, equalGeojson } from 'camino-common/src/perimetre.js'
import { FieldsEtape } from '../../../database/queries/_options'
import { canHaveForages } from 'camino-common/src/permissions/titres.js'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { getEtapeByDemarcheIdAndEtapeTypeId } from '../../rest/etapes.queries.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { z } from 'zod'
import { CommuneId } from 'camino-common/src/static/communes.js'
import { GraphqlEtape, graphqlEtapeCreationValidator } from 'camino-common/src/etape-form.js'
import { KM2 } from 'camino-common/src/number.js'

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
type TotoType = {
  secteursMaritime: SecteursMaritimesIds[]
  sdomZones: SDOMZoneId[]
  surface: KM2 | null
} & Pick<GraphqlEtape, 'geojson4326Forages' | 'geojsonOrigineForages'> &
  Pick<GetGeojsonInformation, 'communes' | 'forets'>
const otot = async (
  pool: Pool,
  geojson4326Perimetre: GraphqlEtape['geojson4326Perimetre'],
  geojsonOriginePerimetre: GraphqlEtape['geojsonOriginePerimetre'],
  geojsonOriginePoints: GraphqlEtape['geojsonOriginePoints'],
  titreTypeId: TitreTypeId,
  geojsonOrigineGeoSystemeId: GraphqlEtape['geojsonOrigineGeoSystemeId'],
  geojsonOrigineForages: GraphqlEtape['geojsonOrigineForages']
): Promise<TotoType> => {
  if (isNotNullNorUndefined(geojson4326Perimetre)) {
    if (isNotNullNorUndefined(geojsonOriginePerimetre) && isNotNullNorUndefined(geojsonOriginePoints)) {
      if (!arePointsOnPerimeter(geojsonOriginePerimetre, geojsonOriginePoints)) {
        throw new Error(`les points doivent être sur le périmètre`)
      }
    }
    const { communes, sdom, surface, forets, secteurs } = await getGeojsonInformation(pool, geojson4326Perimetre.geometry)
    const { geojson4326Forages } = await getForagesProperties(titreTypeId, geojsonOrigineGeoSystemeId, geojsonOrigineForages, pool)
    return {
      surface: surface,
      communes: communes,
      forets: forets,
      secteursMaritime: secteurs,
      sdomZones: sdom,
      geojson4326Forages,
      geojsonOrigineForages,
    }

    // communeIds.push(...communes.map(({ id }) => id))
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

export const etapeCreer = async ({ etape: etapeNotParsed }: { etape: unknown }, context: Context, info: GraphQLResolveInfo) => {
  try {
    const user = context.user
    if (!user) {
      throw new Error("la démarche n'existe pas")
    }

    const etape = graphqlEtapeCreationValidator.parse(etapeNotParsed)
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

    const entrepriseDocuments: EntrepriseDocument[] = await validateAndGetEntrepriseDocuments(context.pool, etape, titreDemarche.titre, user)

    const etapeDocumentsParsed = z.array(tempEtapeDocumentValidator).safeParse(etape.etapeDocuments)

    if (!etapeDocumentsParsed.success) {
      console.warn(etapeDocumentsParsed.error)
      throw new Error('Les documents envoyés ne sont pas conformes')
    }

    const etapeDocuments = etapeDocumentsParsed.data

    // FIXME
    const avisDocuments: EtapeAvis[] = []

    const isBrouillon = canBeBrouillon(etape.typeId)
    const plop = await otot(context.pool, etape.geojson4326Perimetre, etape.geojsonOriginePerimetre, etape.geojsonOriginePoints, titreTypeId, etape.geojsonOrigineGeoSystemeId, etape.geojsonOrigineForages)
    const titreEtapeHeritage = titreEtapeHeritageBuild(etape.date, etape.typeId, titreDemarche, titreTypeId, titreDemarche.typeId, null)
    const rulesErrors = titreEtapeUpdationValidate({...etape, ...plop, isBrouillon}, titreEtapeHeritage, titreDemarche, titreDemarche.titre, etapeDocuments, avisDocuments, entrepriseDocuments, plop.sdomZones, plop.communes.map(({id}) => id), user, null, null)
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

    let etapeUpdated: ITitreEtape | undefined = await titreEtapeUpsert({...etape, ...plop, isBrouillon}, user!, titreDemarche.titreId)
    if (isNullOrUndefined(etapeUpdated)) {
      throw new Error("Une erreur est survenue lors de la création de l'étape")
    }

    await insertEtapeDocuments(context.pool, etapeUpdated.id, etapeDocuments)
    for (const document of entrepriseDocuments) {
      await insertTitreEtapeEntrepriseDocument(context.pool, { titre_etape_id: etapeUpdated.id, entreprise_document_id: document.id })
    }

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

const validateAndGetEntrepriseDocuments = async (
  pool: Pool,
  etape: Pick<ITitreEtape, 'heritageProps' | 'titulaireIds' | 'amodiataireIds' | 'entrepriseDocumentIds'>,
  titre: Pick<ITitre, 'titulaireIds' | 'amodiataireIds'>,
  user: User
): Promise<EntrepriseDocument[]> => {
  const entrepriseDocuments: EntrepriseDocument[] = []

  // si l’héritage est désactivé => on récupère les titulaires sur l’étape
  // sinon on les trouve sur le titre
  const titulaires = !(etape.heritageProps?.titulaires.actif ?? false) ? etape.titulaireIds : titre.titulaireIds
  const amodiataires = !(etape.heritageProps?.amodiataires.actif ?? false) ? etape.amodiataireIds : titre.amodiataireIds
  if (etape.entrepriseDocumentIds && isNonEmptyArray(etape.entrepriseDocumentIds)) {
    let entrepriseIds: EntrepriseId[] = []
    if (titulaires) {
      entrepriseIds.push(...titulaires)
    }
    if (amodiataires) {
      entrepriseIds.push(...amodiataires)
    }
    entrepriseIds = entrepriseIds.filter(onlyUnique)

    if (isNonEmptyArray(entrepriseIds)) {
      entrepriseDocuments.push(...(await getEntrepriseDocuments(etape.entrepriseDocumentIds, entrepriseIds, pool, user)))
    }

    if (etape.entrepriseDocumentIds.length !== entrepriseDocuments.length) {
      throw new Error("document d'entreprise incorrects")
    }
  }

  return entrepriseDocuments
}

export const etapeModifier = async (
  { etape }: { etape: Omit<ITitreEtape, 'isBrouillon'> & { etapeDocuments: unknown; daeDocument: unknown; aslDocument: unknown } },
  context: Context,
  info: GraphQLResolveInfo
) => {
  try {
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

    const entrepriseDocuments: EntrepriseDocument[] = await validateAndGetEntrepriseDocuments(context.pool, etape, titreDemarche.titre, user)
    delete etape.entrepriseDocumentIds

    const etapeDocumentsParsed = z.array(etapeDocumentModificationValidator).safeParse(etape.etapeDocuments)

    if (!etapeDocumentsParsed.success) {
      console.warn(etapeDocumentsParsed.error)
      throw new Error('Les documents envoyés ne sont pas conformes')
    }

    const etapeDocuments = etapeDocumentsParsed.data
    delete etape.etapeDocuments

    // FIXME
    const avisDocuments: EtapeAvis[] = []

    const needToCreateAslAndDae = needAslAndDae({ etapeTypeId: etape.typeId, demarcheTypeId: titreDemarche.typeId, titreTypeId: titreDemarche.titre.typeId }, etape.statutId, user)
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

    const sdomZones: SDOMZoneId[] = []
    const communeIds: CommuneId[] = []
    if (isNotNullNorUndefined(etape.geojson4326Perimetre)) {
      if (isNotNullNorUndefined(etape.geojsonOriginePerimetre) && isNotNullNorUndefined(etape.geojsonOriginePoints)) {
        if (!arePointsOnPerimeter(etape.geojsonOriginePerimetre, etape.geojsonOriginePoints)) {
          throw new Error(`les points doivent être sur le périmètre`)
        }
      }

      const { communes, sdom, surface, forets, secteurs } = await getGeojsonInformation(context.pool, etape.geojson4326Perimetre.geometry)

      if (!equalGeojson(etape.geojson4326Perimetre.geometry, titreEtapeOld.geojson4326Perimetre?.geometry)) {
        etape.surface = surface
      } else {
        etape.surface = titreEtapeOld.surface
      }

      etape.communes = communes
      etape.forets = forets
      etape.secteursMaritime = secteurs.map(id => getSecteurMaritime(id))
      etape.sdomZones = sdom

      communeIds.push(...communes.map(({ id }) => id))
      sdomZones.push(...sdom)
    } else {
      etape.communes = []
      etape.forets = []
      etape.secteursMaritime = []
      etape.sdomZones = []
      etape.surface = null
    }

    const titreTypeId = titreDemarche?.titre?.typeId
    if (!titreTypeId) {
      throw new Error(`le type du titre de la ${titreDemarche.id} n'est pas chargé`)
    }
    const etapeToSave: ITitreEtape = {
      ...etape,
      isBrouillon: titreEtapeOld.isBrouillon,
      ...(await getForagesProperties(titreTypeId, etape.geojsonOrigineGeoSystemeId, etape.geojsonOrigineForages, context.pool)),
    }

    const rulesErrors = titreEtapeUpdationValidate(
      etapeToSave,
      titreDemarche,
      titreDemarche.titre,
      etapeDocuments,
      avisDocuments,
      entrepriseDocuments,
      sdomZones,
      communeIds,
      user,
      daeDocument,
      aslDocument,
      titreEtapeOld
    )

    if (rulesErrors.length) {
      throw new Error(rulesErrors.join(', '))
    }

    if (!canEditDuree(titreTypeId, titreDemarche.typeId)) {
      etape.duree = titreEtapeOld.duree
    }

    if (!canEditDates(titreTypeId, titreDemarche.typeId, etape.typeId, user)) {
      etape.dateDebut = titreEtapeOld.dateDebut
      etape.dateFin = titreEtapeOld.dateFin
    }

    if (!(await checkEntreprisesExist(context.pool, [...(etape.titulaireIds ?? []), ...(etape.amodiataireIds ?? [])]))) {
      throw new Error("certaines entreprises n'existent pas")
    }

    let etapeUpdated: ITitreEtape | undefined = await titreEtapeUpsert(etapeToSave, user!, titreDemarche.titreId)
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
            isBrouillon: false,
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
            isBrouillon: false,
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

    await titreEtapeAdministrationsEmailsSend(etapeToSave, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre.typeId, user, titreEtapeOld)

    const fields = fieldsBuild(info)
    etapeUpdated = await titreEtapeGet(etapeUpdated.id, { fields }, user)

    return titreEtapeFormat(etapeUpdated!)
  } catch (e) {
    console.error(e)

    throw e
  }
}
