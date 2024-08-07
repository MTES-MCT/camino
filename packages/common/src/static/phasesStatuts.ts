import { CaminoDate } from '../date'
import { Definition } from '../definition'
import { Couleur } from './couleurs'

const PHASES_STATUTS_IDS = {
  Echu: 'ech',
  Valide: 'val',
} as const

type PhaseStatutId = (typeof PHASES_STATUTS_IDS)[keyof typeof PHASES_STATUTS_IDS]

interface PhaseDefinition<T> extends Omit<Definition<T>, 'description'> {
  couleur: Couleur
}

// TODO 2023-10-24 utiliser les couleurs de Sarah
const phaseStatuts: { [key in PhaseStatutId]: PhaseDefinition<key> } = {
  ech: { id: 'ech', nom: 'échu', couleur: 'neutral' },
  val: { id: 'val', nom: 'valide', couleur: 'success' },
} as const

export const phasesStatuts = Object.values(phaseStatuts)

export const isDemarchePhaseValide = (date: CaminoDate, demarche?: { demarcheDateDebut?: CaminoDate | null; demarcheDateFin?: CaminoDate | null } | null): boolean =>
  getPhaseStatutId(date, demarche) === PHASES_STATUTS_IDS.Valide

const getPhaseStatutId = (date: CaminoDate, demarche?: { demarcheDateDebut?: CaminoDate | null; demarcheDateFin?: CaminoDate | null } | null): PhaseStatutId | null => {
  if (!demarche?.demarcheDateDebut) {
    return null
  }

  if (demarche.demarcheDateFin && date > demarche.demarcheDateFin) {
    return PHASES_STATUTS_IDS.Echu
  } else {
    return PHASES_STATUTS_IDS.Valide
  }
}
