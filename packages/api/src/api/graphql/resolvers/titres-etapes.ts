import { GraphQLResolveInfo } from 'graphql'

import { Context, IContenu, IDecisionAnnexeContenu, IDocument, IEtapeType, ITitreEtape, ITitrePoint } from '../../../types.js'

import { titreFormat } from '../../_format/titres.js'

import { titreEtapeCreate, titreEtapeGet, titreEtapeUpdate, titreEtapeUpsert } from '../../../database/queries/titres-etapes.js'
import { titreDemarcheGet } from '../../../database/queries/titres-demarches.js'
import { titreGet } from '../../../database/queries/titres.js'

import titreEtapeUpdateTask from '../../../business/titre-etape-update.js'
import { titreEtapeHeritageBuild, titreEtapePointsCalc, titreEtapeSdomZonesGet } from './_titre-etape.js'
import { titreEtapeUpdationValidate } from '../../../business/validations/titre-etape-updation-validate.js'

import { fieldsBuild } from './_fields-build.js'
import { titreDemarcheUpdatedEtatValidate } from '../../../business/validations/titre-demarche-etat-validate.js'
import { titreEtapeFormat } from '../../_format/titres-etapes.js'
import { etapeTypeGet, titreTypeDemarcheTypeEtapeTypeGet } from '../../../database/queries/metas.js'
import { userSuper } from '../../../database/user-super.js'
import { documentsLier } from './documents.js'
import { documentsTypesFormat } from '../../_format/etapes-types.js'
import { contenuElementFilesCreate, contenuElementFilesDelete, contenuFilesPathGet, sectionsContenuAndFilesGet } from '../../../business/utils/contenu-element-file-process.js'
import { documentCreate, documentsGet } from '../../../database/queries/documents.js'
import { titreEtapeAdministrationsEmailsSend, titreEtapeUtilisateursEmailsSend } from './_titre-etape-email.js'
import { objectClone } from '../../../tools/index.js'
import { geojsonFeatureMultiPolygon } from '../../../tools/geojson.js'
import { newDocumentId } from '../../../database/models/_format/id-create.js'
import fileRename from '../../../tools/file-rename.js'
import { documentFilePathFind } from '../../../tools/documents/document-path-find.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { isEtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { Feature } from 'geojson'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
import { getDocuments } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/documents.js'
import { isBureauDEtudes, isEntreprise, User } from 'camino-common/src/roles.js'
import { CaminoDate, getCurrent, toCaminoDate } from 'camino-common/src/date.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { titreEtapeFormatFields } from '../../_format/_fields.js'
import { canCreateOrEditEtape } from 'camino-common/src/permissions/titres-etapes.js'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { getSections, SectionsElement } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { isDocumentTypeId } from 'camino-common/src/static/documentsTypes.js'
import { EtapeId } from 'camino-common/src/etape.js'

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
    const fields = fieldsBuild(info)

    if (!fields.type) {
      fields.type = { id: {} }
    }

    const titreEtape = await titreEtapeGet(id, { fields, fetchHeritage: true }, user)

    if (!titreEtape) {
      throw new Error("l'étape n'existe pas")
    }

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

const etapeHeritage = async ({ date, titreDemarcheId, typeId }: { date: string; titreDemarcheId: string; typeId: string }, { user }: Context) => {
  try {
    let titreDemarche = await titreDemarcheGet(titreDemarcheId, { fields: {} }, user)

    if (!titreDemarche) throw new Error("la démarche n'existe pas")

    titreDemarche = await titreDemarcheGet(
      titreDemarcheId,
      {
        fields: {
          titre: { id: {} },
          etapes: {
            type: { id: {} },
            titulaires: { id: {} },
            amodiataires: { id: {} },
            points: { references: { id: {} } },
          },
        },
      },
      userSuper
    )

    const etapeType = await etapeTypeGet(typeId, {
      fields: { justificatifsTypes: { id: {} } },
    })

    const { justificatifsTypes } = await specifiquesGet(titreDemarche!.titre!.typeId, titreDemarche!.typeId, etapeType!)

    const titreEtape = titreEtapeHeritageBuild(date, etapeType!, titreDemarche!, justificatifsTypes, titreDemarche!.titre!.typeId, titreDemarche!.typeId)
    const titreTypeId = titreDemarche?.titre?.typeId
    if (!titreTypeId) {
      throw new Error(`le type du titre de l'étape ${titreEtape.id} n'est pas chargé`)
    }

    return titreEtapeFormat(titreEtape, titreEtapeFormatFields, {
      titreTypeId,
      demarcheTypeId: titreDemarche!.typeId,
      etapeTypeId: etapeType!.id,
    })
  } catch (e) {
    console.error(e)

    throw e
  }
}

const specifiquesGet = async (titreTypeId: TitreTypeId, titreDemarcheTypeId: DemarcheTypeId, etapeType: IEtapeType) => {
  const tde = await titreTypeDemarcheTypeEtapeTypeGet(
    {
      titreTypeId,
      demarcheTypeId: titreDemarcheTypeId,
      etapeTypeId: etapeType.id,
    },
    { fields: { justificatifsTypes: { id: {} } } }
  )

  const sections = getSections(titreTypeId, titreDemarcheTypeId, etapeType.id)

  const justificatifsTypes = documentsTypesFormat(etapeType.justificatifsTypes, tde?.justificatifsTypes)

  return { sections, justificatifsTypes }
}

const etapeCreer = async ({ etape }: { etape: ITitreEtape }, context: Context, info: GraphQLResolveInfo) => {
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
          type: { etapesTypes: { id: {} } },
          titre: {
            demarches: { etapes: { id: {} } },
          },
          etapes: { type: { id: {} } },
        },
      },
      userSuper
    )

    if (!titreDemarche || !titreDemarche.titre) throw new Error("le titre n'existe pas")

    const etapeType = await etapeTypeGet(etape.typeId, {
      fields: { justificatifsTypes: { id: {} } },
    })

    if (!etapeType) {
      throw new Error(`le type d'étape "${etape.typeId}" n'existe pas`)
    }

    const { statutId, date } = statutIdAndDateGet(etape, user!)
    etape.statutId = statutId
    etape.date = date

    const { sections, justificatifsTypes } = await specifiquesGet(titreDemarche.titre!.typeId, titreDemarche.typeId, etapeType)

    const justificatifs = etape.justificatifIds?.length ? await documentsGet({ ids: etape.justificatifIds }, { fields: { type: { id: {} } } }, userSuper) : null
    delete etape.justificatifIds
    etape.justificatifs = justificatifs

    const documentIds = etape.documentIds || []
    const documents = documentIds.length ? await documentsGet({ ids: documentIds }, { fields: { type: { id: {} } } }, userSuper) : null
    delete etape.documentIds

    const sdomZones: SDOMZoneId[] = []
    let titreEtapePoints = null
    if (etape.points?.length) {
      titreEtapePoints = titreEtapePointsCalc(etape.points)
      const geojsonFeatures = geojsonFeatureMultiPolygon(titreEtapePoints as ITitrePoint[]) as Feature

      const geoJsonResult = await titreEtapeSdomZonesGet(geojsonFeatures)
      if (geoJsonResult.fallback) {
        console.warn(`utilisation du fallback pour l'étape ${etape.id}`)
      }
      sdomZones.push(...geoJsonResult.data)
    }

    const typeId = titreDemarche?.titre?.typeId
    if (!typeId) {
      throw new Error(`le type du titre de la ${titreDemarche.id} n'est pas chargé`)
    }
    const rulesErrors = titreEtapeUpdationValidate(
      getCurrent(),
      etape,
      titreDemarche,
      titreDemarche.titre,
      sections,
      getDocuments(typeId, titreDemarche.typeId, etape.typeId),
      documents,
      justificatifsTypes,
      justificatifs,
      sdomZones,
      user
    )
    if (rulesErrors.length) {
      throw new Error(rulesErrors.join(', '))
    }
    if (
      !canCreateOrEditEtape(
        user,
        etapeType.id,
        etape.statutId,
        titreDemarche.titre.titulaires ?? [],
        titreDemarche.titre.administrationsLocales ?? [],
        titreDemarche.typeId,
        {
          typeId: titreDemarche.titre.typeId,
          titreStatutId: titreDemarche.titre.titreStatutId ?? TitresStatutIds.Indetermine,
        },
        'creation'
      )
    ) {
      throw new Error('droits insuffisants pour créer cette étape')
    }

    if (titreEtapePoints) {
      etape.points = titreEtapePoints
    }
    const { contenu, newFiles } = sectionsContenuAndFilesGet(etape.contenu, sections)
    etape.contenu = contenu

    let etapeUpdated: ITitreEtape = await titreEtapeUpsert(etape, user!, titreDemarche.titreId)

    await contenuElementFilesCreate(newFiles, 'demarches', etapeUpdated.id)

    await documentsLier(context, documentIds, etapeUpdated.id, 'titreEtapeId')

    try {
      await titreEtapeUpdateTask(context.pool, etapeUpdated.id, etapeUpdated.titreDemarcheId, user)
    } catch (e) {
      console.error('une erreur est survenue lors des tâches annexes', e)
    }

    await titreEtapeAdministrationsEmailsSend(etapeUpdated, etapeType, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre.typeId, user)
    await titreEtapeUtilisateursEmailsSend(etapeUpdated, etapeType, titreDemarche.typeId, titreDemarche.titreId)
    const fields = fieldsBuild(info)

    etapeUpdated = await titreEtapeGet(etapeUpdated.id, { fields }, user)

    return titreEtapeFormat(etapeUpdated!)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const etapeModifier = async ({ etape }: { etape: ITitreEtape }, context: Context, info: GraphQLResolveInfo) => {
  try {
    const user = context.user
    if (!user) {
      throw new Error("l'étape n'existe pas")
    }

    const titreEtapeOld = await titreEtapeGet(
      etape.id,
      {
        fields: {
          documents: { id: {} },
          titulaires: { id: {} },
          amodiataires: { id: {} },
          demarche: { titre: { pointsEtape: { id: {} } } },
        },
      },
      user
    )

    if (!titreEtapeOld) throw new Error("l'étape n'existe pas")
    if (!titreEtapeOld.titulaires) {
      throw new Error('Les titulaires de l’étape ne sont pas chargés')
    }
    if (!titreEtapeOld.demarche || !titreEtapeOld.demarche.titre || titreEtapeOld.demarche.titre.administrationsLocales === undefined || !titreEtapeOld.demarche.titre.titreStatutId) {
      throw new Error('la démarche n’est pas chargée complètement')
    }

    if (
      !canCreateOrEditEtape(
        user,
        titreEtapeOld.typeId,
        titreEtapeOld.statutId,
        titreEtapeOld.titulaires,
        titreEtapeOld.demarche.titre.administrationsLocales ?? [],
        titreEtapeOld.demarche.typeId,
        {
          typeId: titreEtapeOld.demarche.titre.typeId,
          titreStatutId: titreEtapeOld.demarche.titre.titreStatutId,
        },
        'modification'
      )
    )
      throw new Error('droits insuffisants')

    if (titreEtapeOld.titreDemarcheId !== etape.titreDemarcheId) throw new Error("la démarche n'existe pas")

    const titreDemarche = await titreDemarcheGet(
      etape.titreDemarcheId,
      {
        fields: {
          type: { etapesTypes: { id: {} } },
          titre: {
            demarches: { etapes: { id: {} } },
          },
          etapes: { type: { id: {} } },
        },
      },
      userSuper
    )

    if (!titreDemarche || !titreDemarche.titre) throw new Error("le titre n'existe pas")

    const etapeType = await etapeTypeGet(etape.typeId, {
      fields: { justificatifsTypes: { id: {} } },
    })
    if (!etapeType) {
      throw new Error(`le type d'étape "${etape.typeId}" n'existe pas`)
    }

    const { statutId, date } = statutIdAndDateGet(etape, user!)
    etape.statutId = statutId
    etape.date = date

    const { sections, justificatifsTypes } = await specifiquesGet(titreDemarche.titre!.typeId, titreDemarche.typeId, etapeType)

    const justificatifs = etape.justificatifIds?.length ? await documentsGet({ ids: etape.justificatifIds }, { fields: { type: { id: {} } } }, userSuper) : null
    delete etape.justificatifIds
    etape.justificatifs = justificatifs

    const documentIds = etape.documentIds || []
    const documents = documentIds.length ? await documentsGet({ ids: documentIds }, { fields: { type: { id: {} } } }, userSuper) : null
    delete etape.documentIds

    const sdomZones: SDOMZoneId[] = []
    let titreEtapePoints = null
    if (etape.points?.length) {
      titreEtapePoints = titreEtapePointsCalc(etape.points)
      const geojsonFeatures = geojsonFeatureMultiPolygon(titreEtapePoints as ITitrePoint[]) as Feature

      const geoJsonResult = await titreEtapeSdomZonesGet(geojsonFeatures)
      if (geoJsonResult.fallback) {
        console.warn(`utilisation du fallback pour l'étape ${etape.id}`)
      }

      sdomZones.push(...geoJsonResult.data)
    }

    const typeId = titreDemarche?.titre?.typeId
    if (!typeId) {
      throw new Error(`le type du titre de la ${titreDemarche.id} n'est pas chargé`)
    }
    const rulesErrors = titreEtapeUpdationValidate(
      getCurrent(),
      etape,
      titreDemarche,
      titreDemarche.titre,
      sections,
      getDocuments(typeId, titreDemarche.typeId, etape.typeId),
      documents,
      justificatifsTypes,
      justificatifs,
      sdomZones,
      user,
      titreEtapeOld
    )

    if (rulesErrors.length) {
      throw new Error(rulesErrors.join(', '))
    }

    if (titreEtapePoints) {
      etape.points = titreEtapePoints
    }
    await documentsLier(context, documentIds, etape.id, 'titreEtapeId', titreEtapeOld)

    const { contenu, newFiles } = sectionsContenuAndFilesGet(etape.contenu, sections)
    etape.contenu = contenu

    if (titreEtapeOld.decisionsAnnexesSections) {
      const { contenu: decisionsAnnexesContenu, newFiles: decisionsAnnexesNewFiles } = sectionsContenuAndFilesGet(etape.decisionsAnnexesContenu, titreEtapeOld.decisionsAnnexesSections)
      etape.decisionsAnnexesContenu = decisionsAnnexesContenu as IDecisionAnnexeContenu
      await contenuElementFilesCreate(decisionsAnnexesNewFiles, 'demarches', etape.id)
    }

    let etapeUpdated: ITitreEtape = await titreEtapeUpsert(etape, user!, titreDemarche.titreId)

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

    await titreEtapeAdministrationsEmailsSend(etape, etapeType, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre.typeId, user, titreEtapeOld)

    const fields = fieldsBuild(info)
    etapeUpdated = await titreEtapeGet(etapeUpdated.id, { fields }, user)

    return titreEtapeFormat(etapeUpdated!)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const etapeDeposer = async ({ id }: { id: EtapeId }, { user, pool }: Context, info: GraphQLResolveInfo) => {
  try {
    if (!user) {
      throw new Error("l'étape n'existe pas")
    }

    let titreEtape = await titreEtapeGet(id, { fields: { type: { id: {} } } }, user)

    if (!titreEtape) throw new Error("l'étape n'existe pas")
    const titreEtapeOld = objectClone(titreEtape)

    const titreDemarche = await titreDemarcheGet(
      titreEtape.titreDemarcheId,
      {
        fields: {
          titre: { id: {} },
        },
      },
      userSuper
    )

    titreEtape = titreEtapeFormat(titreEtape)

    if (!titreEtape.deposable || !titreDemarche) throw new Error('droits insuffisants')

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

        const contenu = decisionAnnexesElements.filter((element): element is Required<SectionsElement & { sectionId: string }> => element.type !== 'file' && !!element.sectionId) ?? []

        if (contenu) {
          etapeDecisionAnnexe.contenu = contenu.reduce<IContenu>((acc, e) => {
            if (!acc[e.sectionId]) {
              acc[e.sectionId] = {}
            }
            acc[e.sectionId][e.id] = decisionContenu[e.id]

            return acc
          }, {})
        }

        etapeDecisionAnnexe = await titreEtapeCreate(etapeDecisionAnnexe as ITitreEtape, userSuper, titreDemarche.titreId)

        const documentTypeIds = decisionAnnexesElements.filter(({ type }) => type === 'file').map(({ id }) => id) ?? []
        for (const documentTypeId of documentTypeIds) {
          const fileName = decisionContenu[documentTypeId]

          if (isDocumentTypeId(documentTypeId)) {
            const id = newDocumentId(decisionContenu.date, documentTypeId)
            const document: IDocument = {
              id,
              typeId: documentTypeId,
              date: decisionContenu.date,
              fichier: true,
              entreprisesLecture: true,
              titreEtapeId: etapeDecisionAnnexe.id,
              fichierTypeId: 'pdf',
            }

            const filePath = `${contenuFilesPathGet('demarches', titreEtape.id)}/${fileName}`

            const newDocumentPath = await documentFilePathFind(document, true)

            await fileRename(filePath, newDocumentPath)

            await documentCreate(document)
          }
        }
      }
    }

    await titreEtapeUpdateTask(pool, etapeUpdated.id, etapeUpdated.titreDemarcheId, user)

    await titreEtapeAdministrationsEmailsSend(etapeUpdated, titreEtape.type!, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre!.typeId, user!, titreEtapeOld)

    const fields = fieldsBuild(info)
    const titreUpdated = await titreGet(titreDemarche.titreId, { fields }, user)

    return titreFormat(titreUpdated!)
  } catch (e) {
    console.error(e)

    throw e
  }
}

const etapeSupprimer = async ({ id }: { id: EtapeId }, { user, pool }: Context, info: GraphQLResolveInfo) => {
  try {
    const fields = fieldsBuild(info)

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

    if (!titreEtape) throw new Error("l'étape n'existe pas")
    if (!titreEtape.titulaires) {
      throw new Error('Les titulaires de l’étape ne sont pas chargés')
    }
    if (!titreEtape.demarche || !titreEtape.demarche.titre || titreEtape.demarche.titre.administrationsLocales === undefined || !titreEtape.demarche.titre.titreStatutId) {
      throw new Error('la démarche n’est pas chargée complètement')
    }

    if (
      !canCreateOrEditEtape(
        user,
        titreEtape.typeId,
        titreEtape.statutId,
        titreEtape.titulaires,
        titreEtape.demarche.titre.administrationsLocales ?? [],
        titreEtape.demarche.typeId,
        {
          typeId: titreEtape.demarche.titre.typeId,
          titreStatutId: titreEtape.demarche.titre.titreStatutId,
        },
        'modification'
      )
    )
      throw new Error('droits insuffisants')

    const titreDemarche = await titreDemarcheGet(
      titreEtape.titreDemarcheId,
      {
        fields: {
          type: { etapesTypes: { id: {} } },
          titre: {
            demarches: { etapes: { id: {} } },
          },
          etapes: { type: { id: {} } },
        },
      },
      userSuper
    )

    if (!titreDemarche) throw new Error("la démarche n'existe pas")

    if (!titreDemarche.titre) throw new Error("le titre n'existe pas")

    const currentDate = getCurrent()
    const rulesErrors = titreDemarcheUpdatedEtatValidate(currentDate, titreDemarche.type!, titreDemarche.titre, titreEtape, titreDemarche.id, titreDemarche.etapes!, true)

    if (rulesErrors.length) {
      throw new Error(rulesErrors.join(', '))
    }
    await titreEtapeUpdate(id, { archive: true }, user, titreDemarche.titreId)

    await titreEtapeUpdateTask(pool, null, titreEtape.titreDemarcheId, user)

    const titreUpdated = await titreGet(titreDemarche.titreId, { fields }, user)

    return titreFormat(titreUpdated!)
  } catch (e) {
    console.error(e)

    throw e
  }
}

export { etape, etapeHeritage, etapeCreer, etapeModifier, etapeSupprimer, etapeDeposer, specifiquesGet }
