import { ITitreEtape } from '../../types'
import { demarcheDefinitionFind } from '../rules-demarches/definitions'
import { TitreEtapeForMachine, toMachineEtapes } from '../rules-demarches/machine-common'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getEtapesTDE } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index'
import { DemarcheId } from 'camino-common/src/demarche'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { ETAPE_IS_BROUILLON } from 'camino-common/src/etape'

// classe les étapes selon leur ordre inverse: 3, 2, 1.
export const titreEtapesSortDescByOrdre = <T extends Pick<ITitreEtape, 'ordre'>>(titreEtapes: T[]): T[] => titreEtapes.slice().sort((a, b) => b.ordre! - a.ordre!)

// classe les étapes selon leur ordre: 1, 2, 3, …
export const titreEtapesSortAscByOrdre = <T extends Pick<ITitreEtape, 'ordre'>>(titreEtapes: T[]): T[] => titreEtapes.slice().sort((a, b) => a.ordre! - b.ordre!)
// classe les étapes selon leur dates, ordre et etapesTypes.ordre le cas échéant
export const titreEtapesSortAscByDate = <T extends TitreEtapeForMachine>(titreEtapes: T[], demarcheId: DemarcheId, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): T[] => {
  const demarcheDefinition = demarcheDefinitionFind(titreTypeId, demarcheTypeId, titreEtapes, demarcheId)
  if (demarcheDefinition) {
    const etapes = demarcheDefinition.machine.orderMachine(toMachineEtapes(titreEtapes))
    if (!demarcheDefinition.machine.isEtapesOk(etapes)) {
      console.error(`impossible de trouver un ordre pour la démarche '${demarcheId}' où ces étapes sont valides ${JSON.stringify(etapes)}`)
    }

    const result: T[] = []
    for (const etape of etapes) {
      const found = titreEtapes.find(te => !result.find(r => r.id === te.id) && te.date === etape.date && te.typeId === etape.etapeTypeId && te.statutId === etape.etapeStatutId)

      if (found) {
        result.push(found)
      }
    }

    // On remet les brouillons à la bonne date, car la machine les a ignorés
    const etapesInBrouillon = titreEtapes.filter(({ isBrouillon }) => isBrouillon)
    if (isNotNullNorUndefinedNorEmpty(etapesInBrouillon)) {
      return [...result, ...etapesInBrouillon].sort((a, b) => {
        if (a.isBrouillon === ETAPE_IS_BROUILLON || b.isBrouillon === ETAPE_IS_BROUILLON) {
          return a.date.localeCompare(b.date)
        }

        return 0
      })
    }

    return result
  } else {
    return titreEtapes.slice().sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)

      if (dateA < dateB) return -1
      if (dateA > dateB) return 1

      const etapes = getEtapesTDE(titreTypeId, demarcheTypeId)

      const aTypeIndex = etapes.findIndex(e => e === a.typeId)
      const bTypeIndex = etapes.findIndex(e => e === b.typeId)

      if (aTypeIndex === -1 || bTypeIndex === -1) {
        console.warn(`${demarcheId}: les étapes ${a.typeId} ou ${b.typeId} ne devraient pas être possible pour une démarche de type ${demarcheTypeId}`)

        return a.ordre! - b.ordre!
      }

      return aTypeIndex - bTypeIndex
    })
  }
}
