import { Definition } from '../definition.js'
import {z} from 'zod'
const IDS = ['EUR', 'FRF', 'XPF'] as const
export const DEVISES_IDS = {
  Euros: 'EUR',
  Francs: 'FRF',
  FrancsPacifique: 'XPF',
} as const

export const deviseIdValidator = z.enum(IDS)

export type DeviseId = z.infer<typeof deviseIdValidator>
export type Devise<T = DeviseId> = Omit<Definition<T>, 'description'>
export const Devises: { [key in DeviseId]: Devise<key> } = {
  EUR: { id: 'EUR', nom: 'Euros', ordre: 1 },
  XPF: { id: 'XPF', nom: 'Francs Pacifique', ordre: 2 },
  FRF: { id: 'FRF', nom: 'Francs', ordre: 3 },
}

export const sortedDevises = Object.values(Devises).sort((a, b) => a.ordre - b.ordre)
