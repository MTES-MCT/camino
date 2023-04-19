import { BaseActionObject, interpret, ResolveTypegenMeta, ServiceMap, State, StateMachine, TypegenDisabled } from 'xstate'
import { EventObject } from 'xstate/lib/types.js'
import { CaminoCommonContext, DBEtat, Etape, Intervenant, intervenants, tags } from './machine-common.js'
import { DemarchesStatutsIds, DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts.js'
import { CaminoDate } from 'camino-common/src/date.js'

type CaminoState<CaminoContext extends CaminoCommonContext, CaminoEvent extends EventObject> = State<
  CaminoContext,
  CaminoEvent,
  any,
  { value: any; context: CaminoContext },
  ResolveTypegenMeta<TypegenDisabled, CaminoEvent, BaseActionObject, ServiceMap>
>
export abstract class CaminoMachine<CaminoContext extends CaminoCommonContext, CaminoEvent extends EventObject> {
  public readonly machine: StateMachine<
    CaminoContext,
    any,
    CaminoEvent,
    { value: any; context: CaminoContext },
    BaseActionObject,
    ServiceMap,
    ResolveTypegenMeta<TypegenDisabled, CaminoEvent, BaseActionObject, ServiceMap>
  >

  private readonly trad: { [key in CaminoEvent['type']]: { db: DBEtat; mainStep: boolean } }
  private readonly events: Array<CaminoEvent['type']>

  protected constructor(
    machine: StateMachine<
      CaminoContext,
      any,
      CaminoEvent,
      { value: any; context: CaminoContext },
      BaseActionObject,
      ServiceMap,
      ResolveTypegenMeta<TypegenDisabled, CaminoEvent, BaseActionObject, ServiceMap>
    >,
    trad: { [key in CaminoEvent['type']]: { db: DBEtat; mainStep: boolean } }
  ) {
    this.machine = machine
    this.trad = trad
    this.events = Object.keys(trad) as Array<CaminoEvent['type']>
  }

  abstract eventFrom(etape: Etape): CaminoEvent

  protected caminoXStateEventToEtapes(event: CaminoEvent): Omit<Etape, 'date'>[] {
    const dbEtat: { db: DBEtat; mainStep: boolean } = this.trad[event.type as CaminoEvent['type']]

    return Object.values(dbEtat.db).map(({ etapeTypeId, etapeStatutId }) => ({
      etapeTypeId,
      etapeStatutId,
    }))
  }

  // visibleForTesting
  public toPotentialCaminoXStateEvent(event: CaminoEvent['type'], _date: CaminoDate): CaminoEvent[] {
    // related to https://github.com/microsoft/TypeScript/issues/46497  https://github.com/microsoft/TypeScript/issues/40803 :(
    // @ts-ignore
    return [{ type: event }]
  }

  // visibleForTesting
  public isEvent(event: string): event is CaminoEvent['type'] {
    return this.events.includes(event)
  }

  public orderMachine(etapes: readonly Etape[]): readonly Etape[] {
    const sortedEtapes = etapes.slice().sort((a, b) => a.date.localeCompare(b.date))

    const solution = this.findSolution(sortedEtapes)

    if (solution === undefined) {
      return sortedEtapes
    }

    return solution
  }

  private findSolution(etapes: readonly Etape[], temp: Etape[] = []): readonly Etape[] | undefined {
    if (!etapes.length) {
      return this.isEtapesOk(temp) ? temp : undefined
    }

    const etape = etapes[0]
    // Une étape en conflit avec une autre peut être:
    // - une étape à la même date
    const etapesAvecConflitPotentiel = etapes.filter(({ date }) => date === etape.date)

    if (etapesAvecConflitPotentiel.length) {
      for (let i = 0; i < etapesAvecConflitPotentiel.length; i++) {
        const e = etapesAvecConflitPotentiel[i]
        const tmp = [...temp]
        tmp.push(e)
        const index = etapes.findIndex(({ date, etapeTypeId, etapeStatutId }) => date === e.date && etapeTypeId === e.etapeTypeId && etapeStatutId === e.etapeStatutId)
        if (index < 0) {
          throw new Error(`On n'arrive pas à trouver l'étape ${e} qu'on avait juste avant ${etapes}, cas impossible ?`)
        }
        const nextEtapes = etapes.filter((_element, elementIndex) => index !== elementIndex)

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
  public isEtapesOk(sortedEtapes: readonly Etape[], initialState: CaminoState<CaminoContext, CaminoEvent> | null = null): boolean {
    if (sortedEtapes.length) {
      for (let i = 1; i < sortedEtapes.length; i++) {
        if (sortedEtapes[i - 1].date > sortedEtapes[i].date) {
          return false
        }
      }
    }
    try {
      const result = this.goTo(sortedEtapes, initialState)

      return result.valid
    } catch (e) {
      console.warn(e)

      return false
    }
  }

  private goTo(
    etapes: readonly Etape[],
    initialState: CaminoState<CaminoContext, CaminoEvent> | null = null
  ):
    | { valid: false; etapeIndex: number }
    | {
        valid: true
        state: CaminoState<CaminoContext, CaminoEvent>
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
      if (!service.getSnapshot().can(event) || service.getSnapshot().done) {
        service.stop()

        return { valid: false, etapeIndex: i }
      }
      service.send(event)
    }

    const state = service.getSnapshot()
    service.stop()

    return { valid: true, state }
  }

  public demarcheStatut(etapes: readonly Etape[]): {
    demarcheStatut: DemarcheStatutId
    publique: boolean
  } {
    const value = this.goTo(etapes)
    if (!value.valid) {
      console.error(`impossible de trouver le demarcheStatus, cette liste d'étapes '${JSON.stringify(etapes)}' est incohérente à l'étape ${value.etapeIndex + 1}`)

      return {
        demarcheStatut: DemarchesStatutsIds.Indetermine,
        publique: false,
      }
    } else {
      return {
        demarcheStatut: value.state.context.demarcheStatut,
        publique: value.state.context.visibilite === 'publique',
      }
    }
  }

  private assertGoTo(etapes: readonly Etape[], initialState: CaminoState<CaminoContext, CaminoEvent> | null = null): CaminoState<CaminoContext, CaminoEvent> {
    const value = this.goTo(etapes, initialState)
    if (!value.valid) {
      throw new Error(`Les étapes '${JSON.stringify(etapes)}' sont invalides à partir de l’étape ${value.etapeIndex}`)
    } else {
      return value.state
    }
  }

  public whoIsBlocking(etapes: readonly Etape[]): Intervenant[] {
    const state = this.assertGoTo(etapes)

    const responsables: string[] = [...state.tags]

    return intervenants.filter(r => responsables.includes(tags.responsable[r]))
  }

  public possibleNextEtapes(etapes: readonly Etape[], date: CaminoDate): Omit<Etape, 'date'>[] {
    const state = this.assertGoTo(etapes)

    return state.nextEvents
      .filter((event: string) => this.isEvent(event))
      .flatMap(event => {
        const events = this.toPotentialCaminoXStateEvent(event, date)

        return events.filter(event => state.can(event) && !state.done).flatMap(event => this.caminoXStateEventToEtapes(event))
      })
      .filter(event => event !== undefined)
  }

  public getNextMainSteps(etapes: Etape[], date: CaminoDate): Omit<Etape, 'date'>[] {
    const nextSteps = this.possibleNextEtapes(etapes, date)

    return nextSteps.filter(nextStep => {
      const eventType: CaminoEvent['type'] = this.eventFrom({ ...nextStep, date }).type

      return this.trad[eventType].mainStep
    })
  }
}
