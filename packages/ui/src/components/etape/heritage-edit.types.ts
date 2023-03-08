import { CaminoDate } from 'camino-common/src/date'
import { Etape } from 'camino-common/src/etape'

export type EtapeHeritageProps = keyof Omit<Etape, 'incertitudes' | 'type' | 'heritageProps' | 'contenu' | 'date'>

// TODO 2022-11-16 ça devrait être cette définition, cf heritage-edit.vue
// export type EtapeHeritage<
//   T extends EtapeHeritageProps
// > = {
//   type: { nom: string }
//   date: CaminoDate
//   incertitudes: Record<T, boolean>
// } & Record<T, unknown>

export type EtapeHeritage = {
  type: { nom: string }
  date: CaminoDate
  incertitudes: { [k in EtapeHeritageProps]?: boolean }
} & { [k in EtapeHeritageProps]?: unknown }
