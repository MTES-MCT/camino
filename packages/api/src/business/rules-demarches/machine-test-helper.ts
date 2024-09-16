import { CaminoCommonContext, Etape } from './machine-common'
import { Actor, EventObject, createActor } from 'xstate'
import { CaminoMachine } from './machine-helper'
import { expect } from 'vitest'
import { CaminoDate, dateAddDays, toCaminoDate } from 'camino-common/src/date'
import { EtapeTypeEtapeStatutValidPair } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { isNotNullNorUndefined, onlyUnique } from 'camino-common/src/typescript-tools'
import { DemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'
interface CustomMatchers<R = unknown> {
  canOnlyTransitionTo<T extends EventObject, C extends CaminoCommonContext>(context: { machine: CaminoMachine<C, T>; date: CaminoDate }, _events: T['type'][]): R
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Expect extends CustomMatchers {}

    interface Matchers<R> extends CustomMatchers<R> {}

    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

expect.extend({
  canOnlyTransitionTo<T extends EventObject, C extends CaminoCommonContext>(
    service: Actor<CaminoMachine<C, T>['machine']>,
    { machine, date }: { machine: CaminoMachine<C, T>; date: CaminoDate },
    events: T['type'][]
  ) {
    events = events.toSorted()
    const passEvents = machine
      .possibleNextEvents(service.getSnapshot(), date)
      .map(({ type }) => type)
      .filter(onlyUnique)

    if (passEvents.length !== events.length || passEvents.some((entry, index) => entry !== events[index])) {
      return {
        pass: false,
        message: () => `Expected possible transitions to be ['${events.join("','")}'] but were ['${passEvents.join("','")}']`,
      }
    }

    return {
      pass: true,
      message: () => 'OK',
    }
  },
})

export const interpretMachine = <T extends EventObject, C extends CaminoCommonContext>(machine: CaminoMachine<C, T>, etapes: readonly Etape[]): Actor<(typeof machine)['machine']> => {
  const service = createActor(machine.machine, {})

  service.start()

  for (let i = 0; i < etapes.length; i++) {
    const etapeAFaire = etapes[i]
    const event = machine.eventFrom(etapeAFaire)

    if (!service.getSnapshot().can(event) || service.getSnapshot().status === 'done') {
      throw new Error(
        `Error: cannot execute step: '${JSON.stringify(etapeAFaire)}' after '${JSON.stringify(
          etapes.slice(0, i).map(etape => etape.etapeTypeId + '_' + etape.etapeStatutId)
        )}'. The event ${JSON.stringify(event)} should be one of '${machine
          .possibleNextEvents(service.getSnapshot(), etapeAFaire.date)
          .map(({ type }) => type)
          .filter(onlyUnique)}'`
      )
    }
    service.send(event)
  }

  return service
}

export const getEventsTree = <T extends EventObject, C extends CaminoCommonContext>(
  machine: CaminoMachine<C, T>,
  initDate: `${number}-${number}-${number}`,
  etapes: readonly (EtapeTypeEtapeStatutValidPair & Omit<Etape, 'date' | 'etapeTypeId' | 'etapeStatutId' | 'titreTypeId' | 'demarcheTypeId'> & { addDays?: number })[]
): string[] => {
  const { service, dateFin } = setDateAndOrderAndInterpretMachine(machine, initDate, [])
  const passEvents: T['type'][] = machine
    .possibleNextEvents(service.getSnapshot(), dateFin)
    .map(({ type }) => type)
    .filter(onlyUnique)

  const steps = [
    {
      type: 'RIEN',
      visibilite: service.getSnapshot().context.visibilite,
      demarcheStatut: DemarchesStatuts[service.getSnapshot().context.demarcheStatut].nom,
      events: passEvents,
    },
    ...etapes.map((_etape, index) => {
      const etapesToLaunch = etapes.slice(0, index + 1)
      const { service, dateFin, etapes: etapesWithDates } = setDateAndOrderAndInterpretMachine(machine, initDate, etapesToLaunch)

      const passEvents: T['type'][] = machine
        .possibleNextEvents(service.getSnapshot(), dateFin)
        .map(({ type }) => type)
        .filter(onlyUnique)
      const event = machine.eventFrom(etapesWithDates[etapesWithDates.length - 1])

      return {
        type: event.type,
        visibilite: service.getSnapshot().context.visibilite,
        demarcheStatut: DemarchesStatuts[service.getSnapshot().context.demarcheStatut].nom,
        events: passEvents,
      }
    }),
  ]

  const maxPadType = Math.max(...steps.map(({ type }) => type.length))

  return steps.map(step => {
    return `${step.type.padEnd(maxPadType, ' ')} (${step.visibilite.padEnd(14, ' ')}, ${step.demarcheStatut.padEnd(23, ' ')}) -> [${step.events.join(',')}]`
  })
}

export const setDateAndOrderAndInterpretMachine = <T extends EventObject, C extends CaminoCommonContext>(
  machine: CaminoMachine<C, T>,
  initDate: `${number}-${number}-${number}`,
  etapes: readonly (EtapeTypeEtapeStatutValidPair & Omit<Etape, 'date' | 'etapeTypeId' | 'etapeStatutId' | 'titreTypeId' | 'demarcheTypeId'> & { addDays?: number })[]
): { service: Actor<(typeof machine)['machine']>; dateFin: CaminoDate; etapes: Etape[]; machine: CaminoMachine<C, T> } => {
  const firstDate = toCaminoDate(initDate)
  let index = 0
  const fullEtapes = etapes.map(etape => {
    if ('addDays' in etape && isNotNullNorUndefined(etape.addDays)) {
      index += etape.addDays
    } else {
      index++
    }

    return { ...etape, date: dateAddDays(firstDate, index) }
  })
  const service = orderAndInterpretMachine(machine, fullEtapes)

  return { service, dateFin: dateAddDays(firstDate, etapes.length), etapes: fullEtapes, machine }
}
export const orderAndInterpretMachine = <T extends EventObject, C extends CaminoCommonContext>(
  machine: CaminoMachine<C, T>,
  etapes: readonly Omit<Etape, 'titreTypeId' | 'demarcheTypeId'>[]
): Actor<(typeof machine)['machine']> => {
  return interpretMachine(machine, machine.orderMachine(etapes))
}
