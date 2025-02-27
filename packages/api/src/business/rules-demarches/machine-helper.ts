import { AnyMachineSnapshot, createActor, EventObject, MachineSnapshot, StateMachine, Actor } from 'xstate'
import { CaminoCommonContext, CaminoMachineDateDebut, CaminoMachineDateFin, DBEtat, Etape, Intervenant, intervenants, isDemarcheDateFinInfinie, tags } from './machine-common'
import { DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { CaminoDate, dateAddMonths, isBefore, toCaminoDate } from 'camino-common/src/date'
import { isNotNullNorUndefined, isNullOrUndefined, OmitDistributive, onlyUnique } from 'camino-common/src/typescript-tools'
import { DemarchesTypesOctroi, DemarchesTypesProlongation, DemarcheTypeId, DemarcheTypeAnnulation, isDemarcheTypeAnnulation, isDemarcheTypeWithPhase } from 'camino-common/src/static/demarchesTypes'
const DATE_PAR_DEFAUT_TITRE_INFINI = toCaminoDate('2018-12-31')
type CaminoState<CaminoContext extends CaminoCommonContext, CaminoEvent extends EventObject> = MachineSnapshot<CaminoContext, CaminoEvent, any, any, any, any, any, any>

type DemarcheStatusPhase = {
  demarcheStatut: DemarcheStatutId
  publique: boolean
  demarcheTypeId: DemarchesTypesOctroi[number] | DemarchesTypesProlongation[number]
  demarcheDateDebut: CaminoMachineDateDebut
  demarcheDateFin: CaminoMachineDateFin
}

type DemarcheStatusAnnulation = {
  demarcheStatut: DemarcheStatutId
  publique: boolean
  demarcheTypeId: DemarcheTypeAnnulation
  demarcheDateEffet: CaminoDate | null
}

type DemarcheStatusOther = {
  demarcheStatut: DemarcheStatutId
  publique: boolean
  demarcheTypeId: Omit<DemarcheTypeId, DemarchesTypesOctroi | DemarchesTypesProlongation | DemarcheTypeAnnulation>
}

export type DemarcheStatus = DemarcheStatusPhase | DemarcheStatusAnnulation | DemarcheStatusOther

export const getPhase = (demarcheStatus: DemarcheStatus): { debut: CaminoDate | null; fin: CaminoDate | null } | null => {
  if ('demarcheDateDebut' in demarcheStatus) {
    const demarcheDateDebut = demarcheStatus.demarcheDateDebut.dateDebut ?? demarcheStatus.demarcheDateDebut.dateEtape
    let dateFin = demarcheStatus.demarcheDateFin.dateFin
    if (isNullOrUndefined(dateFin) && isNotNullNorUndefined(demarcheDateDebut) && isNotNullNorUndefined(demarcheStatus.demarcheDateFin.duree)) {
      dateFin = dateAddMonths(demarcheDateDebut, demarcheStatus.demarcheDateFin.duree)
    }

    if (isNullOrUndefined(demarcheDateDebut) && isNullOrUndefined(dateFin)) {
      return null
    }

    return {
      debut: demarcheDateDebut,
      fin: dateFin,
    }
  }
  return null
}

export abstract class CaminoMachine<CaminoContext extends CaminoCommonContext, CaminoEvent extends EventObject> {
  public readonly machine: StateMachine<CaminoContext, CaminoEvent, any, any, any, any, any, any, any, any, any, EventObject, any, any>

  private readonly trad: { [key in CaminoEvent['type']]: { db: DBEtat; mainStep: boolean } }
  private readonly events: Array<CaminoEvent['type']>

  protected constructor(
    machine: StateMachine<CaminoContext, CaminoEvent, any, any, any, any, any, any, any, any, any, EventObject, any, any>,
    trad: { [key in CaminoEvent['type']]: { db: DBEtat; mainStep: boolean } }
  ) {
    this.machine = machine
    this.trad = trad
    this.events = Object.keys(trad) as Array<CaminoEvent['type']>
  }

  public eventFrom(etape: Etape): CaminoEvent {
    const entries = Object.entries(this.trad).filter((entry): entry is [CaminoEvent['type'], { db: DBEtat; mainStep: boolean }] => this.events.includes(entry[0]))

    const entry = entries.find(([_key, { db: dbEtat }]) => {
      return Object.values(dbEtat).some(dbEtatSingle => dbEtatSingle.etapeTypeId === etape.etapeTypeId && dbEtatSingle.etapeStatutId === etape.etapeStatutId)
    })

    if (entry) {
      const eventFromEntr = entry[0]

      return { ...this.eventFromEntry(eventFromEntr, etape), date: etape.date, status: etape.etapeStatutId, dateDebut: etape.dateDebut, dateFin: etape.dateFin, duree: etape.duree }
    }
    throw new Error(`no event from ${JSON.stringify(etape)}`)
  }

  protected eventFromEntry(entryType: CaminoEvent['type'], _etape: Etape): CaminoEvent {
    // @ts-ignore FIXMACHINE à voir si on repasse dessus ou si on laisse le ts-ignore
    const result: CaminoEvent = { type: entryType }

    return result
  }

  protected caminoXStateEventToEtapes(event: CaminoEvent): (OmitDistributive<Etape, 'date' | 'titreTypeId' | 'demarcheTypeId'> & { mainStep: boolean; type: CaminoEvent['type'] })[] {
    const dbEtat: { db: DBEtat; mainStep: boolean } = this.trad[event.type as CaminoEvent['type']]

    return Object.values(dbEtat.db).map(({ etapeTypeId, etapeStatutId }) => ({
      etapeTypeId,
      etapeStatutId,
      mainStep: dbEtat.mainStep,
      ...event,
    }))
  }

  // visibleForTesting
  public toPotentialCaminoXStateEvent(event: CaminoEvent['type'], date: CaminoDate): CaminoEvent[] {
    // related to https://github.com/microsoft/TypeScript/issues/46497  https://github.com/microsoft/TypeScript/issues/40803 :(
    // @ts-ignore
    return [{ type: event, date: date, dateFin: date }]
  }

  // visibleForTesting
  public isEvent(event: string): event is CaminoEvent['type'] {
    return this.events.includes(event)
  }

  public orderMachine(etapes: readonly Etape[]): readonly Etape[] {
    const sortedEtapes = etapes.toSorted((a, b) => a.date.localeCompare(b.date))

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
  public isEtapesOk(sortedEtapes: readonly Etape[]): boolean {
    if (sortedEtapes.length) {
      for (let i = 1; i < sortedEtapes.length; i++) {
        if (sortedEtapes[i - 1].date > sortedEtapes[i].date) {
          return false
        }
      }
    }
    try {
      const result = this.goTo(sortedEtapes)

      return result.valid
    } catch (e) {
      console.warn(e)

      return false
    }
  }

  private goTo(etapes: readonly Etape[]):
    | { valid: false; etapeIndex: number }
    | {
        valid: true
        state: CaminoState<CaminoContext, CaminoEvent>
      } {
    const service = createActor(this.machine, {})

    service.subscribe({
      error(_err) {
        // on catch les erreurs sinon on a des trucs bizarre dans la console, mais le `can` plus bas fait déjà le taf de savoir si un événement est valide ou non
      },
    })

    service.start()
    try {
      for (let i = 0; i < etapes.length; i++) {
        const etapeAFaire = etapes[i]
        const event = this.eventFrom(etapeAFaire)

        if (!service.getSnapshot().can(event) || service.getSnapshot().status === 'done') {
          service.stop()

          return { valid: false, etapeIndex: i }
        }
        service.send(event)
      }
    } finally {
      service.stop()
    }

    const state = service.getSnapshot()

    return { valid: true, state }
  }

  // visibleForTesting
  public interpretMachine = (etapes: readonly Etape[]): Actor<StateMachine<CaminoContext, CaminoEvent, any, any, any, any, any, any, any, any, any, EventObject, any, any>> => {
    const service = createActor(this.machine, {})

    service.start()

    for (let i = 0; i < etapes.length; i++) {
      const etapeAFaire = etapes[i]
      const event = this.eventFrom(etapeAFaire)

      if (!service.getSnapshot().can(event) || service.getSnapshot().status === 'done') {
        throw new Error(
          `Error: cannot execute step: '${JSON.stringify(etapeAFaire)}' after '${JSON.stringify(
            etapes.slice(0, i).map(etape => etape.etapeTypeId + '_' + etape.etapeStatutId)
          )}'. The event ${JSON.stringify(event)} should be one of '${this.possibleNextEvents(service.getSnapshot(), etapeAFaire.date)
            .map(({ type }) => type)
            .filter(onlyUnique)
            .toSorted()}'`
        )
      }
      service.send(event)
    }

    return service
  }

  public demarcheStatut(etapes: readonly Etape[]): DemarcheStatus {
    const value = this.goTo(etapes)
    if (!value.valid) {
      throw new Error(`impossible de trouver le demarcheStatus, cette liste d'étapes '${JSON.stringify(etapes)}' est incohérente à l'étape ${value.etapeIndex + 1} pour la machine ${this.machine.id}`)
    } else {
      const demarcheStatut = value.state.context.demarcheStatut
      const publique = value.state.context.visibilite === 'publique'

      if (isDemarcheTypeWithPhase(value.state.context.demarcheTypeId)) {
        if (
          isDemarcheDateFinInfinie(value.state.context.demarcheDates.fin) &&
          isBefore(DATE_PAR_DEFAUT_TITRE_INFINI, value.state.context.demarcheDates.debut.dateDebut ?? value.state.context.demarcheDates.debut.dateEtape ?? DATE_PAR_DEFAUT_TITRE_INFINI)
        ) {
          throw new Error('La date de début de la démarche est APRÈS sa date de fin')
        }
        return {
          demarcheStatut,
          publique,
          demarcheTypeId: value.state.context.demarcheTypeId,
          demarcheDateFin: isDemarcheDateFinInfinie(value.state.context.demarcheDates.fin) ? { dateFin: DATE_PAR_DEFAUT_TITRE_INFINI, duree: null } : value.state.context.demarcheDates.fin,
          demarcheDateDebut: value.state.context.demarcheDates.debut,
        }
      } else if (isDemarcheTypeAnnulation(value.state.context.demarcheTypeId)) {
        return {
          demarcheStatut,
          publique,
          demarcheTypeId: value.state.context.demarcheTypeId,
          demarcheDateEffet: value.state.context.demarcheDates.effet,
        }
      }

      return {
        demarcheStatut,
        publique,
        demarcheTypeId: value.state.context.demarcheTypeId,
      }
    }
  }

  private assertGoTo(etapes: readonly Etape[]): CaminoState<CaminoContext, CaminoEvent> {
    const value = this.goTo(etapes)
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

  // visibleForTesting
  public possibleNextEvents(state: CaminoState<CaminoContext, CaminoEvent>, date: CaminoDate): CaminoEvent[] {
    return getNextEvents(state)
      .filter((event: string) => this.isEvent(event))
      .flatMap(event => {
        const events = this.toPotentialCaminoXStateEvent(event, date)

        return events.filter(event => {
          return state.can(event) && state.status !== 'done'
        })
      })
      .filter(isNotNullNorUndefined)
      .toSorted((a, b) => a.type.localeCompare(b.type))
  }

  public possibleNextEtapes(etapes: readonly Etape[], date: CaminoDate): (OmitDistributive<Etape, 'date' | 'titreTypeId' | 'demarcheTypeId'> & { mainStep: boolean; type: CaminoEvent['type'] })[] {
    const state = this.assertGoTo(etapes)

    if (isNotNullNorUndefined(state)) {
      return this.possibleNextEvents(state, date)
        .flatMap(this.caminoXStateEventToEtapes.bind(this))
        .filter(isNotNullNorUndefined)
        .toSorted((a, b) => a.etapeTypeId.localeCompare(b.etapeTypeId))
    }

    return []
  }
}

function getNextEvents(snapshot: AnyMachineSnapshot): string[] {
  return [...new Set([...snapshot._nodes.flatMap(sn => sn.ownEvents)])]
}
