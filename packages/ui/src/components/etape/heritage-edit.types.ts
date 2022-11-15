import { CaminoDate } from 'camino-common/src/date'
import { Etape } from 'camino-common/src/etape'

export type EtapeHeritage<
  T extends keyof Omit<
    Etape,
    'incertitudes' | 'type' | 'heritageProps' | 'contenu' | 'date'
  >
> = {
  type: { nom: string }
  date: CaminoDate
  incertitudes: Record<T, boolean>
} & Record<T, unknown>
