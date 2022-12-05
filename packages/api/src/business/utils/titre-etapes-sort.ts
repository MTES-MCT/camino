import { DemarcheId, IDemarcheType, ITitreEtape } from '../../types.js'
import {
  demarcheDefinitionFind,
  IDemarcheDefinition,
  IDemarcheDefinitionRestrictions,
  isDemarcheDefinitionMachine
} from '../rules-demarches/definitions.js'
import { toMachineEtapes } from '../rules-demarches/machine-common.js'

// classe les étapes selon leur ordre inverse: 3, 2, 1.
export const titreEtapesSortDescByOrdre = <
  T extends Pick<ITitreEtape, 'ordre'>
>(
  titreEtapes: T[]
): T[] => titreEtapes.slice().sort((a, b) => b.ordre! - a.ordre!)

// classe les étapes selon leur ordre: 1, 2, 3, …
export const titreEtapesSortAscByOrdre = <T extends Pick<ITitreEtape, 'ordre'>>(
  titreEtapes: T[]
): T[] => titreEtapes.slice().sort((a, b) => a.ordre! - b.ordre!)

// classe les étapes selon leur dates, ordre et etapesTypes.ordre le cas échéant
export const titreEtapesSortAscByDate = (
  titreEtapes: ITitreEtape[],
  demarcheId: DemarcheId,
  demarcheType?: IDemarcheType | null,
  titreTypeId?: string
): ITitreEtape[] => {
  let demarcheDefinitionRestrictions = undefined as
    | IDemarcheDefinitionRestrictions
    | undefined

  let demarcheDefinition = undefined as IDemarcheDefinition | undefined

  if (titreTypeId && demarcheType?.id) {
    demarcheDefinition = demarcheDefinitionFind(
      titreTypeId,
      demarcheType.id,
      titreEtapes,
      demarcheId
    )
  }
  if (isDemarcheDefinitionMachine(demarcheDefinition)) {
    const etapes = demarcheDefinition.machine.orderMachine(
      toMachineEtapes(titreEtapes)
    )
    if (!demarcheDefinition.machine.isEtapesOk(etapes)) {
      console.error(
        `impossible de trouver un ordre pour la démarche '${
          titreEtapes[0]?.titreDemarcheId
        }' où ces étapes sont valides ${JSON.stringify(etapes)}`
      )
    }

    return etapes
      .map(etape =>
        titreEtapes.find(
          te =>
            te.date === etape.date &&
            te.typeId === etape.etapeTypeId &&
            te.statutId === etape.etapeStatutId
        )
      )
      .filter(
        (te: ITitreEtape | undefined): te is ITitreEtape => te !== undefined
      )
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
          console.error(
            `impossible de trier l’étape ${b.id} car son type ${b.typeId} n’existe pas dans les définitions`
          )

          return -1
        }

        const aRestriction = demarcheDefinitionRestrictions[a.typeId]

        if (!aRestriction) {
          console.error(
            `impossible de trier l’étape ${a.id} car son type ${a.typeId} n’existe pas dans les définitions`
          )

          return -1
        }

        const bJusteApresA = bRestriction.justeApres
          .flat(2)
          .find(b => b.etapeTypeId === a.typeId)

        const aJusteApresB = aRestriction.justeApres
          .flat(2)
          .find(a => a.etapeTypeId === b.typeId)

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

      if (!demarcheType?.etapesTypes?.length) {
        return a.ordre! - b.ordre!
      }

      const aType = demarcheType.etapesTypes.find(
        et => et.id === a.typeId && et.titreTypeId === titreTypeId
      )

      const bType = demarcheType.etapesTypes.find(
        et => et.id === b.typeId && et.titreTypeId === titreTypeId
      )

      if (aType && bType) return aType.ordre - bType.ordre

      return a.ordre! - b.ordre!
    })
  }
}
