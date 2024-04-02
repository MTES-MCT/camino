import { z } from 'zod'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { EtapeTypeEtapeStatutWithMainStep, etapeIdValidator, EtapeId, EtapeDocument } from 'camino-common/src/etape.js'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date.js'
import { titreDemarcheGet } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { titreEtapeGet, titreEtapeUpdate } from '../../database/queries/titres-etapes.js'
import { demarcheDefinitionFind } from '../../business/rules-demarches/definitions.js'
import { etapeTypeDateFinCheck } from '../_format/etapes-types.js'
import { User } from 'camino-common/src/roles.js'
import { canCreateEtape, isEtapeDeposable } from 'camino-common/src/permissions/titres-etapes.js'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import { CaminoMachines } from '../../business/rules-demarches/machines.js'
import { titreEtapesSortAscByOrdre } from '../../business/utils/titre-etapes-sort.js'
import { Etape, TitreEtapeForMachine, titreEtapeForMachineValidator, toMachineEtapes } from '../../business/rules-demarches/machine-common.js'
import { EtapesTypes, EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { isNotNullNorUndefined, isNullOrUndefined, memoize, onlyUnique } from 'camino-common/src/typescript-tools.js'
import { getEtapesTDE, isTDEExist } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes.js'
import { Pool } from 'pg'
import { EtapeEntrepriseDocument } from 'camino-common/src/entreprise.js'
import { getDocumentsByEtapeId, getEntrepriseDocumentIdsByEtapeId } from '../../database/queries/titres-etapes.queries.js'
import { etapeSupprimer, statutIdAndDateGet } from '../graphql/resolvers/titres-etapes.js'
import { administrationsLocalesByEtapeId, entreprisesTitulairesOuAmoditairesByEtapeId, getEtapeDataForEdition } from './etapes.queries.js'
import { SDOMZoneId } from 'camino-common/src/static/sdom.js'
import { objectClone } from '../../tools/index.js'
import { titreEtapeAdministrationsEmailsSend } from '../graphql/resolvers/_titre-etape-email.js'
import { getGeojsonInformation } from './perimetre.queries.js'
import { titreEtapeUpdateTask } from '../../business/titre-etape-update.js'

export const getEtapeEntrepriseDocuments =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<EtapeEntrepriseDocument[]>): Promise<void> => {
    const etapeIdParsed = etapeIdValidator.safeParse(req.params.etapeId)
    const user = req.auth

    if (!etapeIdParsed.success) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    } else {
      try {
        const result = await getEntrepriseDocumentIdsByEtapeId({ titre_etape_id: etapeIdParsed.data }, pool, user)
        res.json(result)
      } catch (e) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }

export const getEtapeDocuments =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<EtapeDocument[]>): Promise<void> => {
    const etapeIdParsed = etapeIdValidator.safeParse(req.params.etapeId)
    const user = req.auth

    if (!etapeIdParsed.success) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    } else {
      try {
        const etapeData = await getEtapeDataForEdition(pool, etapeIdParsed.data)

        const titreTypeId = memoize(() => Promise.resolve(etapeData.titre_type_id))
        const administrationsLocales = memoize(() => administrationsLocalesByEtapeId(etapeIdParsed.data, pool))
        const entreprisesTitulairesOuAmodiataires = memoize(() => entreprisesTitulairesOuAmoditairesByEtapeId(etapeIdParsed.data, pool))

        const result = await getDocumentsByEtapeId(etapeIdParsed.data, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, etapeData.etape_type_id, {
          demarche_type_id: etapeData.demarche_type_id,
          entreprises_lecture: etapeData.demarche_entreprises_lecture,
          public_lecture: etapeData.demarche_public_lecture,
          titre_public_lecture: etapeData.titre_public_lecture,
        })
        res.json(result)
      } catch (e) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }

export const deleteEtape = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<void>) => {
  const user = req.auth

  const etapeId = etapeIdValidator.safeParse(req.params.etapeId)
  if (!etapeId.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
  } else {
    try {
      await etapeSupprimer({ id: etapeId.data }, { pool, user })
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
    } catch (e) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      console.error(e)
    }
  }
}

export const deposeEtape = (pool: Pool) => async (req: CaminoRequest, res: CustomResponse<void>) => {
  const user = req.auth

  const etapeId = etapeIdValidator.safeParse(req.params.etapeId)
  if (!etapeId.success) {
    res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
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

    await titreEtapeUpdate(
      titreEtape.id,
      {
        ...statutIdAndDate,
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

    // FIXME transforme les etapeAvisDocuments en etapeDocuments, créer les étapes associées puis les supprimer

    // Si il y a des décisions annexes, il faut générer une étape par décision
    // if (decisionsAnnexesContenu) {
    //   for (const etapeTypeId of Object.keys(decisionsAnnexesContenu!)) {
    //     if (!isEtapeTypeId(etapeTypeId)) {
    //       throw new Error(`l'étapeTypeId ${etapeTypeId} n'existe pas`)
    //     }

    //     let etapeDecisionAnnexe: Partial<ITitreEtape> = {
    //       typeId: etapeTypeId,
    //       titreDemarcheId: titreDemarche.id,
    //       date: toCaminoDate(decisionContenu.date),
    //       statutId: decisionContenu.statutId,
    //     }

    //       //Remplir le contenu (le numéro d’arrêté préfectoral de la dae)
    //     if (isNotNullNorUndefined(contenu)) {
    //       // etapeDecisionAnnexe.contenu =
    //     }

    //     etapeDecisionAnnexe = await titreEtapeCreate(etapeDecisionAnnexe as ITitreEtape, userSuper, titreDemarche.titreId)

    //     const documentTypeIds = decisionAnnexesElements.filter(({ type }) => type === 'file').map(({ id }) => id) ?? []
    //     for (const _documentTypeId of documentTypeIds) {
    // const document: IDocument = {
    //   id,
    //   typeId: documentTypeId,
    //   date: decisionContenu.date,
    //   fichier: true,
    //   entreprisesLecture: true,
    //   titreEtapeId: etapeDecisionAnnexe.id,
    // }
    // }
    //   }
    // }
    // }

    await titreEtapeUpdateTask(pool, etapeUpdated.id, etapeUpdated.titreDemarcheId, user)

    await titreEtapeAdministrationsEmailsSend(etapeUpdated, titreDemarche.typeId, titreDemarche.titreId, titreDemarche.titre!.typeId, user!, titreEtapeOld)



      res.sendStatus(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
    } catch (e) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
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
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    } else {
      try {
        const result = await demarcheEtapesTypesGet(demarcheIdParsed.data, dateParsed.data, etapeIdParsed.data ?? null, user)
        res.json(result)
      } catch (e) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
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
          titulaires: { id: {} },
        },
        etapes: { id: {} },
      },
    },
    userSuper
  )

  if (!titreDemarche) throw new Error("la démarche n'existe pas")

  const titre = titreDemarche.titre!

  const titreEtape = titreEtapeId ? await titreEtapeGet(titreEtapeId, {}, user) : undefined

  if (titreEtapeId && !titreEtape) throw new Error("l'étape n'existe pas")

  // si on modifie une étape
  // vérifie que son type est possible sur la démarche
  if (titreEtape) {
    if (!isTDEExist(titre.typeId, titreDemarche.typeId, titreEtape.typeId)) {
      const demarcheType = DemarchesTypes[titreDemarche.typeId]
      throw new Error(`étape ${EtapesTypes[titreEtape.typeId].nom} inexistante pour une démarche ${demarcheType.nom} pour un titre ${titre.typeId}.`)
    }
  }

  const demarcheDefinition = demarcheDefinitionFind(titre.typeId, titreDemarche.typeId, titreDemarche.etapes, titreDemarche.id)

  const etapesTypes: EtapeTypeEtapeStatutWithMainStep[] = []
  if (demarcheDefinition) {
    if (!titreDemarche.etapes) throw new Error('les étapes ne sont pas chargées')
    const etapes = titreDemarche.etapes.map(etape => titreEtapeForMachineValidator.parse(etape))
    etapesTypes.push(...etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(demarcheDefinition.machine, etapes, titreEtapeId, date))
  } else {
    // dans un premier temps on récupère toutes les étapes possibles pour cette démarche
    let etapesTypesTDE = getEtapesTDE(titre.typeId, titreDemarche.typeId)

    const etapeTypesExistants = titreDemarche.etapes?.map(({ typeId }) => typeId) ?? []
    etapesTypesTDE = etapesTypesTDE
      .filter(typeId => titreEtape?.typeId === typeId || !etapeTypesExistants.includes(typeId) || !EtapesTypes[typeId].unique)
      .filter(etapeTypeId => etapeTypeDateFinCheck(etapeTypeId, titreDemarche.etapes))
    etapesTypes.push(...etapesTypesTDE.flatMap(etapeTypeId => getEtapesStatuts(etapeTypeId).map(etapeStatut => ({ etapeTypeId, etapeStatutId: etapeStatut.id, mainStep: false }))))
  }

  return etapesTypes.filter(({ etapeTypeId }) =>
    canCreateEtape(
      user,
      etapeTypeId,
      titreEtapeId && etapeTypeId === titreEtape?.typeId ? titreEtape?.statutId ?? null : null,
      titre.titulaires ?? [],
      titre.administrationsLocales ?? [],
      titreDemarche.typeId,
      {
        typeId: titre.typeId,
        titreStatutId: titre.titreStatutId ?? TitresStatutIds.Indetermine,
      }
    )
  )
}

// VISIBLE_FOR_TESTING
export const etapesTypesPossibleACetteDateOuALaPlaceDeLEtape = (
  machine: CaminoMachines,
  etapes: TitreEtapeForMachine[],
  titreEtapeId: string | null,
  date: CaminoDate
): { etapeTypeId: EtapeTypeId; etapeStatutId: EtapeStatutId; mainStep: boolean }[] => {
  const sortedEtapes = titreEtapesSortAscByOrdre(etapes)
  const etapesAvant: Etape[] = []
  const etapesApres: Etape[] = []
  if (isNotNullNorUndefined(titreEtapeId)) {
    const index = sortedEtapes.findIndex(etape => etape.id === titreEtapeId)
    etapesAvant.push(...toMachineEtapes(sortedEtapes.slice(0, index)))
    etapesApres.push(...toMachineEtapes(sortedEtapes.slice(index + 1)))
  } else {
    // TODO 2022-07-12: Il faudrait mieux gérer les étapes à la même date que l'étape qu'on veut rajouter
    // elles ne sont ni avant, ni après, mais potentiellement au milieu de toutes ces étapes
    etapesAvant.push(...toMachineEtapes(sortedEtapes.filter(etape => etape.date <= date)))
    etapesApres.push(...toMachineEtapes(sortedEtapes.slice(etapesAvant.length)))
  }

  const etapesPossibles = machine.possibleNextEtapes(etapesAvant, date).filter(et => {
    const newEtapes = [...etapesAvant]

    const items = { ...et, date }
    newEtapes.push(items)
    newEtapes.push(...etapesApres)

    return machine.isEtapesOk(newEtapes)
  })

  return etapesPossibles.map(({ etapeTypeId, etapeStatutId, mainStep }) => ({ etapeTypeId, etapeStatutId, mainStep })).filter(onlyUnique)
}
