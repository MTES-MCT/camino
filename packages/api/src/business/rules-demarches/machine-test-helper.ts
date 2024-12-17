import { CaminoCommonContext, Etape } from './machine-common'
import { EventObject } from 'xstate'
import { CaminoMachine, getPhase } from './machine-helper'
import { CaminoDate, dateAddDays, toCaminoDate } from 'camino-common/src/date'
import { EtapeTypeEtapeStatutValidPair } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { isNotNullNorUndefined, onlyUnique } from 'camino-common/src/typescript-tools'
import { DemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'

const getEventsTree = <T extends EventObject, C extends CaminoCommonContext>(machine: CaminoMachine<C, T>, initDate: `${number}-${number}-${number}`, etapes: Etape[]): string[] => {
  const service = machine.interpretMachine([])
  const passEvents: T['type'][] = machine
    .possibleNextEvents(service.getSnapshot(), toCaminoDate(initDate))
    .map(({ type }) => type)
    .filter(onlyUnique)

  const steps = [
    {
      type: 'RIEN',
      visibilite: machine.demarcheStatut([]).publique ? 'publique' : 'confidentielle',
      phase: null,
      demarcheStatut: DemarchesStatuts[machine.demarcheStatut([]).demarcheStatut].nom,
      events: passEvents,
    },
    ...etapes.map((_etape, index) => {
      const etapesToLaunch = etapes.slice(0, index + 1)
      const service = machine.interpretMachine(etapesToLaunch)

      const passEvents: T['type'][] = machine
        .possibleNextEvents(service.getSnapshot(), etapesToLaunch[index].date)
        .map(({ type }) => type)
        .filter(onlyUnique)
      const event = machine.eventFrom(etapesToLaunch[etapesToLaunch.length - 1])
      const demarcheStatut = machine.demarcheStatut(etapesToLaunch)
      let date = null
      if ('demarcheDateEffet' in demarcheStatut && isNotNullNorUndefined(demarcheStatut.demarcheDateEffet)) {
        date = demarcheStatut.demarcheDateEffet
      }
      const phase = getPhase(demarcheStatut)
      if (isNotNullNorUndefined(phase)) {
        date = `[${phase.debut} -> ${phase.fin}]`
      }
      return {
        type: event.type,
        visibilite: demarcheStatut.publique ? 'publique' : 'confidentielle',
        phase: date,
        demarcheStatut: DemarchesStatuts[demarcheStatut.demarcheStatut].nom,
        events: passEvents,
      }
    }),
  ]

  const maxPadType = Math.max(...steps.map(({ type }) => type.length))

  return steps.flatMap(step => {
    return [`${step.type.padEnd(maxPadType, ' ')} (${step.visibilite.padEnd(14, ' ')}, ${step.demarcheStatut.padEnd(23, ' ')}) -> [${step.events.join(',')}]`, step.phase].filter(
      value => value !== null
    )
  })
}

// TODO 2024-11-25 ne devrait plus jamais retourner le service, mais plutôt la machine, les étapes, le getTree
export const setDateAndOrderAndInterpretMachine = <T extends EventObject, C extends CaminoCommonContext>(
  machine: CaminoMachine<C, T>,
  initDate: `${number}-${number}-${number}`,
  etapes: readonly (EtapeTypeEtapeStatutValidPair & Omit<Etape, 'date' | 'etapeTypeId' | 'etapeStatutId' | 'titreTypeId' | 'demarcheTypeId'> & { addDays?: number })[]
): {
  machine: CaminoMachine<C, T>
  dateFin: CaminoDate
  etapes: Etape[]
  tree: string[]
} => {
  const firstDate = toCaminoDate(initDate)
  let index = 0
  const fullEtapes = etapes.map(etape => {
    if ('addDays' in etape && isNotNullNorUndefined(etape.addDays)) {
      index += etape.addDays
    } else {
      index++
    }

    return { duree: 12, ...etape, date: dateAddDays(firstDate, index) }
  })

  machine.interpretMachine(fullEtapes)

  return { machine, dateFin: dateAddDays(firstDate, etapes.length), etapes: fullEtapes, tree: getEventsTree(machine, initDate, fullEtapes) }
}
