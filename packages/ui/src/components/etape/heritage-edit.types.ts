import { CaminoDate } from 'camino-common/src/date'
import { EtapeHeritageProps } from 'camino-common/src/heritage'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'

// TODO 2023-03-15 ça ne marche pas tel quel en tsx, à revoir plus tard, cette modification est au milieu de l'update des dépendances, donc j'ai laissé comme ça
// TODO 2022-11-16 ça devrait être cette définition, cf heritage-edit
// export type EtapeHeritage<
//   T extends EtapeHeritageProps
// > = {
//   type: { nom: string }
//   date: CaminoDate
// } & Record<T, unknown>

export type EtapeHeritage = {
  typeId: EtapeTypeId
  date: CaminoDate
} & { [k in EtapeHeritageProps]?: unknown }
