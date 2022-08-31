import {
  BaseActionObject,
  interpret,
  ResolveTypegenMeta,
  ServiceMap,
  State,
  StateMachine,
  TypegenDisabled
} from 'xstate'
import { EventObject, StateSchema } from 'xstate/lib/types'
import {
  CaminoCommonContext,
  Etape,
  Intervenant,
  intervenants,
  tags
} from './machine-common'
import {
  DemarchesStatutsIds,
  DemarcheStatutId
} from 'camino-common/src/static/demarchesStatuts'

// FIXME CaminoState always any?
export abstract class CaminoMachine<
  CaminoContext extends CaminoCommonContext,
  CaminoState extends StateSchema,
  CaminoEvent extends EventObject
> {
  public readonly machine: StateMachine<
    CaminoContext,
    CaminoState,
    CaminoEvent,
    { value: any; context: CaminoContext },
    BaseActionObject,
    ServiceMap,
    ResolveTypegenMeta<
      TypegenDisabled,
      CaminoEvent,
      BaseActionObject,
      ServiceMap
    >
  >

  protected constructor(
    machine: StateMachine<
      CaminoContext,
      CaminoState,
      CaminoEvent,
      { value: any; context: CaminoContext },
      BaseActionObject,
      ServiceMap,
      ResolveTypegenMeta<
        TypegenDisabled,
        CaminoEvent,
        BaseActionObject,
        ServiceMap
      >
    >
  ) {
    this.machine = machine
  }

  abstract eventFrom(etape: Etape): CaminoEvent
  abstract isEvent(event: string): event is CaminoEvent['type']
  abstract toPotentialCaminoXStateEvent(
    event: CaminoEvent['type']
  ): CaminoEvent[]

  abstract caminoXStateEventToEtapes(event: CaminoEvent): Omit<Etape, 'date'>[]

  public orderMachine(etapes: readonly Etape[]): readonly Etape[] {
    const sortedEtapes = etapes
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))

    const solution = this.findSolution(sortedEtapes)

    if (solution === undefined) {
      return sortedEtapes
    }

    return solution
  }

  private findSolution(
    etapes: readonly Etape[],
    temp: Etape[] = []
  ): readonly Etape[] | undefined {
    if (!etapes.length) {
      return this.isEtapesOk(temp) ? temp : undefined
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
          ({ date, etapeTypeId, etapeStatutId }) =>
            date !== e.date ||
            etapeTypeId !== e.etapeTypeId ||
            etapeStatutId !== e.etapeStatutId
        )
        if (this.isEtapesOk(tmp)) {
          const solution = this.findSolution(nextEtapes, tmp)
          if (solution) {
            return solution
          }
        }
      }
    } else {
      temp.push(etape)
      const nextEtapes = etapes.slice(1)
      const solution = this.findSolution(nextEtapes, temp)
      if (solution) {
        return solution
      }
    }

    return undefined
  }

  /**
   * Cette function ne doit JAMAIS appeler orderMachine, car c'est orderMachine qui se sert de cette fonction.
   * Cette function ne fait que vérifier si les étapes qu'on lui donne sont valides dans l'ordre
   */
  public isEtapesOk(
    sortedEtapes: readonly Etape[],
    initialState: State<CaminoContext, CaminoEvent> | null = null
  ): boolean {
    if (sortedEtapes.length) {
      for (let i = 1; i < sortedEtapes.length; i++) {
        if (sortedEtapes[i - 1].date > sortedEtapes[i].date) {
          return false
        }
      }
    }
    const result = this.goTo(sortedEtapes, initialState)

    return result.valid
  }

  private goTo(
    etapes: readonly Etape[],
    initialState: State<CaminoContext, CaminoEvent> | null = null
  ):
    | { valid: false; etapeIndex: number }
    | {
        valid: true
        state: State<
          CaminoContext,
          CaminoEvent,
          any,
          { value: any; context: CaminoContext },
          ResolveTypegenMeta<
            TypegenDisabled,
            CaminoEvent,
            BaseActionObject,
            ServiceMap
          >
        >
      } {
    const service = interpret(this.machine)

    if (initialState === null) {
      service.start()
    } else {
      service.start(initialState)
    }
    for (let i = 0; i < etapes.length; i++) {
      const etapeAFaire = etapes[i]
      const event = this.eventFrom(etapeAFaire)
      if (!service.state.can(event)) {
        service.stop()

        return { valid: false, etapeIndex: i }
      }
      service.send(event)
    }

    const state = service.state
    service.stop()

    return { valid: true, state }
  }

  public demarcheStatut(etapes: readonly Etape[]): {
    demarcheStatut: DemarcheStatutId
    publique: boolean
  } {
    const value = this.goTo(etapes)
    if (!value.valid) {
      console.error(
        `impossible de trouver le demarcheStatus, cette liste d'étapes '${JSON.stringify(
          etapes
        )}' est incohérente à l'étape ${value.etapeIndex + 1}`
      )

      return {
        demarcheStatut: DemarchesStatutsIds.Indetermine,
        publique: false
      }
    } else {
      return {
        demarcheStatut: value.state.context.demarcheStatut,
        publique: value.state.context.visibilite === 'publique'
      }
    }
  }

  private assertGoTo(
    etapes: readonly Etape[],
    initialState: State<CaminoContext, CaminoEvent> | null = null
  ) {
    const value = this.goTo(etapes, initialState)
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

  public whoIsBlocking(etapes: readonly Etape[]): Intervenant[] {
    const state = this.assertGoTo(etapes)

    const responsables: string[] = [...state.tags]

    return intervenants.filter(r => responsables.includes(tags.responsable[r]))
  }

  public possibleNextEtapes(etapes: readonly Etape[]): Omit<Etape, 'date'>[] {
    const state = this.assertGoTo(etapes)

    return state.nextEvents
      .filter(this.isEvent)
      .flatMap(event => {
        const events = this.toPotentialCaminoXStateEvent(event)

        return events
          .filter(event => state.can(event))
          .flatMap(this.caminoXStateEventToEtapes)
      })
      .filter(event => event !== undefined)
  }
}
