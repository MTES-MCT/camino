import { CaminoCommonContext, Etape } from './machine-common.js'
import { Actor, EventObject, createActor } from 'xstate'
import { CaminoMachine, getNextEvents } from './machine-helper.js'
import { expect } from 'vitest'
import { CaminoDate, dateAddDays, toCaminoDate } from 'camino-common/src/date.js'
import { EtapeTypeEtapeStatutValidPair } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools.js'
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
    events.sort()
    const passEvents: (typeof events)[number][] = getNextEvents(service.getSnapshot())
      .filter((event: string) => machine.isEvent(event))
      .filter((event: (typeof events)[number]) => {
        const events = machine.toPotentialCaminoXStateEvent(event, date)

        return events.some(event => service.getSnapshot().can(event) && service.getSnapshot().status !== 'done')
      })

    passEvents.sort()
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

export const interpretMachine = <T extends EventObject, C extends CaminoCommonContext>(machine: CaminoMachine<C, T>, etapes: readonly Etape[]) => {
  const service = createActor(machine.machine)

  service.start()

  for (let i = 0; i < etapes.length; i++) {
    const etapeAFaire = etapes[i]
    const event = machine.eventFrom(etapeAFaire)

    if (!service.getSnapshot().can(event) || service.getSnapshot().status === 'done') {
      throw new Error(
        `Error: cannot execute step: '${JSON.stringify(etapeAFaire)}' after '${JSON.stringify(
          etapes.slice(0, i).map(etape => etape.etapeTypeId + '_' + etape.etapeStatutId)
        )}'. The event ${JSON.stringify(event)} should be one of '${getNextEvents(service.getSnapshot())
          .filter(event => machine.isEvent(event))
          .filter((event: EventObject['type']) => {
            const events = machine.toPotentialCaminoXStateEvent(event, etapeAFaire.date)

            return events.some(event => service.getSnapshot().can(event) && service.getSnapshot().status !== 'done')
          })
          .sort()}'`
      )
    }
    service.send(event)
  }

  return service
}

export const setDateAndOrderAndInterpretMachine = <T extends EventObject, C extends CaminoCommonContext>(
  machine: CaminoMachine<C, T>,
  initDate: `${number}-${number}-${number}`,
  etapes: readonly (EtapeTypeEtapeStatutValidPair & Omit<Etape, 'date' | 'etapeTypeId' | 'etapeStatutId'> & { addDays?: number })[]
) => {
  const firstDate = toCaminoDate(initDate)
  let index = 1
  const fullEtapes = etapes.map(etape => {
    if ('addDays' in etape && isNotNullNorUndefined(etape.addDays)) {
      index += etape.addDays
    } else {
      index++
    }

    return { ...etape, date: dateAddDays(firstDate, index) }
  })
  const service = orderAndInterpretMachine(machine, fullEtapes)

  return { service, dateFin: dateAddDays(firstDate, etapes.length), etapes: fullEtapes }
}
export const orderAndInterpretMachine = <T extends EventObject, C extends CaminoCommonContext>(machine: CaminoMachine<C, T>, etapes: readonly Etape[]) => {
  return interpretMachine(machine, machine.orderMachine(etapes))
}
