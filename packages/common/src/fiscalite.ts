import { permissionCheck, Role } from './roles'

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
        role?: Role
      }
    | undefined
    | null,
  _entrepriseId: string
): boolean => {
  if (user) {
    if (permissionCheck(user.role, ['super'])) {
      return true
    }
  }

  return false
}
