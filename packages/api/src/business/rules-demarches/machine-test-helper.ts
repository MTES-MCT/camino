import { Etape } from './machine-common'
import { EventObject } from 'xstate/lib/types'
import { interpret } from 'xstate'
import { CaminoMachine } from './machine-helper'

interface CustomMatchers<R = unknown> {
  canOnlyTransitionTo<T extends EventObject>(
    machine: CaminoMachine<any, T>,
    _events: EventObject['type'][]
  ): R
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
  canOnlyTransitionTo<T extends EventObject>(
    service: any,
    machine: CaminoMachine<any, T>,
    events: T['type'][]
  ) {
    events.sort()
    const passEvents: EventObject['type'][] = service.state.nextEvents
      .filter((event: string) => machine.isEvent(event))
      .filter((event: EventObject['type']) => {
        const events = machine.toPotentialCaminoXStateEvent(event)

        return events.some(event => service.state.can(event))
      })

    passEvents.sort()
    if (
      passEvents.length !== events.length ||
      passEvents.some((entry, index) => entry !== events[index])
    ) {
      return {
        pass: false,
        message: () =>
          `Expected possible transitions to be ['${events.join(
            "','"
          )}'] but were ['${passEvents.join("','")}']`
      }
    }

    return {
      pass: true,
      message: () => 'OK'
    }
  }
})

export const interpretMachine = <T extends EventObject>(
  machine: CaminoMachine<any, T>,
  etapes: readonly Etape[]
) => {
  const service = interpret(machine.machine)

  service.start()

  for (let i = 0; i < etapes.length; i++) {
    const etapeAFaire = etapes[i]
    const event = machine.eventFrom(etapeAFaire)

    if (!service.state.can(event)) {
      throw new Error(
        `Error: cannot execute step: '${JSON.stringify(
          etapeAFaire
        )}' after '${JSON.stringify(
          etapes
            .slice(0, i)
            .map(etape => etape.etapeTypeId + '_' + etape.etapeStatutId)
        )}'. The event ${JSON.stringify(
          event
        )} should be one of '${service.state.nextEvents
          .filter(event => machine.isEvent(event))
          .filter((event: EventObject['type']) => {
            const events = machine.toPotentialCaminoXStateEvent(event)

            return events.some(event => service.state.can(event))
          })}'`
      )
    }
    service.send(event)
  }

  return service
}

export const orderAndInterpretMachine = <T extends EventObject>(
  machine: CaminoMachine<any, T>,
  etapes: readonly Etape[]
) => {
  return interpretMachine(machine, machine.orderMachine(etapes))
}
