// valide la date et la position de l'étape en fonction des autres étapes
import { DeepReadonly, NonEmptyArray, isNonEmptyArray, isNotNullNorUndefined, isNullOrUndefinedOrEmpty, onlyUnique } from 'camino-common/src/typescript-tools'
import type { ITitre, ITitreEtape } from '../../types'

import { DemarcheDefinition, demarcheDefinitionFind } from '../rules-demarches/definitions'
import { Etape, TitreEtapeForMachine, titreEtapeForMachineValidator, toMachineEtapes } from '../rules-demarches/machine-common'
import { DemarcheId } from 'camino-common/src/demarche'
import { DemarchesTypes, DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { EtapeId, EtapeTypeEtapeStatutWithMainStep } from 'camino-common/src/etape'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { CaminoMachines } from '../rules-demarches/machines'
import { CaminoDate } from 'camino-common/src/date'
import { EtapesTypes, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort'
import { getEtapesTDE, isTDEExist } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index'
import { etapeTypeDateFinCheck } from '../../api/_format/etapes-types'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'

const titreDemarcheEtapesBuild = <T extends Pick<Partial<ITitreEtape>, 'id'>>(titreEtape: DeepReadonly<T>, suppression: boolean, titreDemarcheEtapes?: DeepReadonly<T[]> | null): DeepReadonly<T[]> => {
  if (isNullOrUndefinedOrEmpty(titreDemarcheEtapes)) {
    return [titreEtape]
  }

  // si nous n’ajoutons pas une nouvelle étape
  // on supprime l’étape en cours de modification ou de suppression
  const titreEtapes = titreDemarcheEtapes.reduce((acc: DeepReadonly<T[]>, te) => {
    if (te.id !== titreEtape.id) {
      acc = [...acc, te]
    }

    // modification
    if (!suppression && te.id === titreEtape.id) {
      acc = [...acc, titreEtape]
    }

    return acc
  }, [])

  // création
  if (!titreEtape.id) {
    return [...titreEtapes, titreEtape]
  }

  return titreEtapes
}

// vérifie que la modification de la démarche
// est valide par rapport aux définitions des types d'étape
export const titreDemarcheUpdatedEtatValidate = (
  demarcheTypeId: DemarcheTypeId,
  titre: Pick<ITitre, 'typeId' | 'demarches'>,
  titreEtape: Pick<Partial<ITitreEtape>, 'id'> & Pick<ITitreEtape, 'statutId' | 'typeId' | 'date' | 'contenu' | 'surface' | 'communes' | 'isBrouillon'>,
  demarcheId: DemarcheId,
  titreDemarcheEtapes?: Pick<ITitreEtape, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'communes' | 'surface' | 'isBrouillon'>[] | null,
  suppression = false
): { valid: true; errors: null } | { valid: false; errors: NonEmptyArray<string> } => {
  const titreDemarcheEtapesNew = titreDemarcheEtapesBuild(titreEtape, suppression, titreDemarcheEtapes)
  const demarcheDefinition = demarcheDefinitionFind(titre.typeId, demarcheTypeId, titreDemarcheEtapesNew, demarcheId)
  const titreDemarchesErrors: string[] = []

  // vérifie que la démarche existe dans le titre
  const titreDemarche = titre.demarches?.find(d => d.typeId === demarcheTypeId)
  if (!titreDemarche) {
    titreDemarchesErrors.push('le titre ne contient pas la démarche en cours de modification')
  }
  // on récupère tous les type d'étapes et les statuts associés applicable à la date souhaitée
  try {
    const etapeTypesWithStatusPossibles = getPossiblesEtapesTypes(demarcheDefinition, titre.typeId, demarcheTypeId, titreEtape.typeId, titreEtape.id, titreEtape.date, titreDemarcheEtapes ?? [])

    if (!etapeTypesWithStatusPossibles.some(({ etapeStatutId, etapeTypeId }) => etapeStatutId === titreEtape.statutId && etapeTypeId === titreEtape.typeId)) {
      if (isNotNullNorUndefined(demarcheDefinition)) {
        return { valid: false, errors: ['les étapes de la démarche machine ne sont pas valides'] }
      } else {
        return { valid: false, errors: ['les étapes de la démarche TDE ne sont pas valides'] }
      }
    }
  } catch (e: any) {
    console.warn('une erreur est survenue', e)
    titreDemarchesErrors.push(e.message)
  }

  if (isNotNullNorUndefined(demarcheDefinition)) {
    // vérifie que toutes les étapes existent dans l’arbre
    try {
      const etapes = titreDemarcheEtapesNew.map(etape => titreEtapeForMachineValidator.omit({ id: true, ordre: true }).parse(etape))
      const ok = demarcheDefinition.machine.isEtapesOk(demarcheDefinition.machine.orderMachine(toMachineEtapes(etapes)))
      if (!ok) {
        titreDemarchesErrors.push('la démarche machine n’est pas valide')
      }
    } catch (e) {
      console.warn('une erreur est survenue', e)
      titreDemarchesErrors.push('la démarche n’est pas valide')
    }
  }

  if (isNonEmptyArray(titreDemarchesErrors)) {
    return { valid: false, errors: titreDemarchesErrors }
  }

  return { valid: true, errors: null }
}

export const getPossiblesEtapesTypes = (
  demarcheDefinition: DemarcheDefinition | undefined,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  etapeTypeId: EtapeTypeId | undefined,
  etapeId: EtapeId | undefined,
  date: CaminoDate,
  demarcheEtapes: Pick<ITitreEtape, 'typeId' | 'date' | 'isBrouillon' | 'id' | 'ordre' | 'statutId' | 'communes'>[]
): EtapeTypeEtapeStatutWithMainStep[] => {
  const etapesTypes: EtapeTypeEtapeStatutWithMainStep[] = []
  if (isNotNullNorUndefined(demarcheDefinition)) {
    const etapes = demarcheEtapes.map(etape => titreEtapeForMachineValidator.parse(etape))

    etapesTypes.push(...etapesTypesPossibleACetteDateOuALaPlaceDeLEtape(demarcheDefinition.machine, etapes, etapeId ?? null, date))
  } else {
    // si on modifie une étape
    // vérifie que son type est possible sur la démarche
    if (isNotNullNorUndefined(etapeTypeId)) {
      if (!isTDEExist(titreTypeId, demarcheTypeId, etapeTypeId)) {
        const demarcheType = DemarchesTypes[demarcheTypeId]
        throw new Error(`étape ${EtapesTypes[etapeTypeId].nom} inexistante pour une démarche ${demarcheType.nom} pour un titre ${titreTypeId}.`)
      }
    }
    // dans un premier temps on récupère toutes les étapes possibles pour cette démarche
    let etapesTypesTDE = getEtapesTDE(titreTypeId, demarcheTypeId)

    const etapeTypesExistants = demarcheEtapes.map(({ typeId }) => typeId) ?? []
    etapesTypesTDE = etapesTypesTDE
      .filter(typeId => etapeTypeId === typeId || !etapeTypesExistants.includes(typeId) || !EtapesTypes[typeId].unique)
      .filter(etapeTypeId => etapeTypeDateFinCheck(etapeTypeId, demarcheEtapes))
    etapesTypes.push(...etapesTypesTDE.flatMap(etapeTypeId => getEtapesStatuts(etapeTypeId).map(etapeStatut => ({ etapeTypeId, etapeStatutId: etapeStatut.id, mainStep: false }))))
  }

  // On ne peut pas avoir 2 fois le même type d'étape en brouillon
  const etapeTypeIdInBrouillon = demarcheEtapes.filter(({ isBrouillon, id }) => id !== etapeId && isBrouillon).map(({ typeId }) => typeId) ?? []

  return etapesTypes.filter(({ etapeTypeId }) => !etapeTypeIdInBrouillon.includes(etapeTypeId))
}

// VISIBLE FOR TESTING
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
    //

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
