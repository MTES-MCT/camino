import { isSuper, User } from './roles'

export interface Fiscalite {
  redevanceCommunale: number
  redevanceDepartementale: number
  taxeAurifereGuyane: number
  totalInvestissementsDeduits: number
}

export const fiscaliteVisible = (user: User, _entrepriseId: string): boolean =>
  isSuper(user)
