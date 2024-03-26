import { GraphQLResolveInfo } from 'graphql'

import { Context, IContenu, IDecisionAnnexeContenu, ITitre, ITitreEtape } from '../../../types.js'

import { titreEtapeCreate, titreEtapeGet, titreEtapeUpdate, titreEtapeUpsert } from '../../../database/queries/titres-etapes.js'
import { titreDemarcheGet } from '../../../database/queries/titres-demarches.js'
import { titreGet } from '../../../database/queries/titres.js'

import titreEtapeUpdateTask from '../../../business/titre-etape-update.js'
import { titreEtapeHeritageBuild } from './_titre-etape.js'
import { titreEtapeUpdationValidate } from '../../../business/validations/titre-etape-updation-validate.js'

import { fieldsBuild } from './_fields-build.js'
import { titreDemarcheUpdatedEtatValidate } from '../../../business/validations/titre-demarche-etat-validate.js'
import { titreEtapeFormat } from '../../_format/titres-etapes.js'
import { userSuper } from '../../../database/user-super.js'
import { contenuElementFilesCreate, contenuElementFilesDelete, sectionsContenuAndFilesGet } from '../../../business/utils/contenu-element-file-process.js'
import { titreEtapeAdministrationsEmailsSend, titreEtapeUtilisateursEmailsSend } from './_titre-etape-email.js'
import { objectClone } from '../../../tools/index.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { EtapeTypeId, isEtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { isNonEmptyArray, isNotNullNorUndefined, isNullOrUndefined, memoize, onlyUnique } from 'camino-common/src/typescript-tools.js'
import { isBureauDEtudes, isEntreprise, User } from 'camino-common/src/roles.js'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date.js'
import { titreEtapeFormatFields } from '../../_format/_fields.js'
import { canCreateEtape, canEditDates, canEditDuree, canEditEtape, isEtapeDeposable } from 'camino-common/src/permissions/titres-etapes.js'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import { getSections, SectionElement } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { EtapeId, etapeDocumentModificationValidator, tempEtapeDocumentValidator } from 'camino-common/src/etape.js'
import { getEntrepriseDocuments } from '../../rest/entreprises.queries.js'
import {
  deleteTitreEtapeEntrepriseDocument,
  getDocumentsByEtapeId,
  getEntrepriseDocumentIdsByEtapeId,
  insertEtapeDocuments,
  insertTitreEtapeEntrepriseDocument,
  updateEtapeDocuments,
} from '../../../database/queries/titres-etapes.queries.js'
import { EntrepriseDocument, EntrepriseId } from 'camino-common/src/entreprise.js'
import { Pool } from 'pg'
import { convertPoints, getGeojsonInformation } from '../../rest/perimetre.queries.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { getSecteurMaritime } from 'camino-common/src/static/facades.js'
import { FeatureCollectionPoints, FeatureMultiPolygon, equalGeojson } from 'camino-common/src/perimetre.js'
import { FieldsEtape } from '../../../database/queries/_options'
import { canHaveForages } from 'camino-common/src/permissions/titres.js'
import { GEO_SYSTEME_IDS } from 'camino-common/src/static/geoSystemes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { z } from 'zod'

const statutIdAndDateGet = (etape: ITitreEtape, user: User, depose = false): { date: CaminoDate; statutId: EtapeStatutId } => {
  const result = { date: etape.date, statutId: etape.statutId }

  if (depose) {
    if (etape.typeId !== 'mfr') {
      throw new Error('seules les demandes peuvent être déposées')
    }

    result.statutId = 'fai'
    if (isEntreprise(user) || isBureauDEtudes(user)) {
      result.date = toCaminoDate(new Date())
    }
  } else if (etape.typeId === 'mfr' && !etape.statutId) {
    result.statutId = 'aco'
  }

  return result
}

const etape = async ({ id }: { id: EtapeId }, { user }: Context, info: GraphQLResolveInfo) => {
  try {
    const fields: FieldsEtape = fieldsBuild(info)

    if (isNullOrUndefined(fields.titulaires)) {
      fields.titulaires = { id: {} }
    }
    if (isNullOrUndefined(fields.amodiataires)) {
      fields.amodiataires = { id: {} }
    }
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
    if (!titreEtape.titulaires || !titreEtape.demarche || !titreEtape.demarche.titre || titreEtape.demarche.titre.administrationsLocales === undefined || !titreEtape.demarche.titre.titreStatutId) {
      throw new Error('la démarche n’est pas chargée complètement')
    }

    // Cette route est utilisée que par l’ancienne interface qui permet d’éditer une étape. Graphql permet de récupérer trop de champs si on ne fait pas ça.
    if (
      !canEditEtape(user, titreEtape.typeId, titreEtape.statutId, titreEtape.titulaires, titreEtape.demarche.titre.administrationsLocales ?? [], titreEtape.demarche.typeId, {
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

const etapeHeritage = async ({ date, titreDemarcheId, typeId }: { date: string; titreDemarcheId: string; typeId: EtapeTypeId }, { user }: Context) => {
  try {
    let titreDemarche = await titreDemarcheGet(titreDemarcheId, { fields: {} }, user)

    if (!titreDemarche) throw new Error("la démarche n'existe pas")

    titreDemarche = await titreDemarcheGet(
      titreDemarcheId,
      {
        fields: {
          titre: { id: {} },
          etapes: {
            titulaires: { id: {} },
            amodiataires: { id: {} },
          },
        },
      },
      userSuper
    )

    const titreEtape = titreEtapeHeritageBuild(date, typeId, titreDemarche!, titreDemarche!.titre!.typeId, titreDemarche!.typeId)
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
  geojsonOrigineGeoSystemeId: ITitreEtape['geojsonOrigineGeoSystemeId'],
  geojsonOrigineForages: ITitreEtape['geojsonOrigineForages'],
  pool: Pool
): Promise<Pick<ITitreEtape, 'geojson4326Forages' | 'geojsonOrigineForages'>> => {
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

const etapeCreer = async ({ etape }: { etape: ITitreEtape & { etapeDocuments: unknown } }, context: Context, info: GraphQLResolveInfo) => {
  try {
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
          },
          etapes: { id: {} },
        },
      },
      userSuper
    )

    if (!titreDemarche || !titreDemarche.titre) throw new Error("le titre n'existe pas")

    const { statutId, date } = statutIdAndDateGet(etape, user!)
    etape.statutId = statutId
    etape.date = date

    const entrepriseDocuments: EntrepriseDocument[] = await validateAndGetEntrepriseDocuments(context.pool, etape, titreDemarche.titre, user)
    delete etape.entrepriseDocumentIds

    const etapeDocumentsParsed = z.array(tempEtapeDocumentValidator).safeParse(etape.etapeDocuments)

    if (!etapeDocumentsParsed.success) {
      console.warn(etapeDocumentsParsed.error)
      throw new Error('Les documents envoyés ne sont pas conformes')
    }

    const etapeDocuments = etapeDocumentsParsed.data
    delete etape.etapeDocuments

    const sdomZones: SDOMZoneId[] = []
    if (isNotNullNorUndefined(etape.geojson4326Perimetre)) {
      if (isNotNullNorUndefined(etape.geojsonOriginePerimetre) && isNotNullNorUndefined(etape.geojsonOriginePoints)) {
        if (!arePointsOnPerimeter(etape.geojsonOriginePerimetre, etape.geojsonOriginePoints)) {
          throw new Error(`les points doivent être sur le périmètre`)
        }
      }
      const { communes, sdom, surface, forets, secteurs } = await getGeojsonInformation(context.pool, etape.geojson4326Perimetre.geometry)
      etape.surface = surface

      etape.communes = communes
      etape.forets = forets
      etape.secteursMaritime = secteurs.map(id => getSecteurMaritime(id))
      etape.sdomZones = sdom

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

    etape = { ...etape, ...(await getForagesProperties(titreTypeId, etape.geojsonOrigineGeoSystemeId, etape.geojsonOrigineForages, context.pool)) }

    const rulesErrors = titreEtapeUpdationValidate(etape, titreDemarche, titreDemarche.titre, etapeDocuments, entrepriseDocuments, sdomZones, user)
    if (rulesErrors.length) {
      throw new Error(rulesErrors.join(', '))
    }
    if (
      !canCreateEtape(user, etape.typeId, etape.statutId, titreDemarche.titre.titulaires ?? [], titreDemarche.titre.administrationsLocales ?? [], titreDemarche.typeId, {
        typeId: titreDemarche.titre.typeId,
        titreStatutId: titreDemarche.titre.titreStatutId ?? TitresStatutIds.Indetermine,
      })
    ) {
      throw new Error('droits insuffisants pour créer cette étape')
    }

    const sections = getSections(titreTypeId, titreDemarche.typeId, etape.typeId)

    const { contenu, newFiles } = sectionsContenuAndFilesGet(etape.contenu, sections)
    etape.contenu = contenu

    if (!canEditDuree(titreTypeId, titreDemarche.typeId)) {
      etape.duree = null
    }

    if (!canEditDates(titreTypeId, titreDemarche.typeId, etape.typeId, user) && (isNotNullNorUndefined(etape.dateDebut) || isNotNullNorUndefined(etape.dateFin))) {
      etape.dateDebut = null
      etape.dateFin = null
    }

    let etapeUpdated: ITitreEtape = await titreEtapeUpsert(etape, user!, titreDemarche.titreId)

    await insertEtapeDocuments(context.pool, etapeUpdated.id, etapeDocuments)
    for (const document of entrepriseDocuments) {
      await insertTitreEtapeEntrepriseDocument(context.pool, { titre_etape_id: etapeUpdated.id, entreprise_document_id: document.id })
    }

    await contenuElementFilesCreate(newFiles, 'demarches', etapeUpdated.id)

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
  etape: Pick<ITitreEtape, 'heritageProps' | 'titulaires' | 'amodiataires' | 'entrepriseDocumentIds'>,
  titre: Pick<ITitre, 'titulaires' | 'amodiataires'>,
  user: User
): Promise<EntrepriseDocument[]> => {
  const entrepriseDocuments: EntrepriseDocument[] = []

  // si l’héritage est désactivé => on récupère les titulaires sur l’étape
  // sinon on les trouve sur le titre
  const titulaires = !(etape.heritageProps?.titulaires.actif ?? false) ? etape.titulaires : titre.titulaires
  const amodiataires = !(etape.heritageProps?.amodiataires.actif ?? false) ? etape.amodiataires : titre.amodiataires
  if (etape.entrepriseDocumentIds && isNonEmptyArray(etape.entrepriseDocumentIds)) {
    let entrepriseIds: EntrepriseId[] = []
    if (titulaires) {
      entrepriseIds.push(...titulaires.map(({ id }) => id))
    }
    if (amodiataires) {
      entrepriseIds.push(...amodiataires.map(({ id }) => id))
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

const etapeModifier = async ({ etape }: { etape: ITitreEtape & { etapeDocuments: unknown } }, context: Context, info: GraphQLResolveInfo) => {
  try {
    const user = context.user
    if (!user) {
      throw new Error("l'étape n'existe pas")
    }

    const titreEtapeOld = await titreEtapeGet(
      etape.id,
      {
        fields: {
          titulaires: { id: {} },
          amodiataires: { id: {} },
          demarche: { titre: { pointsEtape: { id: {} } } },
        },
      },
      user
    )

    if (isNullOrUndefined(titreEtapeOld)) throw new Error("l'étape n'existe pas")
    if (!titreEtapeOld.titulaires) {
      throw new Error('Les titulaires de l’étape ne sont pas chargés')
    }
    if (!titreEtapeOld.demarche || !titreEtapeOld.demarche.titre || titreEtapeOld.demarche.titre.administrationsLocales === undefined || !titreEtapeOld.demarche.titre.titreStatutId) {
      throw new Error('la démarche n’est pas chargée complètement')
    }

    if (
      !canEditEtape(user, titreEtapeOld.typeId, titreEtapeOld.statutId, titreEtapeOld.titulaires, titreEtapeOld.demarche.titre.administrationsLocales ?? [], titreEtapeOld.demarche.typeId, {
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
            titulaires: { id: {} },
            amodiataires: { id: {} },
          },
          etapes: { id: {} },
        },
      },
      userSuper
    )

    if (!titreDemarche || !titreDemarche.titre) throw new Error("le titre n'existe pas")

    const { statutId, date } = statutIdAndDateGet(etape, user!)
    etape.statutId = statutId
    etape.date = date

    const entrepriseDocuments: EntrepriseDocument[] = await validateAndGetEntrepriseDocuments(context.pool, etape, titreDemarche.titre, user)
    delete etape.entrepriseDocumentIds

    const etapeDocumentsParsed = z.array(etapeDocumentModificationValidator).safeParse(etape.etapeDocuments)

    if (!etapeDocumentsParsed.success) {
      console.warn(etapeDocumentsParsed.error)
      throw new Error('Les documents envoyés ne sont pas conformes')
    }

    const etapeDocuments = etapeDocumentsParsed.data
    delete etape.etapeDocuments
    const sdomZones: SDOMZoneId[] = []
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

    etape = { ...etape, ...(await getForagesProperties(titreTypeId, etape.geojsonOrigineGeoSystemeId, etape.geojsonOrigineForages, context.pool)) }

    const rulesErrors = titreEtapeUpdationValidate(etape, titreDemarche, titreDemarche.titre, etapeDocuments, entrepriseDocuments, sdomZones, user, titreEtapeOld)

    if (rulesErrors.length) {
      throw new Error(rulesErrors.join(', '))
    }

    const sections = getSections(titreTypeId, titreDemarche.typeId, etape.typeId)

    const { contenu, newFiles } = sectionsContenuAndFilesGet(etape.contenu, sections)
    etape.contenu = contenu

    if (titreEtapeOld.decisionsAnnexesSections) {
      const { contenu: decisionsAnnexesContenu, newFiles: decisionsAnnexesNewFiles } = sectionsContenuAndFilesGet(etape.decisionsAnnexesContenu, titreEtapeOld.decisionsAnnexesSections)
      etape.decisionsAnnexesContenu = decisionsAnnexesContenu as IDecisionAnnexeContenu
      await contenuElementFilesCreate(decisionsAnnexesNewFiles, 'demarches', etape.id)
    }

    if (!canEditDuree(titreTypeId, titreDemarche.typeId)) {
      etape.duree = titreEtapeOld.duree
    }

    if (!canEditDates(titreTypeId, titreDemarche.typeId, etape.typeId, user)) {
      etape.dateDebut = titreEtapeOld.dateDebut
      etape.dateFin = titreEtapeOld.dateFin
    }

    let etapeUpdated: ITitreEtape = await titreEtapeUpsert(etape, user!, titreDemarche.titreId)

    await updateEtapeDocuments(context.pool, user, etapeUpdated.id, etapeUpdated.statutId, etapeDocuments)
    await deleteTitreEtapeEntrepriseDocument(context.pool, { titre_etape_id: etapeUpdated.id })
    for (const document of entrepriseDocuments) {
      await insertTitreEtapeEntrepriseDocument(context.pool, { titre_etape_id: etapeUpdated.id, entreprise_document_id: document.id })
    }

    await contenuElementFilesCreate(newFiles, 'demarches', etapeUpdated.id)

    // après le recalcule de l’héritage, on recharge toutes les étapes de la démarche pour pouvoir récuperer
    // tous les fichiers tjrs présents dans le contenu de chaque étape
    const demarche = await titreDemarcheGet(etapeUpdated.titreDemarcheId, { fields: { etapes: { id: {} } } }, userSuper)
    await contenuElementFilesDelete('demarches', etapeUpdated.id, sections, etape => etape.contenu, demarche!.etapes, titreEtapeOld.contenu)

    if (titreEtapeOld.decisionsAnnexesSections) {
      await contenuElementFilesDelete(
        'demarches',
        etapeUpdated.id,
        titreEtapeOld.decisionsAnnexesSections,
        etape => etape.decisionsAnnexesContenu,
        demarche!.etapes,
        titreEtapeOld.decisionsAnnexesContenu
      )
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

const etapeDeposer = async ({ id }: { id: EtapeId }, { user, pool }: Context) => {
  try {
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
          titre: { pointsEtape: { id: {} }, titulaires: { id: {} }, amodiataires: { id: {} } },
        },
      },
      userSuper
    )

    if (!titreDemarche) throw new Error("la démarche n'existe pas")

    const titre = titreDemarche.titre
    if (isNullOrUndefined(titre)) throw new Error("le titre n'est pas chargé")
    if (isNullOrUndefined(titre.administrationsLocales)) throw new Error('les administrations locales du titre ne sont pas chargées')

    if (isNullOrUndefined(titre.titulaires)) throw new Error('les titulaires du titre ne sont pas chargés')
    if (isNullOrUndefined(titre.amodiataires)) throw new Error('les amodiataires du titre ne sont pas chargés')

    const sdomZones: SDOMZoneId[] = []
    if (isNotNullNorUndefined(titreEtape.geojson4326Perimetre)) {
      const { sdom } = await getGeojsonInformation(pool, titreEtape.geojson4326Perimetre.geometry)

      sdomZones.push(...sdom)
    }
    const titreTypeId = memoize(() => Promise.resolve(titre.typeId))
    const administrationsLocales = memoize(() => Promise.resolve(titre.administrationsLocales ?? []))
    const entreprisesTitulairesOuAmodiataires = memoize(() => {
      return Promise.resolve([...(titre.titulaires ?? []).map(({ id }) => id), ...(titre.amodiataires ?? []).map(({ id }) => id)])
    })
    const etapeDocuments = await getDocumentsByEtapeId(id, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, titreEtape.typeId, {
      demarche_type_id: titreDemarche.typeId,
      entreprises_lecture: titreDemarche.entreprisesLecture ?? false,
      public_lecture: titreDemarche.publicLecture ?? false,
      titre_public_lecture: titre.publicLecture ?? false,
    })

    const entrepriseDocuments = await getEntrepriseDocumentIdsByEtapeId({ titre_etape_id: titreEtape.id }, pool, userSuper)
    // TODO 2023-06-14 TS 5.1 n’arrive pas réduire le type de titre
    const deposable = isEtapeDeposable(
      user,
      { ...titre, titulaires: titre.titulaires ?? [], administrationsLocales: titre.administrationsLocales ?? [] },
      titreDemarche.typeId,
      titreEtape,
      etapeDocuments,
      entrepriseDocuments,
      sdomZones
    )
    if (!deposable) throw new Error('droits insuffisants')

    const statutIdAndDate = statutIdAndDateGet(titreEtape, user, true)

    let decisionsAnnexesContenu: IDecisionAnnexeContenu | null = null
    if (titreEtape.decisionsAnnexesSections && titreEtape.decisionsAnnexesContenu) {
      decisionsAnnexesContenu = titreEtape.decisionsAnnexesContenu
    }

    await titreEtapeUpdate(
      titreEtape.id,
      {
        ...statutIdAndDate,
        decisionsAnnexesSections: null,
        decisionsAnnexesContenu: null,
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

    // Si il y a des décisions annexes, il faut générer une étape par décision
    if (decisionsAnnexesContenu) {
      for (const etapeTypeId of Object.keys(decisionsAnnexesContenu!)) {
        if (!isEtapeTypeId(etapeTypeId)) {
          throw new Error(`l'étapeTypeId ${etapeTypeId} n'existe pas`)
        }
        const decisionAnnexesElements =
          titreEtape.decisionsAnnexesSections
            ?.filter(({ id }) => id === etapeTypeId)
            .flatMap(({ elements }) => elements)
            ?.filter(isNotNullNorUndefined) ?? []

        const decisionContenu = decisionsAnnexesContenu![etapeTypeId]
        let etapeDecisionAnnexe: Partial<ITitreEtape> = {
          typeId: etapeTypeId,
          titreDemarcheId: titreDemarche.id,
          date: toCaminoDate(decisionContenu.date),
          statutId: decisionContenu.statutId,
        }

        const contenu =
          decisionAnnexesElements.filter((element): element is Required<SectionElement & { sectionId: string }> => element.type !== 'file' && isNotNullNorUndefined(element.sectionId)) ?? []

        if (isNotNullNorUndefined(contenu)) {
          etapeDecisionAnnexe.contenu = contenu.reduce<IContenu>((acc, e) => {
            if (isNullOrUndefined(acc[e.sectionId])) {
              acc[e.sectionId] = {}
            }
            acc[e.sectionId][e.id] = decisionContenu[e.id]

            return acc
          }, {})
        }

        etapeDecisionAnnexe = await titreEtapeCreate(etapeDecisionAnnexe as ITitreEtape, userSuper, titreDemarche.titreId)

        const documentTypeIds = decisionAnnexesElements.filter(({ type }) => type === 'file').map(({ id }) => id) ?? []
        for (const _documentTypeId of documentTypeIds) {
          // FIXME
          // const fileName = decisionContenu[documentTypeId]
          // if (isDocumentTypeId(documentTypeId)) {
          //   const id = newDocumentId(decisionContenu.date, documentTypeId)
          // const document: IDocument = {
          //   id,
          //   typeId: documentTypeId,
          //   date: decisionContenu.date,
          //   fichier: true,
          //   entreprisesLecture: true,
          //   titreEtapeId: etapeDecisionAnnexe.id,
          //   fichierTypeId: 'pdf',
          // }
          // const filePath = `${contenuFilesPathGet('demarches', titreEtape.id)}/${fileName}`
          // const newDocumentPath = documentFilePathFind(document, true)
          // await fileRename(filePath, newDocumentPath)
          // await documentCreate(document)
          // }
        }
      }
    }

    await titreEtapeUpdateTask(pool, etapeUpdated.id, etapeUpdated.titreDemarcheId, user)

    await titreEtapeAdministrationsEmailsSend(etapeUpdated, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre!.typeId, user!, titreEtapeOld)

    const titreUpdated = await titreGet(titreDemarche.titreId, { fields: { id: {} } }, user)

    return { slug: titreUpdated?.slug }
  } catch (e) {
    console.error(e)

    throw e
  }
}

const etapeSupprimer = async ({ id }: { id: EtapeId }, { user, pool }: Context) => {
  try {
    if (!user) {
      throw new Error("l'étape n'existe pas")
    }

    const titreEtape = await titreEtapeGet(
      id,
      {
        fields: {
          titulaires: { id: {} },
          demarche: { titre: { pointsEtape: { id: {} } } },
        },
      },
      user
    )

    if (isNullOrUndefined(titreEtape)) throw new Error("l'étape n'existe pas")
    if (!titreEtape.titulaires) {
      throw new Error('Les titulaires de l’étape ne sont pas chargés')
    }
    if (!titreEtape.demarche || !titreEtape.demarche.titre || titreEtape.demarche.titre.administrationsLocales === undefined || !titreEtape.demarche.titre.titreStatutId) {
      throw new Error('la démarche n’est pas chargée complètement')
    }

    if (
      !canEditEtape(user, titreEtape.typeId, titreEtape.statutId, titreEtape.titulaires, titreEtape.demarche.titre.administrationsLocales ?? [], titreEtape.demarche.typeId, {
        typeId: titreEtape.demarche.titre.typeId,
        titreStatutId: titreEtape.demarche.titre.titreStatutId,
      })
    )
      throw new Error('droits insuffisants')

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
    await titreEtapeUpdate(id, { archive: true }, user, titreDemarche.titreId)

    await titreEtapeUpdateTask(pool, null, titreEtape.titreDemarcheId, user)

    const titreUpdated = await titreGet(titreDemarche.titreId, { fields: { id: {} } }, user)

    return { slug: titreUpdated?.slug }
  } catch (e) {
    console.error(e)

    throw e
  }
}

export { etape, etapeHeritage, etapeCreer, etapeModifier, etapeSupprimer, etapeDeposer }
