import {
  armOctMachine,
  DBEtat,
  Etape,
  Event,
  eventFrom,
  eventToEtat,
  isEvent,
  OctARMContext,
  tags,
  toPotentialXStateEvent,
  XStateEvent,
  xStateEventToEtape
} from './arm/oct.machine'
import { interpret, State, StateFrom } from 'xstate'
import {
  DemarchesStatutsTypesIds,
  DemarcheStatutId,
  ITitreEtape
} from '../../types'
import { titreEtapesSortAscByOrdre } from '../utils/titre-etapes-sort'
import { isStatut } from 'camino-common/src/static/etapesStatuts'
import { isEtapeTypeId } from 'camino-common/src/static/etapesTypes'

// TODO 2022-05-18: il faudrait que le orderMachine retourne la solution la plus longue possible quand il n'y a pas de solution, pour aider au debug
// orderMachine devrait retourner un tuple {ok: bool, etapes: Etape[]} pour éviter de faire isEtapesOk(orderMachine( qui ne sert à rien car orderMachine sait si les étapes sont ok
export const orderMachine = (etapes: readonly Etape[]): readonly Etape[] => {
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
  if (isEtapeTypeId(dbEtape.typeId)) {
    typeId = dbEtape.typeId
  } else {
    throw new Error(`l'état ${dbEtape.typeId} est inconnu`)
  }
  let statutId
  if (isStatut(dbEtape.statutId)) {
    statutId = dbEtape.statutId
  } else {
    console.error(
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
  const value = goTo(etapes)
  if (!value.valid) {
    console.error(
      `impossible de trouver le demarcheStatus, cette liste d'étapes '${JSON.stringify(
        etapes
      )}' est incohérente à l'étape ${value.etapeIndex + 1}`
    )

    return DemarchesStatutsTypesIds.Indetermine
  } else {
    return value.state.context.demarcheStatut
  }
}

export const nextEtapes = (etapes: readonly Etape[]): DBEtat[] => {
  const state = assertGoTo(etapes)

  const possibleEvents: Event[] = state.nextEvents
    .filter(isEvent)
    .filter(event => {
      const events = toPotentialXStateEvent(event)

      return events.some(event => state.can(event))
    })

  return possibleEvents.map(eventToEtat)
}

type Intervenant = keyof typeof tags['responsable']

const intervenants = Object.keys(tags.responsable) as Array<
  keyof typeof tags.responsable
>

const goTo = (
  etapes: readonly Etape[],
  initialState: State<OctARMContext, XStateEvent> | null = null
):
  | { valid: false; etapeIndex: number }
  | { valid: true; state: StateFrom<typeof armOctMachine> } => {
  const service = interpret(armOctMachine)

  if (initialState === null) {
    service.start()
  } else {
    service.start(initialState)
  }
  for (let i = 0; i < etapes.length; i++) {
    const etapeAFaire = etapes[i]
    const event = eventFrom(etapeAFaire)
    if (!service.state.can(event)) {
      service.stop()

      return { valid: false, etapeIndex: i }
    }
    service.send(event)
  }

  service.stop()

  return { valid: true, state: service.state }
}

const assertGoTo = (
  etapes: readonly Etape[],
  initialState: State<OctARMContext, XStateEvent> | null = null
) => {
  const value = goTo(etapes, initialState)
  if (!value.valid) {
    throw new Error(
      `Les étapes '${JSON.stringify(
        etapes
      )}' sont invalides à partir de l’étape ${value.etapeIndex}`
    )
  } else {
    return value.state
  }
}

export const whoIsBlocking = (etapes: readonly Etape[]): Intervenant[] => {
  const state = assertGoTo(etapes)

  const responsables: string[] = [...state.tags]

  return intervenants.filter(r => responsables.includes(tags.responsable[r]))
}

export const possibleNextEtapes = (
  etapes: readonly Etape[]
): Omit<Etape, 'date'>[] => {
  const state = assertGoTo(etapes)

  return state.nextEvents
    .filter(isEvent)
    .flatMap(event => {
      const events = toPotentialXStateEvent(event)

      return events.filter(event => state.can(event)).map(xStateEventToEtape)
    })
    .filter(event => event !== undefined)
}

/**
 * Cette function ne doit JAMAIS appeler orderMachine, car c'est orderMachine qui se sert de cette fonction.
 * Cette function ne fait que vérifier si les étapes qu'on lui donne sont valides dans l'ordre
 */
export const isEtapesOk = (
  sortedEtapes: readonly Etape[],
  initialState: State<OctARMContext, XStateEvent> | null = null
): boolean => {
  if (sortedEtapes.length) {
    for (let i = 1; i < sortedEtapes.length; i++) {
      if (sortedEtapes[i - 1].date > sortedEtapes[i].date) {
        return false
      }
    }
  }
  const result = goTo(sortedEtapes, initialState)

  return result.valid
}
