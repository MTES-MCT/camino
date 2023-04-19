import { CaminoCommonContext, Etape } from './machine-common.js'
import { EventObject } from 'xstate/lib/types.js'
import { interpret } from 'xstate'
import { CaminoMachine } from './machine-helper.js'
import { expect } from 'vitest'
import { CaminoDate } from 'camino-common/src/date.js'
interface CustomMatchers<R = unknown> {
  canOnlyTransitionTo<T extends EventObject>(context: { machine: CaminoMachine<any, T>; date: CaminoDate }, _events: T['type'][]): R
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
  canOnlyTransitionTo<T extends EventObject>(service: any, { machine, date }: { machine: CaminoMachine<any, T>; date: CaminoDate }, events: T['type'][]) {
    events.sort()
    const passEvents: EventObject['type'][] = service
      .getSnapshot()
      .nextEvents.filter((event: string) => machine.isEvent(event))
      .filter((event: EventObject['type']) => {
        const events = machine.toPotentialCaminoXStateEvent(event, date)

        return events.some(event => service.getSnapshot().can(event) && !service.getSnapshot().done)
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
  const service = interpret(machine.machine)

  service.start()

  for (let i = 0; i < etapes.length; i++) {
    const etapeAFaire = etapes[i]
    const event = machine.eventFrom(etapeAFaire)

    if (!service.getSnapshot().can(event) || service.getSnapshot().done) {
      throw new Error(
        `Error: cannot execute step: '${JSON.stringify(etapeAFaire)}' after '${JSON.stringify(
          etapes.slice(0, i).map(etape => etape.etapeTypeId + '_' + etape.etapeStatutId)
        )}'. The event ${JSON.stringify(event)} should be one of '${service
          .getSnapshot()
          .nextEvents.filter(event => machine.isEvent(event))
          .filter((event: EventObject['type']) => {
            const events = machine.toPotentialCaminoXStateEvent(event, etapeAFaire.date)

            return events.some(event => service.getSnapshot().can(event) && !service.getSnapshot().done)
          })}'`
      )
    }
    service.send(event)
  }

  return service
}

export const orderAndInterpretMachine = <T extends EventObject, C extends CaminoCommonContext>(machine: CaminoMachine<C, T>, etapes: readonly Etape[]) => {
  return interpretMachine(machine, machine.orderMachine(etapes))
}
