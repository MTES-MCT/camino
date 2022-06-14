import { isSuper, Role } from './roles'

export interface Fiscalite {
  redevanceCommunale: number
  redevanceDepartementale: number
  taxeAurifereGuyane: number
  totalInvestissementsDeduits: number
}

export const fiscaliteVisible = (
  user:
    | {
        entreprises?: { id: string }[] | null
        role: Role
      }
    | undefined
    | null,
  _entrepriseId: string
): boolean => {
  if (user) {
    if (isSuper(user)) {
      return true
    }
  }

  return false
}
