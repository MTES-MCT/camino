export const FREQUENCES_IDS = {
  ANNUEL: 'ann',
  MENSUEL: 'men',
  TRIMESTRIEL: 'tri'
} as const

interface Definition<T> {
  id: T
  nom: string
  periodes_nom: string
  values: string[]
}
export type FrequenceId = typeof FREQUENCES_IDS[keyof typeof FREQUENCES_IDS]
export const Frequences: { [key in FrequenceId]: Definition<key> } = {
  ann: {
    id: 'ann',
    nom: 'annuel',
    periodes_nom: 'annees',
    values: ['année']
  },
  men: {
    id: 'men',
    nom: 'mensuel',
    periodes_nom: 'mois',
    values: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  },
  tri: {
    id: 'tri',
    nom: 'trimestriel',
    periodes_nom: 'trimestres',
    values: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre']
  }
}

export const getPeriode = (frequenceId: FrequenceId | undefined, periodeId: number): string => {
  if (frequenceId) {
    return Frequences[frequenceId].values[periodeId - 1] ?? ''
  }

  return ''
}
