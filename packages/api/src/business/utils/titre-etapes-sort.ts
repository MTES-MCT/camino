import { DemarcheId, ITitreEtape } from '../../types.js'
import { demarcheDefinitionFind, IDemarcheDefinitionRestrictions, isDemarcheDefinitionMachine } from '../rules-demarches/definitions.js'
import { toMachineEtapes } from '../rules-demarches/machine-common.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { getEtapesTDE } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/index.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'

// classe les étapes selon leur ordre inverse: 3, 2, 1.
export const titreEtapesSortDescByOrdre = <T extends Pick<ITitreEtape, 'ordre'>>(titreEtapes: T[]): T[] => titreEtapes.slice().sort((a, b) => b.ordre! - a.ordre!)

// classe les étapes selon leur ordre: 1, 2, 3, …
export const titreEtapesSortAscByOrdre = <T extends Pick<ITitreEtape, 'ordre'>>(titreEtapes: T[]): T[] => titreEtapes.slice().sort((a, b) => a.ordre! - b.ordre!)

// classe les étapes selon leur dates, ordre et etapesTypes.ordre le cas échéant
export const titreEtapesSortAscByDate = <T extends Pick<ITitreEtape, 'ordre' | 'typeId' | 'statutId' | 'date' | 'contenu' | 'titreDemarcheId'>>(
  titreEtapes: T[],
  demarcheId: DemarcheId,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId
): T[] => {
  let demarcheDefinitionRestrictions = undefined as IDemarcheDefinitionRestrictions | undefined

  const demarcheDefinition = demarcheDefinitionFind(titreTypeId, demarcheTypeId, titreEtapes, demarcheId)
  if (isDemarcheDefinitionMachine(demarcheDefinition)) {
    const etapes = demarcheDefinition.machine.orderMachine(toMachineEtapes(titreEtapes))
    if (!demarcheDefinition.machine.isEtapesOk(etapes)) {
      console.error(`impossible de trouver un ordre pour la démarche '${titreEtapes[0]?.titreDemarcheId}' où ces étapes sont valides ${JSON.stringify(etapes)}`)
    }

    return etapes.map(etape => titreEtapes.find(te => te.date === etape.date && te.typeId === etape.etapeTypeId && te.statutId === etape.etapeStatutId)).filter(isNotNullNorUndefined)
  } else {
    demarcheDefinitionRestrictions = demarcheDefinition?.restrictions

    return titreEtapes.slice().sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)

      if (dateA < dateB) return -1
      if (dateA > dateB) return 1

      // si les deux étapes ont la même date

      // on utilise l'arbre pour trouver quelle étape provoque l’autre

      if (demarcheDefinition && demarcheDefinitionRestrictions) {
        const bRestriction = demarcheDefinitionRestrictions[b.typeId]

        if (!bRestriction) {
          console.error(`${demarcheId}: impossible de trier l’étape car son type ${b.typeId} n’existe pas dans les définitions`)

          return -1
        }

        const aRestriction = demarcheDefinitionRestrictions[a.typeId]

        if (!aRestriction) {
          console.error(`${demarcheId}: impossible de trier l’étape car son type ${a.typeId} n’existe pas dans les définitions`)

          return -1
        }

        const bJusteApresA = bRestriction.justeApres.flat(2).find(b => b.etapeTypeId === a.typeId)

        const aJusteApresB = aRestriction.justeApres.flat(2).find(a => a.etapeTypeId === b.typeId)

        if (bJusteApresA && !aJusteApresB) {
          return -1
        }

        if (aJusteApresB && !bJusteApresA) {
          return 1
        }

        if (aRestriction.final) {
          return 1
        }

        if (bRestriction.final) {
          return -1
        }
      }

      // on utilise l'ordre du type d'étape

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
