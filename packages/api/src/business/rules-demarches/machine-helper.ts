import {
  Etape,
  eventFrom,
  armOctMachine,
  isEtat,
  isStatus,
  DBEtat,
  EVENTS,
  eventToEtat,
  Event,
  OctARMContext,
  XStateEvent
} from './arm/oct.machine'
import { interpret, State } from 'xstate'
import {
  DemarchesStatutsTypesIds,
  DemarcheStatutId,
  ITitreEtape
} from '../../types'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort'

// TODO 2022-05-18: il faudrait que le orderMachine retourne la solution la plus longue possible quand il n'y a pas de solution, pour aider au debug
export const orderMachine = (etapes: readonly Etape[]): readonly Etape[] => {
  if (isEtapesOk(etapes)) {
    return etapes
  } else {
    console.log("no solution found, that's strange")
  }
  const sortedEtapes = etapes
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  const solution = findSolution(sortedEtapes)

  if (solution === undefined) {
    return sortedEtapes
  }

  return solution
}

const findSolution = (
  etapes: readonly Etape[],
  temp: Etape[] = []
): readonly Etape[] | undefined => {
  if (!etapes.length) {
    return isEtapesOk(temp) ? temp : undefined
  }

  const etape = etapes[0]
  // Une étape en conflit avec une autre peut être:
  // - une étape à la même date
  const etapesAvecConflitPotentiel = etapes.filter(
    ({ date }) => date === etape.date
  )

  if (etapesAvecConflitPotentiel.length) {
    for (let i = 0; i < etapesAvecConflitPotentiel.length; i++) {
      const e = etapesAvecConflitPotentiel[i]
      const tmp = [...temp]
      tmp.push(e)
      const nextEtapes = etapes.filter(
        ({ date, typeId, statutId }) =>
          date !== e.date || typeId !== e.typeId || statutId !== e.statutId
      )
      if (isEtapesOk(tmp)) {
        const solution = findSolution(nextEtapes, tmp)
        if (solution) {
          return solution
        }
      }
    }
  } else {
    temp.push(etape)
    const nextEtapes = etapes.slice(1)
    const solution = findSolution(nextEtapes, temp)
    if (solution) {
      return solution
    }
  }

  return undefined
}

export const toMachineEtapes = (etapes: ITitreEtape[]): Etape[] => {
  return titreEtapesSortAscByOrdre(etapes).map(dbEtape =>
    toMachineEtape(dbEtape)
  )
}

export const toMachineEtape = (dbEtape: ITitreEtape): Etape => {
  let typeId
  if (isEtat(dbEtape.typeId)) {
    typeId = dbEtape.typeId
  } else {
    throw new Error(`l'état ${dbEtape.typeId} est inconnu`)
  }
  let statutId
  if (isStatus(dbEtape.statutId)) {
    statutId = dbEtape.statutId
  } else {
    console.log(
      `le status ${dbEtape.statutId} est inconnu, ${JSON.stringify(dbEtape)}`
    )
    throw new Error(
      `le status ${dbEtape.statutId} est inconnu, ${JSON.stringify(dbEtape)}`
    )
  }

  const machineEtape: Etape = {
    date: dbEtape.date,
    typeId,
    statutId
  }
  if (dbEtape.contenu) {
    machineEtape.contenu = dbEtape.contenu
  }

  return machineEtape
}

export const demarcheStatut = (etapes: readonly Etape[]): DemarcheStatutId => {
  const service = interpret(armOctMachine)

  service.start()
  for (let i = 0; i < etapes.length; i++) {
    const etapeAFaire = etapes[i]
    const event = eventFrom(etapeAFaire)
    if (!service.state.can(event)) {
      console.error(
        `impossible de trouver le demarcheStatus, cette liste d'étapes '${JSON.stringify(
          etapes
        )}' est incohérente à l'étape ${i + 1}`
      )

      return DemarchesStatutsTypesIds.Indetermine
    }

    service.send(event)
  }
  service.stop()

  return service.state.context.demarcheStatut
}

export const nextEtapes = (etapes: readonly Etape[]): DBEtat[] => {
  const service = interpret(armOctMachine)

  service.start()
  for (let i = 0; i < etapes.length; i++) {
    const etapeAFaire = etapes[i]
    const event = eventFrom(etapeAFaire)
    service.send(event)
  }

  const possibleEvents: Event[] = service.state.nextEvents.filter(
    (nextEvent: string): nextEvent is Event => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore

      if (EVENTS.includes(nextEvent)) {
        if (nextEvent === 'ACCEPTER_RDE') {
          return [{ type: 'ACCEPTER_RDE', franchissements: 2 }].some(e =>
            service.state.can(e)
          )
        }

        return service.state.can(nextEvent)
      }
      
return false
    }
  )

  const etats = possibleEvents.map(eventToEtat)

  return etats
}

/**
 * Cette function ne doit JAMAIS appeler orderMachine, car c'est orderMachine qui se sert de cette fonction.
 * Cette function ne fait que vérifier si les étapes qu'on lui donne sont valides dans l'ordre
 */
export const isEtapesOk = (
  sortedEtapes: readonly Etape[],
  initialState: State<OctARMContext, XStateEvent> | null = null
): boolean => {
  const service = interpret(armOctMachine)

  if (initialState === null) {
    service.start()
  } else {
    service.start(initialState)
  }
  for (let i = 0; i < sortedEtapes.length; i++) {
    const etapeAFaire = sortedEtapes[i]
    const event = eventFrom(etapeAFaire)

    if (!service.state.can(event)) {
      service.stop()

      return false
    }
    service.send(event)
  }
  service.stop()

  return true
}
