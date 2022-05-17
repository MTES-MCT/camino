import {
  Etape,
  Event,
  eventFrom,
  EVENTS,
  armOctMachine
} from './arm/oct.machine'
import { interpret } from 'xstate'
import { orderMachine } from './machine-helper'

interface CustomMatchers<R = unknown> {
  canOnlyTransitionTo(_events: Event[]): R
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
  canOnlyTransitionTo(service, events: Event[]) {
    events.sort()
    const passEvents: Event[] = service.state.nextEvents.filter(
      (nextEvent: string): nextEvent is Event => {
        // TODO 2022-05-18: il faut vérifier pour les événements avec DATA (ACCEPTER_RDE,...) toutes les possibilité (pour pouvoir utiliser service.state.can())
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return EVENTS.includes(nextEvent)
      }
    )
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

export const interpretMachine = (etapes: readonly Etape[]) => {
  const service = interpret(armOctMachine)

  service.start()
  for (let i = 0; i < etapes.length; i++) {
    const etapeAFaire = etapes[i]
    const event = eventFrom(etapeAFaire)

    if (!service.state.can(event)) {
      throw new Error(
        `Error: cannot execute step: '${JSON.stringify(
          etapeAFaire
        )}' after '${JSON.stringify(
          etapes.slice(0, i).map(etape => etape.typeId + '_' + etape.statutId)
        )}'. The event ${JSON.stringify(
          event
        )} should be one of '${service.state.nextEvents.filter(nextEvent => {
          // TODO 2022-05-18: il faut vérifier pour les événements avec DATA (ACCEPTER_RDE,...) toutes les possibilité (pour pouvoir utiliser service.state.can())
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return EVENTS.includes(nextEvent) && service.state.can(nextEvent)
        })}'`
      )
    }
    service.send(event)
  }

  service.stop()

  return service
}

export const orderAndInterpretMachine = (etapes: readonly Etape[]) => {
  const sortedEtapes = etapes
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  return interpretMachine(orderMachine(sortedEtapes))
}
