import { Definition } from '../definition'

export const DEVISES_IDS = {
  Euros: 'EUR',
  Francs: 'FRF',
  FrancsPacifique: 'XPF'
} as const

export type DeviseId = typeof DEVISES_IDS[keyof typeof DEVISES_IDS]
export type Devise<T = DeviseId> = Omit<Definition<T>, 'description'>
export const Devises: { [key in DeviseId]: Devise<key> } = {
  EUR: {
    id: 'EUR',
    nom: 'Euros',
    ordre: 1
  },
  XPF: {
    id: 'XPF',
    nom: 'Francs Pacifique',
    ordre: 2
  },
  FRF: {
    id: 'FRF',
    nom: 'Francs',
    ordre: 3
  }
}

export const sortedDevises = Object.values(Devises).sort(
  (a, b) => a.ordre - b.ordre
)
