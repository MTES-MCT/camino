export const FREQUENCES_IDS = {
  ANNUEL: 'ann',
  MENSUEL: 'men',
  TRIMESTRIEL: 'tri'
} as const

interface Definition<T> {
  id: T
  nom: string
  periodes_nom: string
  values: readonly string[]
}
export type FrequenceId = (typeof FREQUENCES_IDS)[keyof typeof FREQUENCES_IDS]
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
} as const

export const getPeriode = (frequenceId: FrequenceId | undefined, periodeId: number): string => {
  if (frequenceId) {
    return Frequences[frequenceId].values[periodeId - 1] ?? ''
  }

  return ''
}

const assertPeriodeId = (frequenceId: FrequenceId, periodeId: number): void => {
  if (periodeId <= 0 || periodeId > Frequences[frequenceId].values.length) {
    throw new Error(`Période ${periodeId} impossible (doit être entre 1 et ${Frequences[frequenceId].values.length} pour la fréquence ${Frequences[frequenceId].id})`)
  }
}

function assertFrequence(frequenceId: FrequenceId | undefined): asserts frequenceId is FrequenceId {
  if (!frequenceId) {
    throw new Error('Fréquence inconnue')
  }
}

export const getNumberOfMonths = (frequenceId: FrequenceId | undefined): number => {
  assertFrequence(frequenceId)
  const periodes = Frequences[frequenceId].values

  return 12 / periodes.length
}

export const getMonth = (frequenceId: FrequenceId | undefined, periodeId: number): number => {
  assertFrequence(frequenceId)
  assertPeriodeId(frequenceId, periodeId)

  return (periodeId - 1) * getNumberOfMonths(frequenceId)
}
