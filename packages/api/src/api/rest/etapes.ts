import { z } from 'zod'
import { CaminoRequest, CustomResponse } from './express-type.js'
import { EtapeTypeEtapeStatutWithMainStep, etapeIdValidator, EtapeId } from 'camino-common/src/etape.js'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche.js'
import { constants } from 'http2'
import { CaminoDate, caminoDateValidator } from 'camino-common/src/date.js'
import { titreDemarcheGet } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { titreEtapeGet } from '../../database/queries/titres-etapes.js'
import { demarcheDefinitionFind } from '../../business/rules-demarches/definitions.js'
import { etapeTypeDateFinCheck } from '../_format/etapes-types.js'
import { User } from 'camino-common/src/roles.js'
import { canCreateOrEditEtape } from 'camino-common/src/permissions/titres-etapes.js'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts.js'
import { CaminoMachines } from '../../business/rules-demarches/machines.js'
import { titreEtapesSortAscByOrdre } from '../../business/utils/titre-etapes-sort.js'
import { Etape, TitreEtapeForMachine, titreEtapeForMachineValidator, toMachineEtapes } from '../../business/rules-demarches/machine-common.js'
import { EtapesTypes, EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { onlyUnique } from 'camino-common/src/typescript-tools.js'
import { getEtapesTDE } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { Pool } from 'pg'
import { EtapeEntrepriseDocument } from 'camino-common/src/entreprise.js'
import { getEntrepriseDocumentIdsByEtapeId } from '../../database/queries/titres-etapes.queries.js'

export const getEtapeEntrepriseDocuments =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<EtapeEntrepriseDocument[]>): Promise<void> => {
    const etapeIdParsed = etapeIdValidator.safeParse(req.params.etapeId)
    const user = req.auth

    if (!etapeIdParsed.success) {
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
    } else {
      try {
        const result = await getEntrepriseDocumentIdsByEtapeId({ titre_etape_id: etapeIdParsed.data }, pool, user)
        res.json(result)
      } catch (e) {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
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
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
    } else {
      try {
        const result = await demarcheEtapesTypesGet(demarcheIdParsed.data, dateParsed.data, etapeIdParsed.data ?? null, user)
        res.json(result)
      } catch (e) {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }

const demarcheEtapesTypesGet = async (titreDemarcheId: DemarcheId, date: CaminoDate, titreEtapeId: EtapeId | null, user: User) => {
  const titreDemarche = await titreDemarcheGet(
    titreDemarcheId,
    {
      fields: {
        type: { etapesTypes: { id: {} } },
        titre: {
          type: { id: {} },
          demarches: { etapes: { id: {} } },
          pointsEtape: { id: {} },
          titulaires: { id: {} },
        },
        etapes: { type: { id: {} } },
      },
    },
    userSuper
  )

  if (!titreDemarche) throw new Error("la démarche n'existe pas")

  const titre = titreDemarche.titre!

  const titreEtape = titreEtapeId ? await titreEtapeGet(titreEtapeId, {}, user) : undefined

  if (titreEtapeId && !titreEtape) throw new Error("l'étape n'existe pas")

  // TODO 2023-04-12 supprimer etapesTypes et utiliser getTDE
  const demarcheTypeEtapesTypes = titreDemarche.type!.etapesTypes
  // si on modifie une étape
  // vérifie que son type est possible sur la démarche
  if (titreEtape) {
    const etapeType = demarcheTypeEtapesTypes.find(et => et.id === titreEtape.typeId)

    if (!etapeType) {
      throw new Error(`étape ${titreEtape.type!.nom} inexistante pour une démarche ${titreDemarche.type!.nom} pour un titre ${titre.typeId}.`)
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
    canCreateOrEditEtape(
      user,
      etapeTypeId,
      titreEtapeId && etapeTypeId === titreEtape?.typeId ? titreEtape?.statutId ?? null : null,
      titre.titulaires ?? [],
      titre.administrationsLocales ?? [],
      titreDemarche.typeId,
      {
        typeId: titre.typeId,
        titreStatutId: titre.titreStatutId ?? TitresStatutIds.Indetermine,
      },
      'creation'
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
  if (titreEtapeId) {
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
